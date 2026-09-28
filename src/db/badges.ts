import { database } from '#src/state.js';

export type UserBadge = {
    createdAt: Date;
    badgeId: string;
    userId: string;
};

const listUserBadgesQuery = database.prepare(`
SELECT created_at, badge_id, user_id FROM user_badges ORDER BY id
`);

export function listUserBadges(): UserBadge[] {
    return listUserBadgesQuery.all().map((row) => {
        return {
            createdAt: new Date(row.created_at as string),
            badgeId: row.badge_id as string,
            userId: row.user_id as string,
        };
    });
}
