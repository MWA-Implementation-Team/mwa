CREATE TABLE IF NOT EXISTS gambling_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    p1 INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    p2 INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    bet_amount INTEGER NOT NULL,
    game_type TEXT NOT NULL,

    -- date when the game was accepted by p2, null = pending
    started_date TEXT DEFAULT NULL,
    -- winner funds transaction, null = not yet won by anyone
    winner_tx INTEGER REFERENCES parent_transactions (id) ON DELETE CASCADE DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS coin_flip_games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session INTEGER NOT NULL UNIQUE REFERENCES gambling_sessions (id) ON DELETE CASCADE,

    p1_bet TEXT NOT NULL,
    actual_result TEXT NOT NULL
);

