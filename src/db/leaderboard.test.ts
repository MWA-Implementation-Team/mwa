import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { listGroupLeaderboard, listLeaderboardGroups } from './leaderboard.js';
import { addGroupMember, createGroup } from './groups.js';
import { createUser } from './users.js';
import { giveCoins, insertTransaction } from './transactions.js';
import { createTestMwaState } from '#src/state.js';

const state = createTestMwaState({});

function user(name: string) {
    return createUser(state, `${name}@example.com`, name);
}

describe('db/leaderboard listGroupLeaderboard', () => {
    it('ranks members by balance, highest first', () => {
        const a = user('lb_rank_a');
        const b = user('lb_rank_b');
        const group = createGroup(state, 'lb rank group', a.id, '555');
        addGroupMember(state, group.id, b.id);
        giveCoins(state, a.id, 10);
        giveCoins(state, b.id, 30);

        const rows = listGroupLeaderboard(state, group.id);
        assert.deepEqual(
            rows.map((r) => [r.username, r.points]),
            [
                ['lb_rank_b', 30],
                ['lb_rank_a', 10],
            ],
        );
    });

    it('breaks ties alphabetically by username', () => {
        const z = user('lb_tie_z');
        const y = user('lb_tie_y');
        const group = createGroup(state, 'lb tie group', z.id, '555');
        addGroupMember(state, group.id, y.id);
        giveCoins(state, z.id, 5);
        giveCoins(state, y.id, 5);

        const rows = listGroupLeaderboard(state, group.id);
        assert.deepEqual(
            rows.map((r) => r.username),
            ['lb_tie_y', 'lb_tie_z'],
        );
    });

    it('counts members with no transactions as zero', () => {
        const solo = user('lb_zero');
        const group = createGroup(state, 'lb zero group', solo.id, '555');

        assert.deepEqual(listGroupLeaderboard(state, group.id), [
            { userId: solo.id, username: 'lb_zero', points: 0 },
        ]);
    });

    it('nets gambling stakes and winnings into the balance', () => {
        const winner = user('lb_gamble_win');
        const loser = user('lb_gamble_lose');
        const group = createGroup(state, 'lb gamble group', winner.id, '555');
        addGroupMember(state, group.id, loser.id);
        giveCoins(state, winner.id, 20);
        giveCoins(state, loser.id, 20);
        // a 10 coin coin flip: loser stakes 10, winner collects 20
        insertTransaction(state, 'gambling_deduction', loser.id, -10);
        insertTransaction(state, 'gambling_deduction', winner.id, -10);
        insertTransaction(state, 'gambling_winnings', winner.id, 20);

        const rows = listGroupLeaderboard(state, group.id);
        assert.deepEqual(
            rows.map((r) => [r.username, r.points]),
            [
                ['lb_gamble_win', 30],
                ['lb_gamble_lose', 10],
            ],
        );
    });

    it('keeps negative balances, sorted below zero', () => {
        const debtor = user('lb_neg_debt');
        const friend = user('lb_neg_friend');
        const group = createGroup(state, 'lb neg group', debtor.id, '555');
        addGroupMember(state, group.id, friend.id);
        insertTransaction(state, 'transfer', debtor.id, -15);

        const rows = listGroupLeaderboard(state, group.id);
        assert.deepEqual(
            rows.map((r) => [r.username, r.points]),
            [
                ['lb_neg_friend', 0],
                ['lb_neg_debt', -15],
            ],
        );
    });

    it('excludes users who are not in the group', () => {
        const inside = user('lb_scope_in');
        const outside = user('lb_scope_out');
        const group = createGroup(state, 'lb scope group', inside.id, '555');
        giveCoins(state, outside.id, 999);

        const usernames = listGroupLeaderboard(state, group.id).map((r) => r.username);
        assert.deepEqual(usernames, ['lb_scope_in']);
    });

    it('returns an empty list for a group id that does not exist', () => {
        assert.deepEqual(listGroupLeaderboard(state, 987654), []);
    });
});

describe('db/leaderboard listLeaderboardGroups', () => {
    it('lists every group with its member count, sorted by name', () => {
        const owner = createUser(state, 'lbg_owner@example.com', 'lbg_owner');
        const other = createUser(state, 'lbg_other@example.com', 'lbg_other');
        const bravo = createGroup(state, 'lbg Bravo', owner.id, '555');
        addGroupMember(state, bravo.id, other.id);
        const solo = createUser(state, 'lbg_solo@example.com', 'lbg_solo');
        createGroup(state, 'lbg alpha', solo.id, '555');

        const groups = listLeaderboardGroups(state).filter((g) => g.name.startsWith('lbg '));
        assert.deepEqual(
            groups.map((g) => [g.name, g.memberCount]),
            [
                ['lbg alpha', 1],
                ['lbg Bravo', 2],
            ],
        );
    });

    it('returns only id, name and member count', () => {
        const group = createGroup(
            state,
            'lbg shape',
            createUser(state, 'lbg_shape@example.com', 'lbg_shape').id,
            '555',
        );
        const row = listLeaderboardGroups(state).find((g) => g.id === group.id)!;
        assert.deepEqual(Object.keys(row).sort(), ['id', 'memberCount', 'name']);
    });
});
