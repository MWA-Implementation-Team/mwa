-- add an optional message to reward QR codes shown as the credits note on the scanners home page.
CREATE TABLE system_qr_codes_new (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  expires_at TEXT,
  secret TEXT UNIQUE NOT NULL,
  balance_delta INTEGER NOT NULL,
  max_uses INTEGER NOT NULL,
  message TEXT,
  CHECK (
    expires_at IS NULL
    OR expires_at > created_at
  ),
  CHECK (balance_delta <> 0),
  CHECK (max_uses > 0)
) STRICT;
INSERT INTO system_qr_codes_new (id, created_at, expires_at, secret, balance_delta, max_uses)
SELECT id, created_at, expires_at, secret, balance_delta, max_uses
FROM system_qr_codes;
DROP TABLE system_qr_codes;
ALTER TABLE system_qr_codes_new RENAME TO system_qr_codes;