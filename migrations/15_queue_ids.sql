-- add AUTOINCREMENT to id

CREATE TABLE queue_entries_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  joined_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  group_id INTEGER NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'left', 'called')),
  closed_at TEXT,
  done_at TEXT,
  activity_slug TEXT REFERENCES activities (slug)
) STRICT;

INSERT INTO queue_entries_new SELECT * FROM queue_entries;

DROP TABLE queue_entries;

ALTER TABLE queue_entries_new RENAME TO queue_entries;

CREATE UNIQUE INDEX queue_entries_one_waiting_per_group ON queue_entries (group_id)
WHERE status = 'waiting';

CREATE INDEX queue_entries_status_joined_at ON queue_entries (status, joined_at);
