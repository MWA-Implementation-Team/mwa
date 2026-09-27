import { database } from '#src/state.js';

export type User = {
    id: number;
    username: string;
    email: string;
    balance_current: number;
    lifetime_earned: number;
    type: 'admin' | 'host' | 'user';
    created_at: string;
};

database.exec(`
CREATE TABLE IF NOT EXISTS "users" (
	"id" INTEGER NOT NULL,
	"username" TEXT NOT NULL UNIQUE,
	"email" TEXT NOT NULL UNIQUE,
	"balance_current" INTEGER NOT NULL DEFAULT 0,
	"lifetime_earned" INTEGER NOT NULL DEFAULT 0,
	"type" TEXT NOT NULL CHECK("type" IN ('admin', 'host', 'user')),
	"created_at" TIMESTAMP NOT NULL,
	PRIMARY KEY("id")
);
`);

const listUsersQuery = database.prepare(`SELECT * FROM users ORDER BY id`);

export function listUsers(): User[] {
    return listUsersQuery.all() as unknown as User[];
}
