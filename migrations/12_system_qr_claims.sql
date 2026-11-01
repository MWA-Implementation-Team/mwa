CREATE TABLE system_qr_claims (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  qr_id INTEGER NOT NULL REFERENCES system_qr_codes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  UNIQUE (qr_id, user_id)
) STRICT;

CREATE TABLE child_transactions_new (
  id INTEGER PRIMARY KEY,
  parent_id INTEGER NOT NULL REFERENCES parent_transactions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  balance_delta INTEGER NOT NULL,
  system_qr_code_id INTEGER REFERENCES system_qr_codes(id),
  group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
  note TEXT,
  CHECK (balance_delta <> 0),
  UNIQUE (parent_id, user_id)
) STRICT;
INSERT INTO child_transactions_new (id, parent_id, user_id, balance_delta, system_qr_code_id, group_id)
SELECT id, parent_id, user_id, balance_delta, system_qr_code_id, group_id
FROM child_transactions;
DROP TABLE child_transactions;
ALTER TABLE child_transactions_new RENAME TO child_transactions;
CREATE INDEX child_transactions_index_system_qr_code_id ON child_transactions (system_qr_code_id)
WHERE system_qr_code_id IS NOT NULL;
CREATE INDEX child_transactions_index_user_id ON child_transactions (user_id);
CREATE INDEX child_transactions_index_group_id ON child_transactions (group_id)
WHERE group_id IS NOT NULL;