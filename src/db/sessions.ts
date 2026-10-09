import { database } from '#src/state.js';
import { createHash, randomBytes, randomInt } from 'node:crypto';

export const loginTokenTtlMinutes = 15;
export const sessionTtlDays = 30;
export const maxCodeAttempts = 5;

// 30 unambiguous characters — no 0/O, 1/I/L/U, or easily-confused pairs.
const codeAlphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

function expiresIn(ms: number): string {
    return new Date(Date.now() + ms).toISOString();
}

const now = `strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`;

const insertLoginTokenQuery = database.prepare(`
INSERT INTO login_tokens (expires_at, token_hash, code_hash, email) VALUES (?, ?, ?, ?)
`);

const consumeByTokenQuery = database.prepare(`
UPDATE login_tokens SET used_at = ${now}
WHERE token_hash = ? AND used_at IS NULL AND expires_at > ${now}
RETURNING email
`);

const tokenByEmailQuery = database.prepare(`
SELECT id, code_hash FROM login_tokens
WHERE email = ? AND used_at IS NULL AND expires_at > ${now}
`);

const markTokenUsedQuery = database.prepare(`
UPDATE login_tokens SET used_at = ${now} WHERE id = ? RETURNING email
`);

const bumpAttemptsQuery = database.prepare(`
UPDATE login_tokens SET attempts = attempts + 1 WHERE id = ? RETURNING attempts
`);

const killTokenQuery = database.prepare(`
UPDATE login_tokens SET used_at = ${now} WHERE id = ?
`);

const invalidateLoginTokensQuery = database.prepare(`
UPDATE login_tokens SET used_at = ${now}
WHERE email = ? AND used_at IS NULL
`);

const lastLoginTokenSentAtQuery = database.prepare(`
SELECT MAX(created_at) AS last_sent FROM login_tokens WHERE email = ?
`);

export type LoginToken = { token: string; code: string };

// Returns the raw credentials for the email — the link carries `token`, the
// paste-field carries `code`. Only sha256 hashes hit the database. A new request
// invalidates the email's previous unconsumed tokens (newest link wins).
export function createLoginToken(email: string): LoginToken {
    const token = randomBytes(32).toString('base64url');
    const code = Array.from({ length: 8 }, () => codeAlphabet[randomInt(codeAlphabet.length)]).join(
        '',
    );
    invalidateLoginTokensQuery.run(email);
    insertLoginTokenQuery.run(
        expiresIn(loginTokenTtlMinutes * 60_000),
        hashToken(token),
        hashToken(code),
        email,
    );
    return { token, code };
}

// Link path — consumes atomically and returns the email the token was issued to.
export function redeemLoginToken(token: string): string | null {
    const row = consumeByTokenQuery.get(hashToken(token));
    return (row?.email as string) ?? null;
}

// Code path — the form carries the email, so wrong guesses land on a specific row
// we can count. Wrong code: bump attempts; past the cap, the token dies.
export type CodeResult = 'redeemed' | 'wrong' | 'invalid';

export function redeemLoginCode(email: string, code: string): CodeResult {
    const row = tokenByEmailQuery.get(email);
    if (!row) {
        return 'invalid';
    }
    if (row.code_hash !== hashToken(code.trim().toUpperCase())) {
        const attempts = (bumpAttemptsQuery.get(row.id)?.attempts as number) ?? 0;
        if (attempts >= maxCodeAttempts) {
            killTokenQuery.run(row.id);
        }
        return 'wrong';
    }
    return (markTokenUsedQuery.get(row.id)?.email as string) ? 'redeemed' : 'invalid';
}

export function lastLoginTokenSentAt(email: string): Date | null {
    const row = lastLoginTokenSentAtQuery.get(email);
    return row?.last_sent ? new Date(row.last_sent as string) : null;
}

const insertSessionQuery = database.prepare(`
INSERT INTO sessions (expires_at, token_hash, user_id) VALUES (?, ?, ?)
`);

const sessionUserQuery = database.prepare(`
SELECT user_id FROM sessions WHERE token_hash = ? AND expires_at > ${now}
`);

const deleteSessionQuery = database.prepare(`
DELETE FROM sessions WHERE token_hash = ?
`);

const deleteExpiredSessionsQuery = database.prepare(`
DELETE FROM sessions WHERE expires_at <= ${now}
`);

// Returns the raw token for the mwa-session cookie — only its sha256 is stored.
export function createSession(userId: number): string {
    const token = randomBytes(32).toString('base64url');
    insertSessionQuery.run(expiresIn(sessionTtlDays * 86_400_000), hashToken(token), userId);
    return token;
}

export function findSessionUserId(token: string): number | null {
    const row = sessionUserQuery.get(hashToken(token));
    return (row?.user_id as number) ?? null;
}

export function deleteSession(token: string) {
    deleteSessionQuery.run(hashToken(token));
}

// Lazy cleanup — expired rows are ignored on read anyway, this just reclaims them.
export function deleteExpiredSessions() {
    deleteExpiredSessionsQuery.run();
}
