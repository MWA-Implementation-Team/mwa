import { MwaState } from '#src/state.js';

export type LeaderboardBoard = 'activity' | 'gambling' | 'combined';

export type PlayerRow = {
    userId: number;
    username: string;
    score: number;
    // the player's current group (null = groupless) — the page uses it to
    // highlight the viewer's groupmates
    groupId: number | null;
    gamesPlayed?: number;
};

export type GroupRow = {
    id: number;
    name: string;
    memberCount: number;
    score: number;
};

// kinds that mint coins into the economy. Transfers, purchases and gambling
// only move coins between players and must never count as "earned".
const EARNING_KINDS = `'system', 'host_grant'`;
const GAMBLING_KINDS = `'gambling_deduction', 'gambling_winnings'`;

// per-board filter over joined child (ct) / parent (pt) transaction rows:
// which deltas count, and the WHERE form of the same filter
const scoreExpr: Record<LeaderboardBoard, string> = {
    activity: `CASE WHEN ct.balance_delta > 0 AND pt.kind IN (${EARNING_KINDS}) THEN ct.balance_delta END`,
    gambling: `CASE WHEN pt.kind IN (${GAMBLING_KINDS}) THEN ct.balance_delta END`,
    combined: `ct.balance_delta`,
};
const scoreCond: Record<LeaderboardBoard, string> = {
    activity: `ct.balance_delta > 0 AND pt.kind IN (${EARNING_KINDS})`,
    gambling: `pt.kind IN (${GAMBLING_KINDS})`,
    combined: `1`,
};

const GAMES_PLAYED = `COUNT(*) FILTER (WHERE pt.kind = 'gambling_deduction')`;

// every user account, ranked by the board's score. Staff roles never rank.
export function listPlayerLeaderboard(state: MwaState, board: LeaderboardBoard): PlayerRow[] {
    const query = state.prepare(`
    SELECT
        users.id,
        users.username,
        COALESCE(SUM(${scoreExpr[board]}), 0) AS score,
        MAX(gm.group_id) AS group_id
        ${board === 'gambling' ? `, ${GAMES_PLAYED} AS games_played` : ''}
    FROM users
    LEFT JOIN group_members gm ON gm.user_id = users.id
    LEFT JOIN child_transactions ct ON ct.user_id = users.id
    LEFT JOIN parent_transactions pt ON pt.id = ct.parent_id
    WHERE users.role = 'user'
    GROUP BY users.id, users.username
    ${board === 'gambling' ? `HAVING ${GAMES_PLAYED} > 0` : ''}
    ORDER BY score DESC, users.username ASC
    `);

    return query.all().map((row) => ({
        userId: row.id as number,
        username: row.username as string,
        score: row.score as number,
        groupId: (row.group_id as number | null) ?? null,
        ...(board === 'gambling' ? { gamesPlayed: row.games_played as number } : {}),
    }));
}

// every group, ranked by the deltas stamped to it while members belonged.
// Scores come from a separate aggregate so member joins don't multiply them.
export function listGroupLeaderboard(state: MwaState, board: LeaderboardBoard): GroupRow[] {
    const query = state.prepare(`
    SELECT
        groups.id,
        groups.name,
        COALESCE(m.member_count, 0) AS member_count,
        COALESCE(s.score, 0) AS score
    FROM groups
    LEFT JOIN (
        SELECT group_id, COUNT(*) AS member_count
        FROM group_members
        GROUP BY group_id
    ) m ON m.group_id = groups.id
    LEFT JOIN (
        SELECT ct.group_id, SUM(ct.balance_delta) AS score
        FROM child_transactions ct
        JOIN parent_transactions pt ON pt.id = ct.parent_id
        WHERE ${scoreCond[board]}
        GROUP BY ct.group_id
    ) s ON s.group_id = groups.id
    ORDER BY score DESC, groups.name COLLATE NOCASE ASC
    `);

    return query.all().map((row) => ({
        id: row.id as number,
        name: row.name as string,
        memberCount: row.member_count as number,
        score: row.score as number,
    }));
}
