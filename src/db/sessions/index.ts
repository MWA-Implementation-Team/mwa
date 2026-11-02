import { MwaState } from '#src/state.js';
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

export type LoginToken = {
    id: number;
    token: string;
    code: string;
    challengeId: string;
};

export const resendCooldownMs = 60_000;

type LoginReservation =
    { type: 'created'; login: LoginToken } | { type: 'cooldown'; retryAfter: number };

export function reserveLoginToken(state: MwaState, email: string): LoginReservation {
    const lastSent = lastLoginTokenSentAt(state, email);
    const remaining = lastSent ? resendCooldownMs - (Date.now() - lastSent.getTime()) : 0;
    if (remaining > 0) {
        return { type: 'cooldown', retryAfter: Math.ceil(remaining / 1000) };
    }
    return { type: 'created', login: createLoginToken(state, email) };
}

// Returns the raw credentials for the email — the link carries `token`, the
// paste-field carries `code`. Only sha256 hashes hit the database. Inserts a
// row WITHOUT invalidating older tokens — see confirmLoginTokenSent: invalidation
// happens after the email is actually sent, so a failed send never bricks the
// previous link. Retries on the astronomically-unlikely hash collision instead
// of letting the UNIQUE constraint 500 the request.
export function createLoginToken(state: MwaState, email: string): LoginToken {
    const insertLoginTokenQuery = state.prepare(`
    INSERT INTO login_tokens (expires_at, token_hash, code_hash, email, challenge_hash) VALUES (?, ?, ?, ?, ?)
    RETURNING id
    `);

    for (let attempt = 0; attempt < 3; attempt++) {
        const token = randomBytes(32).toString('base64url');
        const challengeId = randomBytes(32).toString('base64url');
        const code = Array.from(
            { length: 8 },
            () => codeAlphabet[randomInt(codeAlphabet.length)],
        ).join('');
        try {
            const row = insertLoginTokenQuery.get(
                expiresIn(loginTokenTtlMinutes * 60_000),
                hashToken(token),
                hashToken(code),
                email,
                hashToken(challengeId),
            );
            return { id: Number(row!.id), token, code, challengeId };
        } catch (error) {
            if (!(error instanceof Error && error.message.includes('UNIQUE'))) {
                throw error;
            }
        }
    }
    throw new Error('could not mint a unique login token after 3 tries');
}

export function confirmLoginTokenSent(state: MwaState, email: string, keepId: number) {
    state
        .prepare(
            `
    UPDATE login_tokens SET used_at = ${now}
    WHERE email = ? AND used_at IS NULL AND id < ?
    `,
        )
        .run(email, keepId);
}

// Call when the send failed — removes the just-inserted row so the resend cap
// doesn't arm and the email's previous token stays valid.
export function discardLoginToken(state: MwaState, id: number) {
    const deleteTokenQuery = state.prepare(`
    DELETE FROM login_tokens WHERE id = ?
    `);

    deleteTokenQuery.run(id);
}

// Link path — consumes atomically and returns the email the token was issued to.
export function redeemLoginToken(state: MwaState, token: string): string | null {
    const consumeByTokenQuery = state.prepare(`
    UPDATE login_tokens SET used_at = ${now}
    WHERE token_hash = ? AND used_at IS NULL AND expires_at > ${now}
    RETURNING email
    `);

    const row = consumeByTokenQuery.get(hashToken(token));
    return (row?.email as string) ?? null;
}

export type CodeResult =
    { type: 'redeemed'; email: string } | { type: 'wrong'; email: string } | { type: 'invalid' };

export function redeemLoginCode(state: MwaState, challengeId: string, code: string): CodeResult {
    const row = state
        .prepare(
            `
            SELECT id, code_hash, email FROM login_tokens
            WHERE challenge_hash = ? AND used_at IS NULL AND expires_at > ${now}
        `,
        )
        .get(hashToken(challengeId));
    if (!row) return { type: 'invalid' };

    if (row.code_hash !== hashToken(code.trim().toUpperCase())) {
        state
            .prepare(
                `
                UPDATE login_tokens SET attempts = attempts + 1,
                    used_at = CASE WHEN attempts + 1 >= ? THEN ${now} ELSE used_at END
                WHERE id = ?
            `,
            )
            .run(maxCodeAttempts, row.id);
        return { type: 'wrong', email: row.email as string };
    }
    state.prepare(`UPDATE login_tokens SET used_at = ${now} WHERE id = ?`).run(row.id);
    return { type: 'redeemed', email: row.email as string };
}

export function lastLoginTokenSentAt(state: MwaState, email: string): Date | null {
    const lastLoginTokenSentAtQuery = state.prepare(`
    SELECT MAX(created_at) AS last_sent FROM login_tokens WHERE email = ?
    `);

    const row = lastLoginTokenSentAtQuery.get(email);
    return row?.last_sent ? new Date(row.last_sent as string) : null;
}

// Returns the raw token for the mwa-session cookie — only its sha256 is stored.
export function createSession(state: MwaState, userId: number): string {
    const insertSessionQuery = state.prepare(`
    INSERT INTO sessions (expires_at, token_hash, user_id) VALUES (?, ?, ?)
    `);

    const token = randomBytes(32).toString('base64url');
    insertSessionQuery.run(expiresIn(sessionTtlDays * 86_400_000), hashToken(token), userId);
    return token;
}

export function findSessionUserId(state: MwaState, token: string): number | null {
    const sessionUserQuery = state.prepare(`
    SELECT user_id FROM sessions WHERE token_hash = ? AND expires_at > ${now}
    `);

    const row = sessionUserQuery.get(hashToken(token));
    return (row?.user_id as number) ?? null;
}

export function deleteSession(state: MwaState, token: string) {
    const deleteSessionQuery = state.prepare(`
    DELETE FROM sessions WHERE token_hash = ?
    `);

    deleteSessionQuery.run(hashToken(token));
}

// Lazy cleanup — expired rows are ignored on read anyway, this just reclaims them.
export function deleteExpiredSessions(state: MwaState) {
    const deleteExpiredSessionsQuery = state.prepare(`
    DELETE FROM sessions WHERE expires_at <= ${now}
    `);

    deleteExpiredSessionsQuery.run();
}
