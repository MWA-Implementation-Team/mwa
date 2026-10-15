import { MwaState } from '#src/state.js';

export type UserBadge = {
    createdAt: Date;
    badgeId: string;
    userId: number;
};


export function listUserBadges(state: MwaState): UserBadge[] {
    const query = state.prepare(`
    SELECT created_at, badge_id, user_id FROM user_badges ORDER BY created_at
    `);

    return query.all().map((row) => {
        return {
            createdAt: new Date(row.created_at as string),
            badgeId: row.badge_id as string,
            userId: row.user_id as number,
        };
    });
}
