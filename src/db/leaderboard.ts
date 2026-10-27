import { MwaState } from '#src/state.js';

export type LeaderboardRow = {
    userId: number;
    username: string;
    points: number;
};

export type LeaderboardGroup = {
    id: number;
    name: string;
    memberCount: number;
};

// every group in the event, by name. No points: group scoring is not defined yet.
export function listLeaderboardGroups(state: MwaState): LeaderboardGroup[] {
    const query = state.prepare(`
    SELECT
        groups.id,
        groups.name,
        COUNT(group_members.user_id) AS member_count
    FROM groups
    LEFT JOIN group_members ON group_members.group_id = groups.id
    GROUP BY groups.id, groups.name
    ORDER BY groups.name COLLATE NOCASE ASC
    `);

    return query.all().map((row) => ({
        id: row.id as number,
        name: row.name as string,
        memberCount: row.member_count as number,
    }));
}

// fetches group members ranked by total points (desc)
// defaults users with no transactions to 0 points
export function listGroupLeaderboard(state: MwaState, groupId: number): LeaderboardRow[] {
    const query = state.prepare(`
    SELECT
        users.id,
        users.username,
        COALESCE(SUM(child_transactions.balance_delta), 0) AS points
    FROM group_members
    JOIN users ON users.id = group_members.user_id
    LEFT JOIN child_transactions ON child_transactions.user_id = users.id
    WHERE group_members.group_id = ?
    GROUP BY users.id, users.username
    ORDER BY points DESC, users.username ASC
    `);

    return query.all(groupId).map((row) => ({
        userId: row.id as number,
        username: row.username as string,
        points: row.points as number,
    }));
}
