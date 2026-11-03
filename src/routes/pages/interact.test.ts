import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Hono } from 'hono';
import { createUser, findUserById } from '#src/db/users/index.js';
import { createSession } from '#src/db/sessions/index.js';
import { getOrCreateInteractCode, getOrCreateInteractToken } from '#src/db/interactions/index.js';
import { addGroupMember, createGroup, findUserGroup } from '#src/db/groups/index.js';
import { createSystemQrCode } from '#src/db/systemqr/index.js';
import { grantCoins, listUserTransactions } from '#src/db/transactions/index.js';
import { listPlayerLeaderboard } from '#src/db/leaderboard/index.js';
import { registerAppRoutes } from './app.js';
import { registerGamblingRoutes } from './gambling.js';
import { createTestMwaState, MwaHono, setupHonoState } from '#src/state.js';

const state = createTestMwaState({});

const app: MwaHono = new Hono();
setupHonoState(app, state);
registerAppRoutes(app);
registerGamblingRoutes(app);

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

describe('GET /app?interact=<token> — legacy redirect', () => {
    it('redirects logged-out scanners to login', async () => {
        const owner = createUser(state, 'out@example.com', 'out_user');
        const token = getOrCreateInteractToken(state, owner.id);
        const res = await app.request(`/app?interact=${token}`);
        assert.equal(res.status, 303);
        assert.equal(
            res.headers.get('location'),
            `/login?goto=${encodeURIComponent(`/app?interact=${token}`)}`,
        );
    });

    it('bounces signed-in visitors onto the path form', async () => {
        const owner = createUser(state, 'legacy@example.com', 'legacy');
        const scanner = createUser(state, 'scan0@example.com', 'scan0');
        const token = getOrCreateInteractToken(state, owner.id);
        const res = await app.request(`/app?interact=${token}`, {
            headers: authCookie(scanner.id),
        });
        assert.equal(res.status, 303);
        assert.equal(res.headers.get('location'), `/app/interact/${token}`);
    });

    it('carries query params through the redirect', async () => {
        const owner = createUser(state, 'carry@example.com', 'carry');
        const scanner = createUser(state, 'scan4@example.com', 'scan4');
        const token = getOrCreateInteractToken(state, owner.id);
        const res = await app.request(`/app?interact=${token}&interactNotice=groupRequestSent`, {
            headers: authCookie(scanner.id),
        });
        assert.equal(res.status, 303);
        assert.equal(
            res.headers.get('location'),
            `/app/interact/${token}?interactNotice=groupRequestSent`,
        );
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

    it('shows the target and send-money to a regular user, and no award form', async () => {
        const owner = createUser(state, 'target@example.com', 'target_user');
        const scanner = createUser(state, 'scan2@example.com', 'scan2');
        const token = getOrCreateInteractToken(state, owner.id);

        const res = await app.request(`/app/interact/${token}`, {
            headers: authCookie(scanner.id),
        });
        assert.equal(res.status, 200);
        const html = await res.text();
        assert.match(html, /Target_user/);
        assert.match(html, /send-money/);
        assert.doesNotMatch(html, /\/award/);
        assert.doesNotMatch(html, /target@example\.com/);
    });

    it('shows hosts the award-shaped send panel and no profile detail', async () => {
        const owner = createUser(state, 'target2@example.com', 'target2_user');
        const host = createUser(state, 'host1@example.com', 'host1');
        promote(host.id, 'host');
        const token = getOrCreateInteractToken(state, owner.id);

        const res = await app.request(`/app/interact/${token}`, {
            headers: authCookie(host.id),
        });
        const html = await res.text();
        // no profile detail leak
        assert.doesNotMatch(html, /Profile details/);
        assert.doesNotMatch(html, /target2@example\.com/);
        // the staff send panel posts to award with a note field, never send-money
        assert.match(html, /action="\/app\/interact\/[^"]+\/award"/);
        assert.match(html, /name="note"/);
        assert.doesNotMatch(html, /send-money/);
    });

    it('self-scan gets the easter egg instead of actions', async () => {
        const user = createUser(state, 'ego@example.com', 'ego_user');
        const token = getOrCreateInteractToken(state, user.id);
        const res = await app.request(`/app/interact/${token}`, {
            headers: authCookie(user.id),
        });
        const html = await res.text();
        assert.match(html, /That's you!/);
        assert.doesNotMatch(html, /send-money/);
    });

    it('shows the sent notice on the interact page', async () => {
        const owner = createUser(state, 'notice2@example.com', 'notice2_user');
        const requester = createUser(state, 'notice@example.com', 'notice_user');
        const token = getOrCreateInteractToken(state, owner.id);
        const res = await app.request(`/app/interact/${token}?interactNotice=groupRequestSent`, {
            headers: authCookie(requester.id),
        });
        assert.equal(res.status, 200);
        const html = await res.text();
        assert.match(html, /Join request sent\./);
    });
});

describe('POST /app/interact/:token/group-request', () => {
    it('lands back on the interact page with the notice', async () => {
        const owner = createUser(state, 'owner2@example.com', 'owner2');
        const requester = createUser(state, 'asker@example.com', 'asker');
        const token = getOrCreateInteractToken(state, owner.id);
        const res = await app.request(`/app/interact/${token}/group-request`, {
            method: 'POST',
            headers: authCookie(requester.id),
        });
        assert.equal(res.status, 303);
        assert.equal(
            res.headers.get('location'),
            `/app/interact/${token}?interactNotice=groupRequestSent`,
        );
    });

    it('forbids staff from team-up requests', async () => {
        const owner = createUser(state, 'owner3@example.com', 'owner3');
        const host = createUser(state, 'hostask@example.com', 'hostask');
        promote(host.id, 'host');
        const token = getOrCreateInteractToken(state, owner.id);
        const res = await app.request(`/app/interact/${token}/group-request`, {
            method: 'POST',
            headers: authCookie(host.id),
        });
        assert.equal(res.status, 403);
    });
});

describe('POST /app/interact/:token/award', () => {
    it('lets a host award coins with a note', async () => {
        const owner = createUser(state, 'awardee@example.com', 'awardee_user');
        const host = createUser(state, 'awardhost@example.com', 'awardhost');
        promote(host.id, 'host');
        const token = getOrCreateInteractToken(state, owner.id);

        const res = await app.request(`/app/interact/${token}/award`, {
            method: 'POST',
            headers: {
                ...authCookie(host.id),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'amount=100&note=great+work',
        });
        assert.equal(res.status, 303);
        assert.equal(findUserById(state, owner.id)!.currentBalance, 100);
        const kinds = listUserTransactions(state, owner.id).map((tx) => tx.kind);
        assert.deepEqual(kinds, ['host_grant']);
        const board = listPlayerLeaderboard(state, 'activity');
        assert.equal(board.find((row) => row.userId === owner.id)?.score, 100);
    });

    it('rejects a non-positive amount', async () => {
        const owner = createUser(state, 'awardee2@example.com', 'awardee2_user');
        const host = createUser(state, 'awardhost2@example.com', 'awardhost2');
        promote(host.id, 'host');
        const token = getOrCreateInteractToken(state, owner.id);

        const res = await app.request(`/app/interact/${token}/award`, {
            method: 'POST',
            headers: {
                ...authCookie(host.id),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'amount=0',
        });
        assert.equal(res.status, 303);
        assert.match(res.headers.get('location') ?? '', /interactError=interactAwardInvalid/);
        assert.equal(findUserById(state, owner.id)!.currentBalance, 0);
    });

    it('forbids a regular user from awarding', async () => {
        const owner = createUser(state, 'awardee3@example.com', 'awardee3_user');
        const scanner = createUser(state, 'awardscan@example.com', 'awardscan');
        const token = getOrCreateInteractToken(state, owner.id);

        const res = await app.request(`/app/interact/${token}/award`, {
            method: 'POST',
            headers: {
                ...authCookie(scanner.id),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'amount=100',
        });
        assert.equal(res.status, 403);
        assert.equal(findUserById(state, owner.id)!.currentBalance, 0);
    });
});

describe('GET /app/interact?code= — sąveikos kodas lookup', () => {
    it('redirects a typed code onto the token page', async () => {
        const owner = createUser(state, 'codeowner@example.com', 'codeowner');
        const scanner = createUser(state, 'codescan@example.com', 'codescan');
        const code = getOrCreateInteractCode(state, owner.id);

        const res = await app.request(`/app/interact?code=${code}`, {
            headers: authCookie(scanner.id),
        });
        assert.equal(res.status, 303);
        assert.equal(
            res.headers.get('location'),
            `/app/interact/${getOrCreateInteractToken(state, owner.id)}`,
        );
    });

    it('is case-insensitive and bounces unknown codes back to /app', async () => {
        const owner = createUser(state, 'codeowner2@example.com', 'codeowner2');
        const scanner = createUser(state, 'codescan2@example.com', 'codescan2');
        const code = getOrCreateInteractCode(state, owner.id);

        const lower = await app.request(`/app/interact?code=${code.toLowerCase()}`, {
            headers: authCookie(scanner.id),
        });
        assert.equal(lower.status, 303);
        assert.match(lower.headers.get('location') ?? '', /\/app\/interact\//);

        const bad = await app.request('/app/interact?code=NOPE1', {
            headers: authCookie(scanner.id),
        });
        assert.equal(bad.status, 303);
        assert.equal(bad.headers.get('location'), '/app?codeError=interactCodeInvalid');
    });
});

describe('POST /app/interact/:token/award-group', () => {
    it('lets a host award every member of the target group', async () => {
        const owner = createUser(state, 'grpowner@example.com', 'grpowner');
        const mate = createUser(state, 'grpmate@example.com', 'grpmate');
        createGroup(state, 'award grp', owner.id, '555');
        addGroupMember(state, findUserGroup(state, owner.id)!.id, mate.id);
        const host = createUser(state, 'grphost@example.com', 'grphost');
        promote(host.id, 'host');
        const token = getOrCreateInteractToken(state, owner.id);

        const res = await app.request(`/app/interact/${token}/award-group`, {
            method: 'POST',
            headers: {
                ...authCookie(host.id),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'amount=25&note=team+prize',
        });
        assert.equal(res.status, 303);
        assert.match(res.headers.get('location') ?? '', /interactNotice=interactAwardedGroup/);
        assert.equal(findUserById(state, owner.id)!.currentBalance, 25);
        assert.equal(findUserById(state, mate.id)!.currentBalance, 25);
    });

    it('errors when the target has no group', async () => {
        const owner = createUser(state, 'grpsolo@example.com', 'grpsolo');
        const host = createUser(state, 'grphost2@example.com', 'grphost2');
        promote(host.id, 'host');
        const token = getOrCreateInteractToken(state, owner.id);

        const res = await app.request(`/app/interact/${token}/award-group`, {
            method: 'POST',
            headers: {
                ...authCookie(host.id),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'amount=25',
        });
        assert.equal(res.status, 303);
        assert.match(res.headers.get('location') ?? '', /interactError=interactAwardNoGroup/);
        assert.equal(findUserById(state, owner.id)!.currentBalance, 0);
    });

    it('forbids a regular user from group-awarding', async () => {
        const owner = createUser(state, 'grpowner3@example.com', 'grpowner3');
        const scanner = createUser(state, 'grpscan@example.com', 'grpscan');
        const token = getOrCreateInteractToken(state, owner.id);

        const res = await app.request(`/app/interact/${token}/award-group`, {
            method: 'POST',
            headers: {
                ...authCookie(scanner.id),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'amount=25',
        });
        assert.equal(res.status, 403);
        assert.equal(findUserById(state, owner.id)!.currentBalance, 0);
    });
});

describe('POST /app/interact/:token/send-money', () => {
    function post(token: string, userId: number, body: string) {
        return app.request(`/app/interact/${token}/send-money`, {
            method: 'POST',
            headers: {
                ...authCookie(userId),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body,
        });
    }

    it('moves coins between the two balances', async () => {
        const owner = createUser(state, 'payee@example.com', 'payee_user');
        const sender = createUser(state, 'payer@example.com', 'payer_user');
        grantCoins(state, sender.id, 50);
        const token = getOrCreateInteractToken(state, owner.id);

        const res = await post(token, sender.id, 'amount=20');
        assert.equal(res.status, 303);
        assert.equal(res.headers.get('location'), `/app/interact/${token}?sent=20`);
        assert.equal(findUserById(state, sender.id)!.currentBalance, 30);
        assert.equal(findUserById(state, owner.id)!.currentBalance, 20);
    });

    it('bounces back to the page on a bad amount', async () => {
        const owner = createUser(state, 'payee2@example.com', 'payee2_user');
        const sender = createUser(state, 'payer2@example.com', 'payer2_user');
        grantCoins(state, sender.id, 50);
        const token = getOrCreateInteractToken(state, owner.id);

        const res = await post(token, sender.id, 'amount=-5');
        assert.equal(res.status, 303);
        assert.equal(
            res.headers.get('location'),
            `/app/interact/${token}?sendError=interactSendInvalid`,
        );
        assert.equal(findUserById(state, sender.id)!.currentBalance, 50);
    });

    it('bounces back when the sender cannot cover it', async () => {
        const owner = createUser(state, 'payee3@example.com', 'payee3_user');
        const sender = createUser(state, 'payer3@example.com', 'payer3_user');
        grantCoins(state, sender.id, 10);
        const token = getOrCreateInteractToken(state, owner.id);

        const res = await post(token, sender.id, 'amount=11');
        assert.equal(res.status, 303);
        assert.equal(
            res.headers.get('location'),
            `/app/interact/${token}?sendError=interactSendInsufficient`,
        );
        assert.equal(findUserById(state, sender.id)!.currentBalance, 10);
        assert.equal(findUserById(state, owner.id)!.currentBalance, 0);
    });

    it('404s on self-send and on a bad token', async () => {
        const user = createUser(state, 'selfpay@example.com', 'selfpay_user');
        grantCoins(state, user.id, 50);
        const token = getOrCreateInteractToken(state, user.id);

        const self = await post(token, user.id, 'amount=5');
        assert.equal(self.status, 404);
        const forged = await post('forged', user.id, 'amount=5');
        assert.equal(forged.status, 404);
        assert.equal(findUserById(state, user.id)!.currentBalance, 50);
    });

    it('forbids staff senders and staff targets', async () => {
        const owner = createUser(state, 'payee4@example.com', 'payee4_user');
        const host = createUser(state, 'hostpay@example.com', 'hostpay');
        promote(host.id, 'host');
        grantCoins(state, host.id, 50);
        grantCoins(state, owner.id, 50);

        const fromHost = await post(getOrCreateInteractToken(state, owner.id), host.id, 'amount=5');
        assert.equal(fromHost.status, 403);
        const toHost = await post(getOrCreateInteractToken(state, host.id), owner.id, 'amount=5');
        assert.equal(toHost.status, 403);
        assert.equal(findUserById(state, host.id)!.currentBalance, 50);
        assert.equal(findUserById(state, owner.id)!.currentBalance, 50);
    });
});

describe('POST /app/interact/:token/gamble', () => {
    it('bounces a bad bet back onto the interact page with the game flag', async () => {
        const owner = createUser(state, 'gtarget@example.com', 'gtarget_user');
        const challenger = createUser(state, 'gchall@example.com', 'gchall_user');
        grantCoins(state, challenger.id, 50);
        const token = getOrCreateInteractToken(state, owner.id);

        const res = await app.request(`/app/interact/${token}/gamble`, {
            method: 'POST',
            headers: {
                ...authCookie(challenger.id),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'game_type=connect_4&bet_amount=0',
        });
        assert.equal(res.status, 302);
        assert.equal(
            res.headers.get('location'),
            `/app/interact/${token}?error_game=connect_4&error_type=invalid`,
        );
    });

    it('forbids staff from challenging', async () => {
        const owner = createUser(state, 'gtarget2@example.com', 'gtarget2_user');
        const host = createUser(state, 'ghost@example.com', 'ghost');
        promote(host.id, 'host');
        grantCoins(state, host.id, 50);
        const token = getOrCreateInteractToken(state, owner.id);

        const res = await app.request(`/app/interact/${token}/gamble`, {
            method: 'POST',
            headers: {
                ...authCookie(host.id),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'game_type=connect_4&bet_amount=5',
        });
        assert.equal(res.status, 403);
    });
});

describe('GET /app/qr/:secret', () => {
    it('claims a reward QR and redirects with the amount', async () => {
        const qr = createSystemQrCode(state, 40, 1);
        const user = createUser(state, 'qrscan@example.com', 'qrscan_user');
        const res = await app.request(`/app/qr/${qr.secret}`, {
            headers: authCookie(user.id),
        });
        assert.equal(res.status, 303);
        assert.match(res.headers.get('location') ?? '', /claimed=40/);
        assert.equal(findUserById(state, user.id)!.currentBalance, 40);
    });

    it('does not award twice on a double scan', async () => {
        const qr = createSystemQrCode(state, 40, 2);
        const user = createUser(state, 'qrscan2@example.com', 'qrscan2_user');
        const headers = authCookie(user.id);
        await app.request(`/app/qr/${qr.secret}`, { headers });
        const second = await app.request(`/app/qr/${qr.secret}`, { headers });
        assert.match(second.headers.get('location') ?? '', /qrError=already_claimed/);
        assert.equal(findUserById(state, user.id)!.currentBalance, 40);
    });

    it('reports an unknown secret as not found', async () => {
        const user = createUser(state, 'qrbogus@example.com', 'qrbogus_user');
        const res = await app.request('/app/qr/nope-no-such-secret', {
            headers: authCookie(user.id),
        });
        assert.equal(res.status, 303);
        assert.match(res.headers.get('location') ?? '', /qrError=not_found/);
        assert.equal(findUserById(state, user.id)!.currentBalance, 0);
    });
});

describe('POST /app/you/reset-qr', () => {
    it('rotates the personal token', async () => {
        const user = createUser(state, 'reset@example.com', 'reset_user');
        const before = getOrCreateInteractToken(state, user.id);
        const res = await app.request('/app/you/reset-qr', {
            method: 'POST',
            headers: authCookie(user.id),
        });
        assert.equal(res.status, 303);
        const after = getOrCreateInteractToken(state, user.id);
        assert.notEqual(after, before);
    });
});
