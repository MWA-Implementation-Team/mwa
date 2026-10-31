import { MwaState } from '#src/state.js';
import { randomBytes } from 'node:crypto';
import { runTransaction } from '../transaction.js';
import { insertTransaction } from '../transactions/index.js';

export type SystemQrCode = {
    id: number;
    createdAt: string;
    expiresAt: string | null;
    secret: string;
    balanceDelta: number;
    maxUses: number;
    message: string | null;
};

export type SystemQrClaimResult =
    | { type: 'claimed'; balanceDelta: number }
    | { type: 'expired' }
    | { type: 'used_up' }
    | { type: 'already_claimed' };

// Mint a reward qr
// balance_delta can only be positive
// max_uses caps total claims
// message is an optional note the scanner sees as the credits reason
// Returns the row so the admin can render the qr + link
export function createSystemQrCode(
    state: MwaState,
    balanceDelta: number,
    maxUses: number,
    message?: string | null,
): SystemQrCode {
    const insert = state.prepare(
        `INSERT INTO system_qr_codes (secret, balance_delta, max_uses, message) VALUES (?, ?, ?, ?)`,
    );
    for (let attempt = 0; attempt < 3; attempt++) {
        const secret = randomBytes(32).toString('base64url');
        try {
            const id = Number(
                insert.run(secret, balanceDelta, maxUses, message ?? null).lastInsertRowid,
            );
            return findSystemQrCodeById(state, id)!;
        } catch (error) {
            if (!(error instanceof Error && error.message.includes('UNIQUE'))) {
                throw error;
            }
        }
    }
    throw new Error('could not mint a unique system qr secret after 3 tries');
}

export function findSystemQrCodeBySecret(state: MwaState, secret: string): SystemQrCode | null {
    const row = state.prepare(`SELECT * FROM system_qr_codes WHERE secret = ?`).get(secret);
    return row ? mapSystemQrCode(row) : null;
}

export function listSystemQrCodes(state: MwaState): SystemQrCode[] {
    return state
        .prepare(`SELECT * FROM system_qr_codes ORDER BY id DESC`)
        .all()
        .map(mapSystemQrCode);
}

// Claim a reward QR for a user
export function claimSystemQrCode(
    state: MwaState,
    secret: string,
    userId: number,
): SystemQrClaimResult {
    return runTransaction(state.db, () => {
        const qr = findSystemQrCodeBySecret(state, secret);
        if (!qr) return { type: 'used_up' };
        if (qr.expiresAt && qr.expiresAt <= new Date().toISOString()) {
            return { type: 'expired' };
        }

        const used = state
            .prepare(`SELECT COUNT(*) AS n FROM system_qr_claims WHERE qr_id = ?`)
            .get(qr.id)!.n as number;
        if (used >= qr.maxUses) return { type: 'used_up' };

        const already = state
            .prepare(`SELECT 1 FROM system_qr_claims WHERE qr_id = ? AND user_id = ?`)
            .get(qr.id, userId);
        if (already) return { type: 'already_claimed' };

        // The UNIQUE(qr_id, user_id) constraint is the real double-scan guard —
        // a concurrent duplicate insert throws and rolls back the transaction.
        state
            .prepare(`INSERT INTO system_qr_claims (qr_id, user_id) VALUES (?, ?)`)
            .run(qr.id, userId);

        insertTransaction(state, 'system', userId, qr.balanceDelta, qr.id, qr.message);
        return { type: 'claimed', balanceDelta: qr.balanceDelta };
    });
}

function mapSystemQrCode(row: Record<string, unknown>): SystemQrCode {
    return {
        id: row.id as number,
        createdAt: row.created_at as string,
        expiresAt: (row.expires_at as string | null) ?? null,
        secret: row.secret as string,
        balanceDelta: row.balance_delta as number,
        maxUses: row.max_uses as number,
        message: (row.message as string | null) ?? null,
    };
}

function findSystemQrCodeById(state: MwaState, id: number): SystemQrCode | null {
    const row = state.prepare(`SELECT * FROM system_qr_codes WHERE id = ?`).get(id);
    return row ? mapSystemQrCode(row) : null;
}
