import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';
import { createUser } from '../users/index.js';
import {
    confirmLoginTokenSent,
    createLoginToken,
    createSession,
    deleteSession,
    discardLoginToken,
    findSessionUserId,
    lastLoginTokenSentAt,
    maxCodeAttempts,
    redeemLoginCode,
    redeemLoginToken,
} from './index.js';
import { createTestMwaState } from '#src/state.js';

const state = createTestMwaState({});

function expireToken(table: 'login_tokens' | 'sessions', token: string) {
    // Move the row's expiry into the past by hashing the raw token ourselves.
    const hash = createHash('sha256').update(token).digest('hex');
    state.db
        .prepare(`UPDATE ${table} SET expires_at = '2000-01-01T00:00:00.000Z' WHERE token_hash = ?`)
        .run(hash);
}

describe('db/sessions — login tokens', () => {
    it('a fresh token redeems to its email, exactly once', () => {
        const { token } = createLoginToken(state, 'tok1@example.com');
        assert.equal(redeemLoginToken(state, token), 'tok1@example.com');
        assert.equal(redeemLoginToken(state, token), null);
    });

    it('an unknown or forged token redeems to null', () => {
        assert.equal(redeemLoginToken(state, 'forged-token'), null);
    });

    it('an expired token redeems to null', () => {
        const { token } = createLoginToken(state, 'tok2@example.com');
        expireToken('login_tokens', token);
        assert.equal(redeemLoginToken(state, token), null);
    });

    it('a confirmed send invalidates the previous token', () => {
        const first = createLoginToken(state, 'tok3@example.com');
        const second = createLoginToken(state, 'tok3@example.com');
        confirmLoginTokenSent(state, 'tok3@example.com', second.id);
        assert.equal(redeemLoginToken(state, first.token), null);
        assert.equal(redeemLoginToken(state, second.token), 'tok3@example.com');
    });

    it('discarding an unsent token keeps the previous link alive', () => {
        const first = createLoginToken(state, 'tok5@example.com');
        const second = createLoginToken(state, 'tok5@example.com');
        discardLoginToken(state, second.id);
        assert.equal(redeemLoginToken(state, first.token), 'tok5@example.com');
    });

    it('lastLoginTokenSentAt reports the most recent send for the resend cap', () => {
        assert.equal(lastLoginTokenSentAt(state, 'nosend@example.com'), null);
        createLoginToken(state, 'tok4@example.com');
        const sentAt = lastLoginTokenSentAt(state, 'tok4@example.com');
        assert.ok(sentAt instanceof Date);
        assert.ok(Date.now() - sentAt!.getTime() < 5000);
    });
});

describe('db/sessions — login codes', () => {
    it('a correct code redeems the token, case-insensitively and exactly once', () => {
        const { code, challengeId, token } = createLoginToken(state, 'code1@example.com');
        assert.deepEqual(redeemLoginCode(state, challengeId, code.toLowerCase()), {
            type: 'redeemed',
            email: 'code1@example.com',
        });
        assert.deepEqual(redeemLoginCode(state, challengeId, code), { type: 'invalid' });
        assert.equal(redeemLoginToken(state, token), null);
    });

    it('wrong codes count attempts and the token dies at the cap', () => {
        const { code, challengeId, token } = createLoginToken(state, 'code2@example.com');
        for (let i = 0; i < maxCodeAttempts; i++) {
            assert.equal(redeemLoginCode(state, challengeId, 'not-a-code').type, 'wrong');
        }
        assert.equal(redeemLoginCode(state, challengeId, code).type, 'invalid');
        assert.equal(redeemLoginToken(state, token), null);
    });

    it('codes with no live challenge report invalid', () => {
        assert.deepEqual(redeemLoginCode(state, 'unknown-challenge', 'ABCDEFGH'), {
            type: 'invalid',
        });
    });

    it('creates an independent random challenge and stores only its hash', () => {
        const { challengeId, token, id } = createLoginToken(state, 'challenge@example.com');
        assert.notEqual(challengeId, token);
        assert.match(challengeId, /^[A-Za-z0-9_-]{43}$/);
        const row = state.db
            .prepare('SELECT challenge_hash FROM login_tokens WHERE id = ?')
            .get(id)!;
        assert.equal(row.challenge_hash, createHash('sha256').update(challengeId).digest('hex'));
    });

    it('a wrong guess affects only the selected challenge, even for the same email', () => {
        const email = 'isolated@example.com';
        const first = createLoginToken(state, email);
        const second = createLoginToken(state, email);
        for (let i = 0; i < maxCodeAttempts; i++) {
            redeemLoginCode(state, second.challengeId, 'not-a-code');
        }
        assert.equal(redeemLoginCode(state, first.challengeId, first.code).type, 'redeemed');
    });

    it('expired challenges and challenges consumed by link cannot redeem', () => {
        const expired = createLoginToken(state, 'code-expired@example.com');
        expireToken('login_tokens', expired.token);
        assert.equal(redeemLoginCode(state, expired.challengeId, expired.code).type, 'invalid');
        const used = createLoginToken(state, 'code-used@example.com');
        redeemLoginToken(state, used.token);
        assert.equal(redeemLoginCode(state, used.challengeId, used.code).type, 'invalid');
    });
});

describe('db/sessions — sessions', () => {
    it('a session resolves to its user until deleted', () => {
        const user = createUser(state, 'sess1@example.com', 'sess1');
        const token = createSession(state, user.id);
        assert.equal(findSessionUserId(state, token), user.id);
        deleteSession(state, token);
        assert.equal(findSessionUserId(state, token), null);
    });

    it('an unknown or expired session resolves to null', () => {
        assert.equal(findSessionUserId(state, 'forged'), null);
        const user = createUser(state, 'sess2@example.com', 'sess2');
        const token = createSession(state, user.id);
        expireToken('sessions', token);
        assert.equal(findSessionUserId(state, token), null);
    });
});
