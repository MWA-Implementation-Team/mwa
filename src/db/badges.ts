import { database } from '#src/state.js';

export type Badge = {
    id: number;
    local_id: string;
    activity_id: number;
    title: string;
    description: string;
};

export type UserBadge = {
    id: number;
    badge_id: number;
    user_id: number;
    received_at: string;
};

const listBadgesQuery = database.prepare(`SELECT * FROM badges ORDER BY id`);
const listUserBadgesQuery = database.prepare(`SELECT * FROM user_badges ORDER BY id`);

export function listBadges(): Badge[] {
    return listBadgesQuery.all() as unknown as Badge[];
}

export function listUserBadges(): UserBadge[] {
    return listUserBadgesQuery.all() as unknown as UserBadge[];
}
