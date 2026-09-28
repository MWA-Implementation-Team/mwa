CREATE TABLE users (
  id         TEXT PRIMARY KEY NOT NULL, -- uuid
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  email      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  username   TEXT NOT NULL UNIQUE COLLATE NOCASE,
  role       TEXT NOT NULL CHECK (role IN ('admin', 'host', 'user'))
) STRICT;

CREATE TABLE system_qr_codes (
  id            INTEGER PRIMARY KEY,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  expires_at    TEXT,
  secret        TEXT UNIQUE NOT NULL, -- unguessable random string encoded in qr code
  balance_delta INTEGER NOT NULL,
  max_uses      INTEGER NOT NULL,
  CHECK (expires_at IS NULL OR expires_at > created_at),
  CHECK (balance_delta <> 0),
  CHECK (max_uses > 0)
) STRICT;

CREATE TABLE parent_transactions (
  id         INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  kind       TEXT NOT NULL CHECK (kind IN ('transfer', 'purchase', 'system'))
) STRICT;

CREATE TABLE child_transactions (
  id                INTEGER PRIMARY KEY,
  parent_id         INTEGER NOT NULL REFERENCES parent_transactions(id),
  user_id           TEXT NOT NULL REFERENCES users(id),
  balance_delta     INTEGER NOT NULL,
  system_qr_code_id INTEGER REFERENCES system_qr_codes(id), -- if not null, parent_transactions kind must be 'system'
  CHECK (balance_delta <> 0),
  UNIQUE (parent_id, user_id)
) STRICT;

CREATE INDEX child_transactions_index_system_qr_code_id
  ON child_transactions (system_qr_code_id)
  WHERE system_qr_code_id IS NOT NULL;

CREATE INDEX child_transactions_index_user_id
  ON child_transactions (user_id);

CREATE TABLE user_badges (
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  badge_id   TEXT NOT NULL, -- references app config id
  user_id    TEXT NOT NULL REFERENCES users(id),
  UNIQUE (badge_id, user_id)
) STRICT;

CREATE INDEX user_badges_index_user_id
  ON user_badges (user_id);
