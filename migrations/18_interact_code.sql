-- human-typeable alias for the personal interact token — the "sąveikos
-- kodas" shown under the QR so a friend can open your interact page by
-- typing instead of scanning. nullable: minted lazily like the token, so
-- rows minted before this column get one on the owner's next /app render.
ALTER TABLE interact_tokens ADD COLUMN code TEXT;
CREATE UNIQUE INDEX interact_tokens_code ON interact_tokens (code);
