import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { Hono } from 'hono';
import { createUser } from '#src/db/users.js';
import { createSession } from '#src/db/sessions.js';
import { createGroup } from '#src/db/groups.js';
import { joinQueue } from '#src/db/queue.js';
import { registerHostRoutes } from './host.js';
import { createTestMwaState, MwaHono, setupHonoState } from '#src/state.js';

const state = createTestMwaState({});

const app: MwaHono = new Hono();
setupHonoState(app, state);
registerHostRoutes(app);

state.prepare(`INSERT OR IGNORE INTO activities (slug) VALUES ('cells')`).run();

function authCookie(userId: number) {
    return { cookie: `mwa-session=${createSession(state, userId)}` };
}

function promote(userId: number, role: string) {
    state.db.prepare(`UPDATE users SET role = ? WHERE id = ?`).run(role, userId);
}

let seq = 0;
function queuedGroup() {
    const owner = createUser(state, `hq${seq}@example.com`, `hq${seq}_user`);
    const group = createGroup(state, `host queue group ${seq++}`, owner.id, '555');
    joinQueue(state, group.id);
    return group.id;
}

function host() {
    const user = createUser(state, `host${seq}@example.com`, `host${seq}_user`);
    seq++;
    promote(user.id, 'host');
    return user;
}

describe('/api/host', () => {
    beforeEach(() => state.db.exec(`DELETE FROM queue_entries`));

    it('rejects anonymous and regular users on both endpoints', async () => {
        assert.equal((await app.request('/api/host/call', { method: 'POST' })).status, 401);
        assert.equal((await app.request('/api/host/done', { method: 'POST' })).status, 401);

        const user = createUser(state, 'plain@example.com', 'plain_user');
        for (const path of ['/api/host/call', '/api/host/done']) {
            const res = await app.request(path, {
                method: 'POST',
                headers: { ...authCookie(user.id), 'content-type': 'application/json' },
                body: '{}',
            });
            assert.equal(res.status, 403);
        }
    });

    it('call validates activity slug and count', async () => {
        const h = host();
        const post = (body: unknown) =>
            app.request('/api/host/call', {
                method: 'POST',
                headers: { ...authCookie(h.id), 'content-type': 'application/json' },
                body: JSON.stringify(body),
            });

        assert.equal((await post({ activitySlug: 'nope', count: 1 })).status, 400);
        assert.equal((await post({ activitySlug: 'cells', count: 0 })).status, 400);
        assert.equal((await post({ activitySlug: 'cells', count: 1.5 })).status, 400);
        assert.equal((await post({ activitySlug: 'cells', count: 'two' })).status, 400);
    });

    it('call pulls the next N waiting groups to the station', async () => {
        const h = host();
        const g1 = queuedGroup();
        const g2 = queuedGroup();
        queuedGroup(); // g3 stays in line

        const res = await app.request('/api/host/call', {
            method: 'POST',
            headers: { ...authCookie(h.id), 'content-type': 'application/json' },
            body: JSON.stringify({ activitySlug: 'cells', count: 2 }),
        });
        assert.equal(res.status, 200);

        const body = (await res.json()) as {
            called: { groupId: number; status: string; activitySlug: string }[];
            atStation: { groupId: number }[];
            waitingCount: number;
        };
        assert.deepEqual(
            body.called.map((e) => e.groupId),
            [g1, g2],
        );
        assert.equal(body.called[0].status, 'called');
        assert.equal(body.called[0].activitySlug, 'cells');
        assert.equal(body.atStation.length, 2);
        assert.equal(body.waitingCount, 1);
    });

    it('done releases a group from the station list', async () => {
        const h = host();
        queuedGroup();

        const call = await app.request('/api/host/call', {
            method: 'POST',
            headers: { ...authCookie(h.id), 'content-type': 'application/json' },
            body: JSON.stringify({ activitySlug: 'cells', count: 1 }),
        });
        const { called } = (await call.json()) as { called: { id: number }[] };

        const res = await app.request('/api/host/done', {
            method: 'POST',
            headers: { ...authCookie(h.id), 'content-type': 'application/json' },
            body: JSON.stringify({ entryId: called[0].id }),
        });
        assert.equal(res.status, 200);

        const again = await app.request('/api/host/done', {
            method: 'POST',
            headers: { ...authCookie(h.id), 'content-type': 'application/json' },
            body: JSON.stringify({ entryId: called[0].id }),
        });
        assert.equal(again.status, 404);
    });
});
