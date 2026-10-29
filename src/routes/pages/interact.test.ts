import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Hono } from 'hono';
import { createUser } from '#src/db/users/index.js';
import { createSession } from '#src/db/sessions/index.js';
import { getOrCreateInteractToken } from '#src/db/interactions/index.js';
import { registerAppRoutes } from './app.js';
import { createTestMwaState, MwaHono, setupHonoState } from '#src/state.js';

const state = createTestMwaState({});

const app: MwaHono = new Hono();
setupHonoState(app, state);
registerAppRoutes(app);

function authCookie(userId: number) {
    return { cookie: `mwa-session=${createSession(state, userId)}` };
}

function promote(userId: number, role: string) {
    state.db.prepare(`UPDATE users SET role = ? WHERE id = ?`).run(role, userId);
}

describe('GET /app — personal QR', () => {
    it('renders the interact url and a qr svg', async () => {
        const user = createUser(state, 'qr@example.com', 'qr_user');
        const res = await app.request('/app', { headers: authCookie(user.id) });
        assert.equal(res.status, 200);
        const html = await res.text();
        const token = getOrCreateInteractToken(state, user.id);
        assert.match(html, new RegExp(`/app/interact/${token}`));
        assert.match(html, /<svg/);
    });
});

describe('GET /app/interact/:token', () => {
    it('redirects logged-out scanners to login', async () => {
        const owner = createUser(state, 'owner1@example.com', 'owner1');
        const token = getOrCreateInteractToken(state, owner.id);
        const res = await app.request(`/app/interact/${token}`);
        assert.equal(res.status, 303);
        assert.match(res.headers.get('location') ?? '', /\/login\?goto=%2Fapp%2Finteract%2F/);
    });

    it('404s on a bad token', async () => {
        const scanner = createUser(state, 'scan1@example.com', 'scan1');
        const res = await app.request('/app/interact/forged', {
            headers: authCookie(scanner.id),
        });
        assert.equal(res.status, 404);
    });

    it('shows the target and send-money to a regular user, but not profile detail', async () => {
        const owner = createUser(state, 'target@example.com', 'target_user');
        const scanner = createUser(state, 'scan2@example.com', 'scan2');
        const token = getOrCreateInteractToken(state, owner.id);

        const res = await app.request(`/app/interact/${token}`, {
            headers: authCookie(scanner.id),
        });
        assert.equal(res.status, 200);
        const html = await res.text();
        assert.match(html, /Interact with Target_user/);
        assert.match(html, /Send money/);
        // detail fields must not leak into props for a regular scanner
        assert.doesNotMatch(html, /target@example\.com/);
    });

    it('shows profile detail to hosts and admins', async () => {
        const owner = createUser(state, 'target2@example.com', 'target2_user');
        const host = createUser(state, 'host1@example.com', 'host1');
        promote(host.id, 'host');
        const token = getOrCreateInteractToken(state, owner.id);

        const res = await app.request(`/app/interact/${token}`, {
            headers: authCookie(host.id),
        });
        const html = await res.text();
        assert.match(html, /Profile details/);
        assert.match(html, /target2@example\.com/);
    });

    it('self-scan gets the easter egg instead of actions', async () => {
        const user = createUser(state, 'ego@example.com', 'ego_user');
        const token = getOrCreateInteractToken(state, user.id);
        const res = await app.request(`/app/interact/${token}`, {
            headers: authCookie(user.id),
        });
        const html = await res.text();
        assert.match(html, /That's you!/);
        assert.doesNotMatch(html, /Send money/);
    });
});
