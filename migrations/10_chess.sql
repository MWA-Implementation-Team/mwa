CREATE TABLE chess_turns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    session INTEGER NOT NULL REFERENCES gambling_sessions (id) ON DELETE CASCADE,
    player TEXT NOT NULL CHECK (player IN ('p1', 'p2')),
    -- null: first turn accepted
    -- not null: SAN move
    move TEXT
) STRICT;
CREATE INDEX chess_turns_session ON chess_turns (session, id);
