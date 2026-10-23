import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { Hono } from 'hono';
import { createUser } from '#src/db/users.js';
import { createSession } from '#src/db/sessions.js';
import { createGroup } from '#src/db/groups.js';
import { registerQueueRoutes } from './queue.js';
import { createTestMwaState, MwaHono, setupHonoState } from '#src/state.js';

const state = createTestMwaState({});

const app: MwaHono = new Hono();
setupHonoState(app, state);
registerQueueRoutes(app);

function authCookie(userId: number) {
    return { cookie: `mwa-session=${createSession(state, userId)}` };
}

let seq = 0;
function groupedUser() {
    const owner = createUser(state, `apiq${seq}@example.com`, `apiq${seq}_user`);
    createGroup(state, `api queue group ${seq++}`, owner.id, '555');
    return owner;
}

describe('/api/queue', () => {
    beforeEach(() => state.db.exec(`DELETE FROM queue_entries`));

    it('requires auth on join and leave', async () => {
        assert.equal((await app.request('/api/queue', { method: 'POST' })).status, 401);
        assert.equal((await app.request('/api/queue', { method: 'DELETE' })).status, 401);
    });

    it('join: 409 when the caller has no group', async () => {
        const solo = createUser(state, 'solo@example.com', 'solo_user');
        const res = await app.request('/api/queue', {
            method: 'POST',
            headers: authCookie(solo.id),
        });
        assert.equal(res.status, 409);
    });

    it('join returns the entry and position, leave clears it', async () => {
        const user = groupedUser();
        const res = await app.request('/api/queue', {
            method: 'POST',
            headers: authCookie(user.id),
        });
        assert.equal(res.status, 201);
        const body = (await res.json()) as { entry: { status: string }; position: number };
        assert.equal(body.entry.status, 'waiting');
        assert.equal(body.position, 1);

        const left = await app.request('/api/queue', {
            method: 'DELETE',
            headers: authCookie(user.id),
        });
        assert.equal(left.status, 200);

        const again = await app.request('/api/queue', {
            method: 'DELETE',
            headers: authCookie(user.id),
        });
        assert.equal(again.status, 404);
    });

    it('join: 409 when already waiting', async () => {
        const user = groupedUser();
        await app.request('/api/queue', { method: 'POST', headers: authCookie(user.id) });
        const res = await app.request('/api/queue', {
            method: 'POST',
            headers: authCookie(user.id),
        });
        assert.equal(res.status, 409);
    });
});
