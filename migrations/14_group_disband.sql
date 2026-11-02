-- soft-delete for groups: a disbanded group keeps its row so its leaderboard
-- score and queue history survive; the partial unique index frees the name.
CREATE TABLE groups_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    owner_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    disbanded_at TEXT
);
INSERT INTO groups_new (id, name, owner_id, phone_number, created_at)
SELECT id, name, owner_id, phone_number, created_at
FROM groups;
DROP TABLE groups;
ALTER TABLE groups_new RENAME TO groups;
-- names are unique among live groups only — disbanding frees the name
CREATE UNIQUE INDEX groups_name_active ON groups (name) WHERE disbanded_at IS NULL;
