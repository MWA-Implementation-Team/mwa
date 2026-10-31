import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createUser } from '../users/index.js';
import { createTestMwaState } from '#src/state.js';
import { findUserById } from '../users/index.js';
import {
    claimSystemQrCode,
    createSystemQrCode,
    findSystemQrCodeBySecret,
    listSystemQrCodes,
} from './index.js';

const state = createTestMwaState({});

describe('db/systemqr', () => {
    it('creates a reward QR with a 256-bit secret', () => {
        const qr = createSystemQrCode(state, 50, 3);
        assert.match(qr.secret, /^[A-Za-z0-9_-]{43}$/);
        assert.equal(qr.balanceDelta, 50);
        assert.equal(qr.maxUses, 3);
        assert.equal(findSystemQrCodeBySecret(state, qr.secret)?.id, qr.id);
    });

    it('lists created QRs newest first', () => {
        const a = createSystemQrCode(state, 10, 1);
        const b = createSystemQrCode(state, 20, 1);
        const ids = listSystemQrCodes(state).map((qr) => qr.id);
        assert.deepEqual(ids.slice(0, 2), [b.id, a.id]);
    });

    it('claims a QR and credits the user once', () => {
        const qr = createSystemQrCode(state, 25, 2);
        const user = createUser(state, 'claim@example.com', 'claim_user');
        const result = claimSystemQrCode(state, qr.secret, user.id);
        assert.deepEqual(result, { type: 'claimed', balanceDelta: 25 });
        assert.equal(findUserById(state, user.id)!.currentBalance, 25);
    });

    it('refuses a second claim by the same user', () => {
        const qr = createSystemQrCode(state, 25, 2);
        const user = createUser(state, 'twice@example.com', 'twice_user');
        claimSystemQrCode(state, qr.secret, user.id);
        const second = claimSystemQrCode(state, qr.secret, user.id);
        assert.equal(second.type, 'already_claimed');
        assert.equal(findUserById(state, user.id)!.currentBalance, 25);
    });

    it('stops paying out once max_uses is exhausted', () => {
        const qr = createSystemQrCode(state, 10, 1);
        const a = createUser(state, 'usea@example.com', 'usea_user');
        const b = createUser(state, 'useb@example.com', 'useb_user');
        claimSystemQrCode(state, qr.secret, a.id);
        const result = claimSystemQrCode(state, qr.secret, b.id);
        assert.equal(result.type, 'used_up');
        assert.equal(findUserById(state, b.id)!.currentBalance, 0);
    });

    it('returns used_up for an unknown secret', () => {
        const user = createUser(state, 'unknown@example.com', 'unknown_user');
        assert.equal(claimSystemQrCode(state, 'nope', user.id).type, 'used_up');
    });

    it('stores an optional message as the credit note', () => {
        const qr = createSystemQrCode(state, 15, 1, 'Found it! Nice job.');
        const user = createUser(state, 'msg@example.com', 'msg_user');
        claimSystemQrCode(state, qr.secret, user.id);
        const tx = state
            .prepare(
                `SELECT child_transactions.note FROM child_transactions
                 WHERE child_transactions.user_id = ?`,
            )
            .get(user.id);
        assert.equal(tx?.note, 'Found it! Nice job.');
    });
});
