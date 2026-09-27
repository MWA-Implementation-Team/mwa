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

database.exec(`
CREATE TABLE IF NOT EXISTS "badges" (
	"id" INTEGER NOT NULL,
	"local_id" TEXT NOT NULL UNIQUE,
	"activity_id" INTEGER NOT NULL,
	"title" TEXT NOT NULL,
	"description" TEXT NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT "badges_unique_0" UNIQUE ("activity_id")
);
CREATE TABLE IF NOT EXISTS "user_badges" (
	"id" INTEGER NOT NULL,
	"badge_id" INTEGER NOT NULL,
	"user_id" INTEGER NOT NULL,
	"received_at" TIMESTAMP NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT "user_badges_unique_0" UNIQUE ("badge_id", "user_id")
);
CREATE INDEX IF NOT EXISTS "user_badges_index_0" ON "user_badges" ("user_id");
`);

const listBadgesQuery = database.prepare(`SELECT * FROM badges ORDER BY id`);
const listUserBadgesQuery = database.prepare(`SELECT * FROM user_badges ORDER BY id`);

export function listBadges(): Badge[] {
    return listBadgesQuery.all() as unknown as Badge[];
}

export function listUserBadges(): UserBadge[] {
    return listUserBadgesQuery.all() as unknown as UserBadge[];
}
