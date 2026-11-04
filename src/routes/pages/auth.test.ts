import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Hono } from 'hono';
import { createUser, findUserByEmail } from '#src/db/users/index.js';
import { createLoginToken, createSession, findSessionUserId } from '#src/db/sessions/index.js';
import { registerAuthRoutes } from './auth.js';
import { registerAppRoutes } from './app.js';
import { registerLoginRoutes } from './login.js';
import { createTestMwaState, MwaHono, setupHonoState } from '#src/state.js';

const state = createTestMwaState({});

const app: MwaHono = new Hono();
setupHonoState(app, state);

registerAuthRoutes(app);
registerAppRoutes(app);
registerLoginRoutes(app);

function sessionCookie(res: Response): string {
    const setCookie = res.headers.get('set-cookie') ?? '';
    const match = setCookie.match(/mwa-session=([^;]+)/);
    assert.ok(match, 'expected an mwa-session cookie');
    return match[1];
}

function postVerify(challengeId: string, code: string, extra: Record<string, string> = {}) {
    return app.request('/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', cookie: 'mwa-language=en' },
        body: new URLSearchParams({ challenge_id: challengeId, code, ...extra }).toString(),
    });
}

function postTokenVerify(token: string, extra: Record<string, string> = {}, cookie?: string) {
    return app.request('/auth/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            cookie: `mwa-language=en${cookie ? `; ${cookie}` : ''}`,
        },
        body: new URLSearchParams({ token, ...extra }).toString(),
    });
}

describe('GET /auth/verify — link path', () => {
    it('shows a confirm form without spending the token', async () => {
        const user = createUser(state, 'verify@example.com', 'verify_u');
        const { token } = createLoginToken(state, user.email);
        const previousToken = createSession(state, user.id);

        // prefetches only render the form — no cookie, token unconsumed
        for (let i = 0; i < 2; i++) {
            const res = await app.request(`/auth/verify?token=${token}`, {
                headers: { cookie: 'mwa-language=en' },
            });
            assert.equal(res.status, 200);
            assert.equal(res.headers.get('set-cookie'), null);
            const html = await res.text();
            assert.match(html, /name="token"/);
            assert.match(html, /Continue/);
        }

        assert.equal(findSessionUserId(state, previousToken), user.id);
        const res = await postTokenVerify(token, {}, `mwa-session=${previousToken}`);
        assert.equal(findSessionUserId(state, previousToken), null);
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/app');

        const cookie = sessionCookie(res);
        assert.match(res.headers.get('set-cookie') ?? '', /HttpOnly/);
        assert.match(res.headers.get('set-cookie') ?? '', /SameSite=Lax/i);

        const authed = await app.request('/app', { headers: { cookie: `mwa-session=${cookie}` } });
        assert.equal(authed.status, 200);

        assert.ok(findUserByEmail(state, 'verify@example.com')!.emailVerifiedAt instanceof Date);
    });

    it('creates an account for a new email and lands on /app', async () => {
        const { token } = createLoginToken(state, 'fresh.face@example.com');
        const res = await postTokenVerify(token);
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/app');

        const user = findUserByEmail(state, 'fresh.face@example.com');
        assert.ok(user, 'account should exist after verify');
        assert.equal(user.role, 'user');
        assert.ok(user.emailVerifiedAt instanceof Date);
        // pseudonym derived by hashing the email — the local part stays hidden
        assert.match(user.username, /^[a-z]+_[a-z]+_\d{2}/);
        assert.ok(!user.username.includes('fresh'));

        const cookie = sessionCookie(res);
        const authed = await app.request('/app', { headers: { cookie: `mwa-session=${cookie}` } });
        assert.equal(authed.status, 200);
    });

    it('rejects replayed, forged, and missing tokens', async () => {
        const { token } = createLoginToken(state, 'replay@example.com');
        await postTokenVerify(token);

        for (const res of [
            await postTokenVerify(token), // replay
            await postTokenVerify('forged'),
            await app.request('/auth/verify', { headers: { cookie: 'mwa-language=en' } }), // no token at all
        ]) {
            assert.equal(res.status, 200);
            assert.match(await res.text(), /expired or already used/);
            assert.equal(res.headers.get('set-cookie'), null);
        }

        // a forged GET still renders the confirm form — the POST decides
        const get = await app.request('/auth/verify?token=forged');
        assert.equal(get.status, 200);
        assert.match(await get.text(), /name="token"/);
    });

    it('honours an allowlisted goto and rejects foreign ones', async () => {
        createUser(state, 'goto2@example.com', 'goto2_u');
        for (const [goto, expected] of [
            ['/app/gambling', '/app/gambling'],
            ['https://evil.example/', '/app'],
            ['/app/../admin/../..', '/'],
        ]) {
            const { token } = createLoginToken(state, 'goto2@example.com');
            const res = await postTokenVerify(token, { goto });
            assert.equal(res.headers.get('location'), expected);
        }
    });

    it('carries the goto through the confirm form', async () => {
        createUser(state, 'goto4@example.com', 'goto4_u');
        const { token } = createLoginToken(state, 'goto4@example.com');
        const res = await app.request(
            `/auth/verify?token=${token}&goto=${encodeURIComponent('/app/gambling')}`,
        );
        assert.equal(res.status, 200);
        const html = await res.text();
        assert.match(html, /name="goto" value="\/app\/gambling"/);
    });
});

describe('POST /auth/verify — code path', () => {
    it('redeems a code and logs in', async () => {
        createUser(state, 'coder@example.com', 'coder_u');
        const { code, challengeId } = createLoginToken(state, 'coder@example.com');
        const res = await postVerify(challengeId, code);
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/app');
        sessionCookie(res);
    });

    it('honours the form goto and rejects foreign ones', async () => {
        createUser(state, 'goto3@example.com', 'goto3_u');
        for (const [goto, expected] of [
            ['/app/gambling', '/app/gambling'],
            ['https://evil.example/', '/app'],
        ]) {
            const { code, challengeId } = createLoginToken(state, 'goto3@example.com');
            const res = await postVerify(challengeId, code, { goto });
            assert.equal(res.headers.get('location'), expected);
        }
    });

    it('rejects a wrong code with a retry message', async () => {
        const { challengeId, code } = createLoginToken(state, 'coder2@example.com');
        const res = await postVerify(challengeId, 'not-a-code');
        assert.equal(res.status, 200);
        const html = await res.text();
        assert.match(html, /Wrong code/);
        assert.match(html, new RegExp(`name="challenge_id" value="${challengeId}"`));
        assert.equal((await postVerify(challengeId, code)).status, 302);
        assert.equal(res.headers.get('set-cookie'), null);
    });

    it('rejects when no live token exists', async () => {
        const res = await postVerify('unknown-challenge', 'ABCDEFGH');
        assert.match(await res.text(), /expired or already used/);
    });

    it('a code also creates accounts for new emails', async () => {
        const { code, challengeId } = createLoginToken(state, 'signup-code@example.com');
        const res = await postVerify(challengeId, code);
        assert.equal(res.headers.get('location'), '/app');
        assert.ok(findUserByEmail(state, 'signup-code@example.com'));
    });
});

describe('logout', () => {
    it('deletes the session server-side', async () => {
        const user = createUser(state, 'out@example.com', 'out_u');
        const { token } = createLoginToken(state, user.email);
        const verify = await postTokenVerify(token);
        const cookie = sessionCookie(verify);

        const logout = await app.request('/app', {
            method: 'POST',
            headers: { cookie: `mwa-session=${cookie}` },
        });
        assert.equal(logout.status, 303);

        // Same cookie value is now worthless.
        const after = await app.request('/app', { headers: { cookie: `mwa-session=${cookie}` } });
        assert.equal(after.status, 303);
        assert.match(after.headers.get('location') ?? '', /\/login\?goto=/);
    });
});
