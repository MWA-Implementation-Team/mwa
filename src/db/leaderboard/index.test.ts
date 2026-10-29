import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { listGroupLeaderboard, listPlayerLeaderboard, type LeaderboardBoard } from './index.js';
import { addGroupMember, createGroup, deleteGroup, removeGroupMember } from '../groups/index.js';
import { createUser } from '../users/index.js';
import { giveCoins, insertTransaction } from '../transactions/index.js';
import { createTestMwaState } from '#src/state.js';

const state = createTestMwaState({});

function user(name: string) {
    return createUser(state, `${name}@example.com`, name);
}

function setRole(userId: number, role: string) {
    state.prepare(`UPDATE users SET role = ? WHERE id = ?`).run(role, userId);
}

function grouped(name: string, groupName: string) {
    const u = user(name);
    const group = createGroup(state, groupName, u.id, '555');
    return { user: u, group };
}

describe('db/leaderboard listPlayerLeaderboard activity', () => {
    it('ranks users by earned coins, highest first', () => {
        const a = user('lb_act_a');
        const b = user('lb_act_b');
        giveCoins(state, a.id, 10);
        giveCoins(state, b.id, 30);

        const rows = listPlayerLeaderboard(state, 'activity');
        const top = rows.filter((r) => r.username.startsWith('lb_act_'));
        assert.deepEqual(
            top.map((r) => [r.username, r.score]),
            [
                ['lb_act_b', 30],
                ['lb_act_a', 10],
            ],
        );
    });

    it('counts host grants but not transfers, purchases, or gambling', () => {
        const earner = user('lb_act_kinds');
        user('lb_act_other');
        giveCoins(state, earner.id, 10);
        insertTransaction(state, 'host_grant', earner.id, 5);
        // positive deltas of non-earning kinds must not count
        insertTransaction(state, 'transfer', earner.id, 50);
        insertTransaction(state, 'gambling_winnings', earner.id, 50);
        insertTransaction(state, 'purchase', earner.id, -3);

        const row = listPlayerLeaderboard(state, 'activity').find(
            (r) => r.username === 'lb_act_kinds',
        )!;
        assert.equal(row.score, 15);
    });

    it('lists users with no transactions at zero and excludes staff roles', () => {
        const nobody = user('lb_act_zero');
        const staff = user('lb_act_staff');
        setRole(staff.id, 'host');
        giveCoins(state, staff.id, 999);

        const rows = listPlayerLeaderboard(state, 'activity');
        assert.equal(rows.find((r) => r.userId === nobody.id)?.score, 0);
        assert.equal(
            rows.find((r) => r.userId === staff.id),
            undefined,
        );
    });
});

describe('db/leaderboard listPlayerLeaderboard gambling', () => {
    it('nets wins and losses, signed', () => {
        const winner = user('lb_gam_win');
        const loser = user('lb_gam_lose');
        insertTransaction(state, 'gambling_deduction', winner.id, -10);
        insertTransaction(state, 'gambling_winnings', winner.id, 20);
        insertTransaction(state, 'gambling_deduction', loser.id, -10);

        const rows = listPlayerLeaderboard(state, 'gambling');
        assert.deepEqual(
            rows.filter((r) => r.username.startsWith('lb_gam_')).map((r) => r.score),
            [10, -10],
        );
    });

    it('counts staked sessions as gamesPlayed and omits never-gamblers', () => {
        const player = user('lb_gam_count');
        insertTransaction(state, 'gambling_deduction', player.id, -5);
        insertTransaction(state, 'gambling_winnings', player.id, 10);
        insertTransaction(state, 'gambling_deduction', player.id, -5);
        const clean = user('lb_gam_clean');
        giveCoins(state, clean.id, 100);

        const rows = listPlayerLeaderboard(state, 'gambling');
        const row = rows.find((r) => r.userId === player.id)!;
        assert.equal(row.gamesPlayed, 2);
        assert.equal(
            rows.find((r) => r.userId === clean.id),
            undefined,
        );
    });
});

describe('db/leaderboard listPlayerLeaderboard combined', () => {
    it('ranks by net balance across all kinds', () => {
        const rich = user('lb_all_rich');
        const poor = user('lb_all_poor');
        giveCoins(state, rich.id, 40);
        insertTransaction(state, 'transfer', rich.id, -10);
        insertTransaction(state, 'gambling_winnings', poor.id, 15);

        const rows = listPlayerLeaderboard(state, 'combined');
        assert.deepEqual(
            rows.filter((r) => r.username.startsWith('lb_all_')).map((r) => [r.username, r.score]),
            [
                ['lb_all_rich', 30],
                ['lb_all_poor', 15],
            ],
        );
    });
});

describe('db/leaderboard listGroupLeaderboard', () => {
    it('sums coins earned while stamped to the group', () => {
        const { user: u, group } = grouped('lb_gs_u', 'lb gs group');
        giveCoins(state, u.id, 20);
        insertTransaction(state, 'host_grant', u.id, 5);
        insertTransaction(state, 'gambling_winnings', u.id, 99); // never counts on activity

        const row = listGroupLeaderboard(state, 'activity').find((g) => g.id === group.id)!;
        assert.equal(row.score, 25);
        assert.equal(row.memberCount, 1);
    });

    it('counts nothing earned before joining or by non-members', () => {
        const future = user('lb_gs_late');
        giveCoins(state, future.id, 100); // groupless: group_id stays NULL
        const { group } = grouped('lb_gs_member', 'lb gs timing');
        const outsider = user('lb_gs_out');
        giveCoins(state, outsider.id, 50);
        addGroupMember(state, group.id, future.id);

        const row = listGroupLeaderboard(state, 'activity').find((g) => g.id === group.id)!;
        assert.equal(row.score, 0);
    });

    it('keeps coins earned by members who later leave', () => {
        const { group } = grouped('lb_gs_owner', 'lb gs leavers');
        const a = user('lb_gs_a');
        const b = user('lb_gs_b');
        addGroupMember(state, group.id, a.id);
        addGroupMember(state, group.id, b.id);
        giveCoins(state, a.id, 40);
        assert.equal(removeGroupMember(state, group.id, a.id), 'removed');

        const row = listGroupLeaderboard(state, 'activity').find((g) => g.id === group.id)!;
        assert.equal(row.score, 40);
        assert.equal(row.memberCount, 2);
    });

    it('clears stamps when the group is deleted', () => {
        const { user: u, group } = grouped('lb_gs_del', 'lb gs deleted');
        giveCoins(state, u.id, 10);

        assert.ok(deleteGroup(state, group.id, u.id));
        const stamp = state
            .prepare(`SELECT group_id FROM child_transactions WHERE user_id = ?`)
            .get(u.id);
        assert.equal(stamp?.group_id, null);
    });

    it('ranks groups by score desc, name asc', () => {
        const boards: LeaderboardBoard[] = ['combined'];
        for (const board of boards) {
            const zeta = grouped('lb_ord_z', 'lb ord zeta').group;
            const alpha = grouped('lb_ord_a', 'lb ord alpha').group;
            giveCoins(state, zeta.ownerId, 5);
            giveCoins(state, alpha.ownerId, 50);

            const rows = listGroupLeaderboard(state, board).filter((g) =>
                g.name.startsWith('lb ord '),
            );
            assert.deepEqual(
                rows.map((g) => g.name),
                ['lb ord alpha', 'lb ord zeta'],
            );
        }
    });
});
