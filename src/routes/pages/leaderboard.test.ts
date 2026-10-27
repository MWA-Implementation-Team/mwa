import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Hono } from 'hono';
import { addGroupMember, createGroup } from '#src/db/groups/index.js';
import { createUser } from '#src/db/users/index.js';
import { createSession } from '#src/db/sessions/index.js';
import { giveCoins, insertTransaction } from '#src/db/transactions/index.js';
import { registerAppRoutes } from './app.js';
import { createTestMwaState, MwaHono, setupHonoState } from '#src/state.js';

const state = createTestMwaState({});

const app: MwaHono = new Hono();
setupHonoState(app, state);
registerAppRoutes(app);

function authCookie(userId: number) {
    return { cookie: `mwa-session=${createSession(state, userId)}` };
}

function viewer(name: string) {
    const u = createUser(state, `${name}@example.com`, name);
    return { user: u, headers: authCookie(u.id) };
}

describe('GET /app/leaderboard', () => {
    it('redirects logged-out visitors to login', async () => {
        const res = await app.request('/app/leaderboard');
        assert.equal(res.status, 303);
        assert.match(res.headers.get('location') ?? '', /^\/login/);
    });

    it('defaults to the activity players board and ranks by earned', async () => {
        const me = createUser(state, 'lbv_me@example.com', 'lbv_me');
        const rich = createUser(state, 'lbv_rich@example.com', 'lbv_rich');
        giveCoins(state, me.id, 5);
        giveCoins(state, rich.id, 50);
        // transfers and gambling wins must not move the activity board
        insertTransaction(state, 'transfer', me.id, 500);
        insertTransaction(state, 'gambling_winnings', me.id, 500);

        const res = await app.request('/app/leaderboard', { headers: authCookie(me.id) });
        assert.equal(res.status, 200);
        const html = await res.text();

        const richPos = html.indexOf('lbv_rich');
        const mePos = html.indexOf('lbv_me<');
        assert.ok(richPos > 0 && mePos > 0, 'both players render');
        assert.ok(richPos < mePos, 'higher earned ranks first');
        assert.equal((html.match(/mwa-row--self/g) ?? []).length, 1);
    });

    it('highlights the viewer groupmates but nobody else', async () => {
        const me = createUser(state, 'lbg_hl_me@example.com', 'lbg_hl_me');
        const mate = createUser(state, 'lbg_hl_mate@example.com', 'lbg_hl_mate');
        const stranger = createUser(state, 'lbg_hl_str@example.com', 'lbg_hl_str');
        const group = createGroup(state, 'lbg hl group', me.id, '555');
        addGroupMember(state, group.id, mate.id);
        createGroup(state, 'lbg hl other', stranger.id, '555');

        const res = await app.request('/app/leaderboard', { headers: authCookie(me.id) });
        const html = await res.text();

        assert.equal((html.match(/mwa-row--group/g) ?? []).length, 1, 'one groupmate row');
        assert.equal((html.match(/mwa-row--self/g) ?? []).length, 1, 'one self row');
    });

    it('gambling board nets wins and losses and shows game counts', async () => {
        const me = createUser(state, 'lbg_net_me@example.com', 'lbg_net_me');
        insertTransaction(state, 'gambling_deduction', me.id, -10);
        insertTransaction(state, 'gambling_winnings', me.id, 25);
        const clean = createUser(state, 'lbg_net_clean@example.com', 'lbg_net_clean');
        giveCoins(state, clean.id, 100);

        const res = await app.request('/app/leaderboard?board=gambling', {
            headers: authCookie(me.id),
        });
        const html = await res.text();

        assert.match(html, /lbg_net_me/);
        assert.match(html, /15 micius koinai/);
        assert.match(html, /1 game\(s\)/);
        assert.doesNotMatch(html, /lbg_net_clean/, 'never-gamblers are omitted');
    });

    it('combined board ranks by net balance including transfers', async () => {
        const me = createUser(state, 'lbc_me@example.com', 'lbc_me');
        const drained = createUser(state, 'lbc_drained@example.com', 'lbc_drained');
        giveCoins(state, me.id, 10);
        giveCoins(state, drained.id, 40);
        insertTransaction(state, 'transfer', drained.id, -30);

        const res = await app.request('/app/leaderboard?board=combined', {
            headers: authCookie(me.id),
        });
        const html = await res.text();
        const drainedPos = html.indexOf('lbc_drained');
        const mePos = html.indexOf('lbc_me<');
        assert.ok(drainedPos > 0 && mePos > 0);
        // both at 10 net — tie falls to NOCASE username order: lbc_drained first? 'lbc_drained' < 'lbc_me' alphabetically
        assert.ok(drainedPos < mePos, 'tie breaks by username');
    });

    it('groups scope ranks every group with member count and score', async () => {
        const me = createUser(state, 'lbg_scope_me@example.com', 'lbg_scope_me');
        const other = createUser(state, 'lbgs_other@example.com', 'lbgs_other');
        createGroup(state, 'lbgs alpha', me.id, '555');
        createGroup(state, 'lbgs zeta', other.id, '555');
        giveCoins(state, me.id, 20);

        const res = await app.request('/app/leaderboard?scope=groups', {
            headers: authCookie(me.id),
        });
        assert.equal(res.status, 200);
        const html = await res.text();

        const alphaPos = html.indexOf('lbgs alpha');
        const zetaPos = html.indexOf('lbgs zeta');
        assert.ok(alphaPos > 0 && zetaPos > 0);
        assert.ok(alphaPos < zetaPos, 'higher score ranks first');
        assert.match(html, /member\(s\)/);
        // the viewer's own email legitimately appears in ssr-data; others' must not
        assert.doesNotMatch(html, /lbgs_other@example\.com/, 'no emails leak');
    });

    it('falls back to defaults on unknown board and scope params', async () => {
        const me = viewer('lbbad');

        const res = await app.request('/app/leaderboard?board=nope&scope=nope', {
            headers: me.headers,
        });
        assert.equal(res.status, 200);
        const html = await res.text();
        assert.match(html, /lbbad/);
        assert.match(html, /aria-current="page"[^>]*>\s*activity/);
        assert.match(html, /aria-current="page"[^>]*>\s*players/);
    });

    it('excludes staff roles from player boards', async () => {
        const me = viewer('lbstaff_me');
        const host = createUser(state, 'lbstaff_host@example.com', 'lbstaff_host');
        state.prepare(`UPDATE users SET role = ? WHERE id = ?`).run('host', host.id);
        giveCoins(state, host.id, 999);

        const res = await app.request('/app/leaderboard?board=combined', {
            headers: me.headers,
        });
        const html = await res.text();
        assert.doesNotMatch(html, /lbstaff_host/);
    });
});
