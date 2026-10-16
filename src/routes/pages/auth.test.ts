import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Hono } from 'hono';
import { createUser, findUserByEmail } from '#src/db/users.js';
import { createLoginToken } from '#src/db/sessions.js';
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

function postVerify(email: string, code: string, extra: Record<string, string> = {}) {
    return app.request('/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, code, ...extra }).toString(),
    });
}

describe('GET /auth/verify — link path', () => {
    it('logs in an existing user and redirects to /app', async () => {
        const user = createUser(state, 'verify@example.com', 'verify_u');
        const { token } = createLoginToken(state, user.email);

        const res = await app.request(`/auth/verify?token=${token}`);
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/app');

        const cookie = sessionCookie(res);
        assert.match(res.headers.get('set-cookie') ?? '', /HttpOnly/);
        assert.match(res.headers.get('set-cookie') ?? '', /SameSite=Lax/i);

        const authed = await app.request('/app', { headers: { cookie: `mwa-session=${cookie}` } });
        assert.equal(authed.status, 200);

        assert.ok(findUserByEmail(state, 'verify@example.com')!.emailVerifiedAt instanceof Date);
    });

    it('creates an account for a new email and lands on /app/account', async () => {
        const { token } = createLoginToken(state, 'fresh.face@example.com');
        const res = await app.request(`/auth/verify?token=${token}`);
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/app/account');

        const user = findUserByEmail(state, 'fresh.face@example.com');
        assert.ok(user, 'account should exist after verify');
        assert.equal(user.role, 'user');
        assert.ok(user.emailVerifiedAt instanceof Date);
        assert.equal(user.username, 'fresh_face'); // derived from the local part

        const cookie = sessionCookie(res);
        const authed = await app.request('/app', { headers: { cookie: `mwa-session=${cookie}` } });
        assert.equal(authed.status, 200);
    });

    it('rejects replayed, forged, and missing tokens', async () => {
        const { token } = createLoginToken(state, 'replay@example.com');
        await app.request(`/auth/verify?token=${token}`);

        for (const url of [
            `/auth/verify?token=${token}`, // replay
            '/auth/verify?token=forged',
            '/auth/verify',
        ]) {
            const res = await app.request(url);
            assert.equal(res.status, 200);
            assert.match(await res.text(), /expired or already used/);
            assert.equal(res.headers.get('set-cookie'), null);
        }
    });

    it('honours an allowlisted goto and rejects foreign ones', async () => {
        createUser(state, 'goto2@example.com', 'goto2_u');
        for (const [goto, expected] of [
            ['/app/casino', '/app/casino'],
            ['https://evil.example/', '/app'],
            ['/app/../admin/../..', '/app'],
        ]) {
            const { token } = createLoginToken(state, 'goto2@example.com');
            const res = await app.request(
                `/auth/verify?token=${token}&goto=${encodeURIComponent(goto)}`,
            );
            assert.equal(res.headers.get('location'), expected);
        }
    });
});

describe('POST /auth/verify — code path', () => {
    it('redeems a code and logs in', async () => {
        createUser(state, 'coder@example.com', 'coder_u');
        const { code } = createLoginToken(state, 'coder@example.com');
        const res = await postVerify('coder@example.com', code);
        assert.equal(res.status, 302);
        assert.equal(res.headers.get('location'), '/app');
        sessionCookie(res);
    });

    it('honours the form goto and rejects foreign ones', async () => {
        createUser(state, 'goto3@example.com', 'goto3_u');
        for (const [goto, expected] of [
            ['/app/casino', '/app/casino'],
            ['https://evil.example/', '/app'],
        ]) {
            const { code } = createLoginToken(state, 'goto3@example.com');
            const res = await postVerify('goto3@example.com', code, { goto });
            assert.equal(res.headers.get('location'), expected);
        }
    });

    it('rejects a wrong code with a retry message', async () => {
        createLoginToken(state, 'coder2@example.com');
        const res = await postVerify('coder2@example.com', 'ZZZZZZZZ');
        assert.equal(res.status, 200);
        assert.match(await res.text(), /Wrong code/);
        assert.equal(res.headers.get('set-cookie'), null);
    });

    it('rejects when no live token exists', async () => {
        const res = await postVerify('ghost@example.com', 'ABCDEFGH');
        assert.match(await res.text(), /expired or already used/);
    });

    it('a code also creates accounts for new emails', async () => {
        const { code } = createLoginToken(state, 'signup-code@example.com');
        const res = await postVerify('signup-code@example.com', code);
        assert.equal(res.headers.get('location'), '/app/account');
        assert.ok(findUserByEmail(state, 'signup-code@example.com'));
    });
});

describe('logout', () => {
    it('deletes the session server-side', async () => {
        const user = createUser(state, 'out@example.com', 'out_u');
        const { token } = createLoginToken(state, user.email);
        const verify = await app.request(`/auth/verify?token=${token}`);
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
