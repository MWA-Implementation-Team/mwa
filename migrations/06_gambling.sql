-- adding new kinds for parent transaction: gambling_deduction, gambling_winnings
CREATE TABLE parent_transactions_new (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  kind TEXT NOT NULL CHECK (kind IN ('transfer', 'purchase', 'system', 'gambling_deduction', 'gambling_winnings'))
) STRICT;

INSERT INTO parent_transactions_new (id, created_at, kind)
SELECT id, created_at, kind FROM parent_transactions;

DROP TABLE parent_transactions;
ALTER TABLE parent_transactions_new RENAME TO parent_transactions;

-- adding ON DELETE CASCADE on parent_id
CREATE TABLE child_transactions_new (
  id INTEGER PRIMARY KEY,
  parent_id INTEGER NOT NULL REFERENCES parent_transactions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  balance_delta INTEGER NOT NULL,
  -- if not null, parent_transactions kind must be 'system'
  system_qr_code_id INTEGER REFERENCES system_qr_codes(id),
  CHECK (balance_delta <> 0),
  UNIQUE (parent_id, user_id)
) STRICT;

INSERT INTO child_transactions_new (id, parent_id, user_id, balance_delta, system_qr_code_id)
SELECT id, parent_id, user_id, balance_delta, system_qr_code_id FROM child_transactions;

DROP TABLE child_transactions;
ALTER TABLE child_transactions_new RENAME TO child_transactions;

CREATE INDEX child_transactions_index_system_qr_code_id ON child_transactions (system_qr_code_id)
WHERE system_qr_code_id IS NOT NULL;

CREATE INDEX child_transactions_index_user_id ON child_transactions (user_id);

--

CREATE TABLE IF NOT EXISTS gambling_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    -- challenger
    p1 INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    -- chalengee
    p2 INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    bet_amount INTEGER NOT NULL,
    game_type TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'expired', 'rejected', 'running', 'ended')),
    -- pending          : p1_deposit_tx != null, p2_deposit_tx == null, winner_tx == null
    -- expired/rejected : p1_deposit_tx == null, p2_deposit_tx == null, winner_tx == null
    -- running          : p1_deposit_tx != null, p2_deposit_tx != null, winner_tx == null
    -- ended            : p1_deposit_tx != null, p2_deposit_tx != null, winner_tx != null

    -- transaction where bet amount is deducted from p1
    -- null = p2 rejected the challenge
    p1_deposit_tx INTEGER REFERENCES parent_transactions (id) ON DELETE SET NULL,
    -- transaction where bet amount is deducted from p2,
    -- null = p2 didn't accept the challenge yet
    p2_deposit_tx INTEGER REFERENCES parent_transactions (id) ON DELETE CASCADE DEFAULT NULL,

    winner TEXT DEFAULT NULL CHECK (winner IN ('p1', 'p2', 'draw')),
    -- winner funds transaction, null = not yet won by anyone or draw
    winner_tx INTEGER REFERENCES parent_transactions (id) ON DELETE CASCADE DEFAULT NULL,

    CHECK (
      p1 != p2
    ),
    CHECK (
      NOT ( status == 'pending' AND (p1_deposit_tx IS NULL OR p2_deposit_tx IS NOT NULL OR winner IS NOT NULL) )
    ),
    CHECK (
      NOT ( (status == 'expired' OR status == 'rejected') AND (p1_deposit_tx IS NOT NULL OR p2_deposit_tx IS NOT NULL OR winner IS NOT NULL) )
    ),
    CHECK (
      NOT ( (status == 'running') AND (p1_deposit_tx IS NULL OR p2_deposit_tx IS NULL OR winner IS NOT NULL) )
    ),
    CHECK (
      NOT ( (status == 'ended') AND (p1_deposit_tx IS NULL OR p2_deposit_tx IS NULL OR winner IS NULL) )
    ),
    CHECK (
      NOT ( (winner == 'p1' OR winner == 'p2') AND winner_tx IS NULL )
    ),
    CHECK (
      NOT ( winner == 'draw' AND winner_tx IS NOT NULL )
    ),
    CHECK (
      NOT ( game_type == 'coin_flip' AND winner == 'draw' )
    )
);

CREATE TABLE IF NOT EXISTS coin_flip_games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session INTEGER NOT NULL UNIQUE REFERENCES gambling_sessions (id) ON DELETE CASCADE,

    p1_bet TEXT NOT NULL CHECK (p1_bet IN ('heads', 'tails')),
    actual_result TEXT NOT NULL CHECK (actual_result IN ('heads', 'tails'))
);
