import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Hono } from 'hono';
import { addGroupMember, createGroup } from '#src/db/groups.js';
import { createUser } from '#src/db/users.js';
import { createSession } from '#src/db/sessions.js';
import { giveCoins } from '#src/db/transactions.js';
import { registerAppRoutes } from './app.js';
import { createTestMwaState, MwaHono, setupHonoState } from '#src/state.js';

const state = createTestMwaState({});

const app: MwaHono = new Hono();
setupHonoState(app, state);
registerAppRoutes(app);

function authCookie(userId: number) {
    return { cookie: `mwa-session=${createSession(state, userId)}` };
}

describe('GET /app/leaderboard (team tab)', () => {
    it('redirects logged-out visitors to login', async () => {
        const res = await app.request('/app/leaderboard?type=team');
        assert.equal(res.status, 303);
        assert.match(res.headers.get('location') ?? '', /^\/login/);
    });

    it('ranks the viewer group members and highlights the viewer row', async () => {
        const me = createUser(state, 'lbr_me@example.com', 'lbr_me');
        const mate = createUser(state, 'lbr_mate@example.com', 'lbr_mate');
        const group = createGroup(state, 'lbr group', me.id, '555');
        addGroupMember(state, group.id, mate.id);
        giveCoins(state, me.id, 5);
        giveCoins(state, mate.id, 50);

        const res = await app.request('/app/leaderboard?type=team', {
            headers: authCookie(me.id),
        });
        assert.equal(res.status, 200);
        const html = await res.text();

        const matePos = html.indexOf('lbr_mate');
        const mePos = html.indexOf('lbr_me<');
        assert.ok(matePos > 0 && mePos > 0, 'both members are rendered');
        assert.ok(matePos < mePos, 'higher balance is listed first');
        assert.match(html, /<li class="mwa-row--self">/);
        assert.equal((html.match(/mwa-row--self/g) ?? []).length, 1);
    });

    it('does not leak other members emails', async () => {
        const me = createUser(state, 'lbr_private_me@example.com', 'lbr_private_me');
        const mate = createUser(state, 'lbr_private_mate@example.com', 'lbr_private_mate');
        const group = createGroup(state, 'lbr private group', me.id, '555');
        addGroupMember(state, group.id, mate.id);

        const res = await app.request('/app/leaderboard?type=team', {
            headers: authCookie(me.id),
        });
        const html = await res.text();
        assert.match(html, /lbr_private_mate/);
        assert.doesNotMatch(html, /lbr_private_mate@example\.com/);
    });

    it('shows the join-a-group message when the viewer has no group', async () => {
        const loner = createUser(state, 'lbr_loner@example.com', 'lbr_loner');

        const res = await app.request('/app/leaderboard?type=team', {
            headers: authCookie(loner.id),
        });
        const html = await res.text();
        assert.match(html, /Join a group to see your team rankings\./);
        assert.doesNotMatch(html, /mwa-row--self/);
    });
});
