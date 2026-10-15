import { database } from '#src/state.js';
import { findUserById, User } from '#src/db/users.js';
import { randomBytes } from 'node:crypto';

const tokenByUserQuery = database.prepare(`SELECT token FROM interact_tokens WHERE user_id = ?`);

const userIdByTokenQuery = database.prepare(`SELECT user_id FROM interact_tokens WHERE token = ?`);

const insertTokenQuery = database.prepare(
    `INSERT INTO interact_tokens (token, user_id) VALUES (?, ?)`,
);

// Minted lazily on the owner's first /app view; one per user, never rotated.
// Stored raw (like system_qr_codes.secret) because the QR needs the real
// value on every render — a hash can't be turned back into a URL. Safe to
// store because the token identifies the owner but authorizes nothing:
// actions are gated by the scanner's session and role. Retries on the
// astronomically-unlikely token collision instead of letting UNIQUE 500.
export function getOrCreateInteractToken(userId: number): string {
    const existing = tokenByUserQuery.get(userId);
    if (existing) {
        return existing.token as string;
    }
    for (let attempt = 0; attempt < 3; attempt++) {
        const token = randomBytes(32).toString('base64url');
        try {
            insertTokenQuery.run(token, userId);
            return token;
        } catch (error) {
            if (!(error instanceof Error && error.message.includes('UNIQUE'))) {
                throw error;
            }
        }
    }
    throw new Error('could not mint a unique interact token after 3 tries');
}

export function findUserByInteractToken(token: string): User | null {
    const row = userIdByTokenQuery.get(token);
    return row ? findUserById(row.user_id as number) : null;
}
