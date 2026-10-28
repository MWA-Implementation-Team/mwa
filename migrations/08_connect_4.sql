-- the previous gambling_sessions schema had a bug that disallowed draws from being representable,
-- have to recreate it with the fix

CREATE TABLE gambling_sessions_new (
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
    -- ended (win)      : p1_deposit_tx != null, p2_deposit_tx != null, winner_tx != null
    -- ended (draw)     : p1_deposit_tx == null, p2_deposit_tx == null, winner_tx == null

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
      NOT ( status = 'pending' AND (p1_deposit_tx IS NULL OR p2_deposit_tx IS NOT NULL OR winner IS NOT NULL) )
    ),
    CHECK (
      NOT ( (status = 'expired' OR status = 'rejected') AND (p1_deposit_tx IS NOT NULL OR p2_deposit_tx IS NOT NULL OR winner IS NOT NULL) )
    ),
    CHECK (
      NOT ( status = 'running' AND (p1_deposit_tx IS NULL OR p2_deposit_tx IS NULL OR winner IS NOT NULL) )
    ),
    CHECK (
      NOT ( status = 'ended' AND winner IS NULL )
    ),
    CHECK (
      NOT ( (winner = 'p1' OR winner = 'p2') AND (p1_deposit_tx IS NULL OR p2_deposit_tx IS NULL OR winner_tx IS NULL) )
    ),
    CHECK (
      NOT ( winner = 'draw' AND (p1_deposit_tx IS NOT NULL OR p2_deposit_tx IS NOT NULL OR winner_tx IS NOT NULL) )
    ),
    CHECK (
      NOT ( game_type = 'coin_flip' AND winner = 'draw' )
    ),
    CHECK (
      NOT ( winner IS NULL AND winner_tx IS NOT NULL )
    )
) STRICT;

INSERT INTO gambling_sessions_new (
    id, created_at, p1, p2, bet_amount, game_type, status,
    p1_deposit_tx, p2_deposit_tx, winner, winner_tx
)
SELECT id, created_at, p1, p2, bet_amount, game_type, status,
    p1_deposit_tx, p2_deposit_tx, winner, winner_tx
FROM gambling_sessions;

DROP TABLE gambling_sessions;
ALTER TABLE gambling_sessions_new RENAME TO gambling_sessions;

--

CREATE TABLE IF NOT EXISTS connect_4_turns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  session INTEGER NOT NULL REFERENCES gambling_sessions (id) ON DELETE CASCADE,
  player TEXT NOT NULL CHECK (player IN ('p1', 'p2')),
  new_board TEXT NOT NULL
) STRICT;
