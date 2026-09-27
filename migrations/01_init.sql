CREATE TABLE IF NOT EXISTS "activities" (
	"id" INTEGER NOT NULL,
	"local_id" TEXT NOT NULL UNIQUE,
	"title" TEXT NOT NULL,
	"description" TEXT NOT NULL,
	PRIMARY KEY("id")
);

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

CREATE TABLE IF NOT EXISTS "qr" (
	"id" INTEGER NOT NULL,
	"user_id" INTEGER NOT NULL,
	"code" TEXT NOT NULL UNIQUE,
	"expires_at" TIMESTAMP NOT NULL,
	"created_at" TIMESTAMP NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

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
