import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Hono } from 'hono';
import { createUser, User, UserRole } from '#src/db/users.js';
import { createSession } from '#src/db/sessions.js';
import { requireApiRole, requireApiUser, requireRole, requireUser } from './auth.js';
import { createTestMwaState, MwaHono, setupHonoState } from './state.js';

const state = createTestMwaState({});
const app: MwaHono = new Hono();
setupHonoState(app, state);

app.get('/probe/page', (ctx) => {
    const user = requireUser(ctx);
    if (user instanceof Response) return user;
    return ctx.text(user.username);
});

app.get('/probe/admin', (ctx) => {
    const user = requireRole(ctx, 'admin');
    if (user instanceof Response) return user;
    return ctx.text('ok');
});

app.get('/probe/api-any', (ctx) => {
    const user = requireApiUser(ctx);
    if (user instanceof Response) return user;
    return ctx.json({ ok: true });
});

app.get('/probe/api-staff', (ctx) => {
    const user = requireApiRole(ctx, 'host', 'admin');
    if (user instanceof Response) return user;
    return ctx.json({ ok: true });
});

let seq = 0;
function userAs(role: UserRole): { user: User; cookie: string } {
    const user = createUser(state, `guard${seq}@example.com`, `guard${seq++}`);
    state.db.prepare(`UPDATE users SET role = ? WHERE id = ?`).run(role, user.id);
    return { user: { ...user, role }, cookie: `mwa-session=${createSession(state, user.id)}` };
}

describe('page guards', () => {
    it('anonymous visitors are redirected to login with goto', async () => {
        const res = await app.request('/probe/page');
        assert.equal(res.status, 303);
        assert.match(res.headers.get('location') ?? '', /^\/login\?goto=%2Fprobe%2Fpage/);
    });

    it('any logged-in role passes requireUser', async () => {
        const { user, cookie } = userAs('user');
        const res = await app.request('/probe/page', { headers: { cookie } });
        assert.equal(res.status, 200);
        assert.equal(await res.text(), user.username);
    });

    it('requireRole serves 403 to the wrong role and content to the right one', async () => {
        const pleb = userAs('user');
        const denied = await app.request('/probe/admin', { headers: { cookie: pleb.cookie } });
        assert.equal(denied.status, 403);

        const boss = userAs('admin');
        const allowed = await app.request('/probe/admin', { headers: { cookie: boss.cookie } });
        assert.equal(allowed.status, 200);
    });

    it('anonymous hits to a role-gated page redirect, not 403', async () => {
        const res = await app.request('/probe/admin');
        assert.equal(res.status, 303);
    });
});

describe('api guards', () => {
    it('anonymous gets 401 JSON', async () => {
        const res = await app.request('/probe/api-any');
        assert.equal(res.status, 401);
        assert.deepEqual(await res.json(), { error: 'unauthorized' });
    });

    it('wrong role gets 403 JSON, listed roles get through', async () => {
        const pleb = userAs('user');
        const denied = await app.request('/probe/api-staff', {
            headers: { cookie: pleb.cookie },
        });
        assert.equal(denied.status, 403);
        assert.deepEqual(await denied.json(), { error: 'forbidden' });

        for (const role of ['host', 'admin'] as const) {
            const staff = userAs(role);
            const allowed = await app.request('/probe/api-staff', {
                headers: { cookie: staff.cookie },
            });
            assert.equal(allowed.status, 200, `role ${role} should pass`);
        }
    });
});
