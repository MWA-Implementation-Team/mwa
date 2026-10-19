CREATE TABLE interact_tokens (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  token TEXT UNIQUE NOT NULL,
  -- unguessable random string encoded in the owner's personal qr code;
  -- identifies the user but authorizes nothing on its own
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id)
) STRICT;
