ALTER TABLE login_tokens ADD COLUMN challenge_hash TEXT;

-- clear old login tokens, new ones require challenge id
DELETE FROM login_tokens;

CREATE UNIQUE INDEX login_tokens_index_challenge_hash ON login_tokens (challenge_hash);
