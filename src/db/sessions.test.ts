import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';
import { createUser } from './users.js';
import {
    confirmLoginTokenSent,
    createLoginToken,
    createSession,
    deleteSession,
    discardLoginToken,
    findSessionUserId,
    lastLoginTokenSentAt,
    maxCodeAttempts,
    pruneLoginTokens,
    redeemLoginCode,
    redeemLoginToken,
} from './sessions.js';
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

    it('pruneLoginTokens reclaims used and expired rows', () => {
        const { token } = createLoginToken(state, 'prune@example.com');
        redeemLoginToken(state, token);
        const { token: expired } = createLoginToken(state, 'prune@example.com');
        expireToken('login_tokens', expired);
        pruneLoginTokens(state);
        const row = state.db
            .prepare('SELECT COUNT(*) AS n FROM login_tokens WHERE email = ?')
            .get('prune@example.com');
        assert.equal(row!.n, 0);
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
    it('a correct code redeems the token, case-insensitively', () => {
        const { code } = createLoginToken(state, 'code1@example.com');
        assert.equal(redeemLoginCode(state, 'code1@example.com', code.toLowerCase()), 'redeemed');
        // Single-use applies to the code path too.
        assert.equal(redeemLoginCode(state, 'code1@example.com', code), 'invalid');
    });

    it('wrong codes count attempts and the token dies at the cap', () => {
        const { code } = createLoginToken(state, 'code2@example.com');
        for (let i = 0; i < maxCodeAttempts - 1; i++) {
            assert.equal(redeemLoginCode(state, 'code2@example.com', 'ZZZZZZZZ'), 'wrong');
        }
        // The cap kills the token — even the right code is now dead.
        assert.equal(redeemLoginCode(state, 'code2@example.com', 'ZZZZZZZZ'), 'wrong');
        assert.equal(redeemLoginCode(state, 'code2@example.com', code), 'invalid');
    });

    it('codes with no live token report invalid', () => {
        assert.equal(redeemLoginCode(state, 'nobody@example.com', 'ABCDEFGH'), 'invalid');
    });

    it('a code for a different email does not redeem', () => {
        const { code } = createLoginToken(state, 'code3@example.com');
        assert.equal(redeemLoginCode(state, 'other@example.com', code), 'invalid');
        // and the real owner's token is untouched.
        assert.equal(redeemLoginCode(state, 'code3@example.com', code), 'redeemed');
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
