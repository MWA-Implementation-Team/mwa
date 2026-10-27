import { MwaState } from '#src/state.js';

export type LeaderboardRow = {
    userId: number;
    username: string;
    points: number;
};

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
