-- adding new kinds for parent transaction: gambling_deduction, gambling_winnings
DROP TABLE parent_transactions;
CREATE TABLE parent_transactions (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  kind TEXT NOT NULL CHECK (kind IN ('transfer', 'purchase', 'system', 'gambling_deduction', 'gambling_winnings'))
) STRICT;

CREATE TABLE IF NOT EXISTS gambling_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    -- challenger
    p1 INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    -- chalengee
    p2 INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    bet_amount INTEGER NOT NULL,
    game_type TEXT NOT NULL,

    -- p2 rejected the challenge
    is_rejected BOOLEAN DEFAULT FALSE,

    -- transaction where bet amount is deducted from p1
    p1_deposit_tx INTEGER NOT NULL REFERENCES parent_transactions (id) ON DELETE CASCADE,
    -- transaction where bet amount is deducted from p2,
    -- null = p2 didn't accept the challenge yet
    p2_deposit_tx INTEGER REFERENCES parent_transactions (id) ON DELETE CASCADE DEFAULT NULL,

    -- winner funds transaction, null = not yet won by anyone
    winner_tx INTEGER REFERENCES parent_transactions (id) ON DELETE CASCADE DEFAULT NULL,

    CHECK (
      p1 != p2
    ),
    CHECK (
      is_rejected = FALSE
      OR p2_deposit_tx IS NULL
    ),
    CHECK (
      p2_deposit_tx IS NOT NULL
      OR winner_tx IS NULL
    )
);

CREATE TABLE IF NOT EXISTS coin_flip_games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session INTEGER NOT NULL UNIQUE REFERENCES gambling_sessions (id) ON DELETE CASCADE,

    p1_bet TEXT NOT NULL,
    actual_result TEXT NOT NULL
);

