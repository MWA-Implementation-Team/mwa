-- coins are attributed to the group the user belonged to when the delta was
-- recorded, so switching groups can never move past earnings
ALTER TABLE child_transactions
ADD COLUMN group_id INTEGER REFERENCES groups(id);
CREATE INDEX child_transactions_index_group_id ON child_transactions (group_id)
WHERE group_id IS NOT NULL;
-- adding 'host_grant' kind for host -> user / host -> group coin grants
CREATE TABLE parent_transactions_new (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  kind TEXT NOT NULL CHECK (
    kind IN (
      'transfer',
      'purchase',
      'system',
      'gambling_deduction',
      'gambling_winnings',
      'host_grant'
    )
  )
) STRICT;
INSERT INTO parent_transactions_new (id, created_at, kind)
SELECT id,
  created_at,
  kind
FROM parent_transactions;
DROP TABLE parent_transactions;
ALTER TABLE parent_transactions_new
  RENAME TO parent_transactions;
