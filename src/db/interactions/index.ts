import { MwaState } from '#src/state.js';
import { findUserById, User } from '#src/db/users/index.js';
import { randomBytes, randomInt } from 'node:crypto';

// Minted lazily on the owner's first /app view; one per user, never rotated.
// Stored raw (like system_qr_codes.secret) because the QR needs the real
// value on every render — a hash can't be turned back into a URL. Safe to
// store because the token identifies the owner but authorizes nothing:
// actions are gated by the scanner's session and role. Retries on the
// astronomically-unlikely token collision instead of letting UNIQUE 500.
export function getOrCreateInteractToken(state: MwaState, userId: number): string {
    const tokenByUserQuery = state.prepare(`SELECT token FROM interact_tokens WHERE user_id = ?`);
    const existing = tokenByUserQuery.get(userId);
    if (existing) {
        return existing.token as string;
    }
    const insertTokenQuery = state.prepare(
        `INSERT INTO interact_tokens (token, user_id) VALUES (?, ?)`,
    );
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

// The "sąveikos kodas" alphabet — 5 unambiguous uppercase letters (no I/L/O),
// typeable when a QR scan isn't handy. Minted lazily on the row like the
// token; rotating the QR leaves the code alone.
const interactCodeAlphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ';

export function getOrCreateInteractCode(state: MwaState, userId: number): string {
    return mintInteractCode(state, userId, false);
}

export function rotateInteractCode(state: MwaState, userId: number): string {
    return mintInteractCode(state, userId, true);
}

function mintInteractCode(state: MwaState, userId: number, rotate: boolean): string {
    const codeByUserQuery = state.prepare(`SELECT code FROM interact_tokens WHERE user_id = ?`);
    const existing = codeByUserQuery.get(userId);
    if (!existing) {
        // no row yet — mint token + row, then fall through to code minting
        getOrCreateInteractToken(state, userId);
    } else if (existing.code && !rotate) {
        return existing.code as string;
    }
    const setCodeQuery = state.prepare(`UPDATE interact_tokens SET code = ? WHERE user_id = ?`);
    for (let attempt = 0; attempt < 3; attempt++) {
        const code = Array.from(
            { length: 5 },
            () => interactCodeAlphabet[randomInt(interactCodeAlphabet.length)],
        ).join('');
        if (code === existing?.code) continue;
        try {
            setCodeQuery.run(code, userId);
            return code;
        } catch (error) {
            if (!(error instanceof Error && error.message.includes('UNIQUE'))) {
                throw error;
            }
        }
    }
    throw new Error('could not mint a unique interact code after 3 tries');
}

export function findTokenByInteractCode(state: MwaState, code: string): string | null {
    const tokenByCodeQuery = state.prepare(`SELECT token FROM interact_tokens WHERE code = ?`);
    const row = tokenByCodeQuery.get(code);
    return row ? (row.token as string) : null;
}

export function findUserByInteractToken(state: MwaState, token: string): User | null {
    const userIdByTokenQuery = state.prepare(`SELECT user_id FROM interact_tokens WHERE token = ?`);
    const row = userIdByTokenQuery.get(token);
    return row ? findUserById(state, row.user_id as number) : null;
}

// Rotate a users personal QR token
// Updates the row so the sidebar QR code keeps working on the next render
export function rotateInteractToken(state: MwaState, userId: number): string {
    const updateTokenQuery = state.prepare(
        `UPDATE interact_tokens SET token = ? WHERE user_id = ?`,
    );
    for (let attempt = 0; attempt < 3; attempt++) {
        const token = randomBytes(32).toString('base64url');
        try {
            const result = updateTokenQuery.run(token, userId);
            if (result.changes === 0) {
                // if row doesn't exist yet, mint one like getOrCreateInteractToken
                return getOrCreateInteractToken(state, userId);
            }
            return token;
        } catch (error) {
            if (!(error instanceof Error && error.message.includes('UNIQUE'))) {
                throw error;
            }
        }
    }
    throw new Error('could not rotate interact token after 3 tries');
}
