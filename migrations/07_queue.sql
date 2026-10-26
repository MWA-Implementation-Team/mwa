CREATE TABLE queue_entries (
  id INTEGER PRIMARY KEY,
  joined_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  group_id INTEGER NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
  -- 'waiting' groups are in line; 'left' and 'called' keep the row so
  -- history shows who queued, bailed, or was assigned to a station
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'left', 'called')),
  closed_at TEXT,
  -- set when a called group finishes its station; stays 'called' in status
  done_at TEXT,
  -- the station that called the group (host tools set this)
  activity_slug TEXT REFERENCES activities (slug)
) STRICT;
-- a group holds at most one spot in line at a time
CREATE UNIQUE INDEX queue_entries_one_waiting_per_group ON queue_entries (group_id)
WHERE status = 'waiting';
CREATE INDEX queue_entries_status_joined_at ON queue_entries (status, joined_at);