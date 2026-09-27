import { database } from '#src/state.js';

export type ParentTransaction = {
    id: number;
    created_by: number | null;
    kind: 'p2p' | 'purchase' | 'admin_grant' | 'system';
    issued_at: string;
};

export type ChildTransaction = {
    id: number;
    parent_id: number | null;
    user_id: number;
    type: 'sent' | 'received' | 'assignment' | 'purchase' | 'system';
    amount: number;
    balance_after: number;
    issued_at: string;
};

database.exec(`
CREATE TABLE IF NOT EXISTS "parent_transactions" (
	"id" INTEGER NOT NULL,
	"created_by" INTEGER,
	-- p2p
	-- purchase
	-- admin_grant
	-- system
	"kind" TEXT NOT NULL CHECK(
		"kind" IN ('p2p', 'purchase', 'admin_grant', 'system')
	),
	"issued_at" TIMESTAMP NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("created_by") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE TABLE IF NOT EXISTS "child_transactions" (
	"id" INTEGER NOT NULL,
	"parent_id" INTEGER,
	"user_id" INTEGER NOT NULL,
	-- Sent: Player2Player
	-- Received: P2P
	-- Assignment: Admin2Player
	-- Purchase: P2A
	-- System: Automatic (By Event)
	"type" TEXT NOT NULL,
	"amount" INTEGER NOT NULL,
	"balance_after" INTEGER NOT NULL,
	"issued_at" TIMESTAMP NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("parent_id") REFERENCES "parent_transactions"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT "child_transactions_unique_0" UNIQUE ("parent_id", "user_id")
);
CREATE INDEX IF NOT EXISTS "child_transactions_index_0" ON "child_transactions" ("user_id", "issued_at");
`);

const listParentTransactionsQuery = database.prepare(
    `SELECT * FROM parent_transactions ORDER BY id`,
);
const listChildTransactionsQuery = database.prepare(`SELECT * FROM child_transactions ORDER BY id`);

export function listParentTransactions(): ParentTransaction[] {
    return listParentTransactionsQuery.all() as unknown as ParentTransaction[];
}

export function listChildTransactions(): ChildTransaction[] {
    return listChildTransactionsQuery.all() as unknown as ChildTransaction[];
}
