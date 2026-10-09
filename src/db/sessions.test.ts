import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';
import { database } from '#src/state.js';
import { createUser } from './users.js';
import {
    createLoginToken,
    createSession,
    deleteSession,
    findSessionUserId,
    lastLoginTokenSentAt,
    maxCodeAttempts,
    redeemLoginCode,
    redeemLoginToken,
} from './sessions.js';

function expireToken(table: 'login_tokens' | 'sessions', token: string) {
    // Move the row's expiry into the past by hashing the raw token ourselves.
    const hash = createHash('sha256').update(token).digest('hex');
    database
        .prepare(`UPDATE ${table} SET expires_at = '2000-01-01T00:00:00.000Z' WHERE token_hash = ?`)
        .run(hash);
}

describe('db/sessions — login tokens', () => {
    it('a fresh token redeems to its email, exactly once', () => {
        const { token } = createLoginToken('tok1@example.com');
        assert.equal(redeemLoginToken(token), 'tok1@example.com');
        assert.equal(redeemLoginToken(token), null);
    });

    it('an unknown or forged token redeems to null', () => {
        assert.equal(redeemLoginToken('forged-token'), null);
    });

    it('an expired token redeems to null', () => {
        const { token } = createLoginToken('tok2@example.com');
        expireToken('login_tokens', token);
        assert.equal(redeemLoginToken(token), null);
    });

    it('requesting a new token invalidates the previous one', () => {
        const first = createLoginToken('tok3@example.com');
        const second = createLoginToken('tok3@example.com');
        assert.equal(redeemLoginToken(first.token), null);
        assert.equal(redeemLoginToken(second.token), 'tok3@example.com');
    });

    it('lastLoginTokenSentAt reports the most recent send for the resend cap', () => {
        assert.equal(lastLoginTokenSentAt('nosend@example.com'), null);
        createLoginToken('tok4@example.com');
        const sentAt = lastLoginTokenSentAt('tok4@example.com');
        assert.ok(sentAt instanceof Date);
        assert.ok(Date.now() - sentAt!.getTime() < 5000);
    });
});

describe('db/sessions — login codes', () => {
    it('a correct code redeems the token, case-insensitively', () => {
        const { code } = createLoginToken('code1@example.com');
        assert.equal(redeemLoginCode('code1@example.com', code.toLowerCase()), 'redeemed');
        // Single-use applies to the code path too.
        assert.equal(redeemLoginCode('code1@example.com', code), 'invalid');
    });

    it('wrong codes count attempts and the token dies at the cap', () => {
        const { code } = createLoginToken('code2@example.com');
        for (let i = 0; i < maxCodeAttempts - 1; i++) {
            assert.equal(redeemLoginCode('code2@example.com', 'ZZZZZZZZ'), 'wrong');
        }
        // The cap kills the token — even the right code is now dead.
        assert.equal(redeemLoginCode('code2@example.com', 'ZZZZZZZZ'), 'wrong');
        assert.equal(redeemLoginCode('code2@example.com', code), 'invalid');
    });

    it('codes with no live token report invalid', () => {
        assert.equal(redeemLoginCode('nobody@example.com', 'ABCDEFGH'), 'invalid');
    });

    it('a code for a different email does not redeem', () => {
        const { code } = createLoginToken('code3@example.com');
        assert.equal(redeemLoginCode('other@example.com', code), 'invalid');
        // and the real owner's token is untouched.
        assert.equal(redeemLoginCode('code3@example.com', code), 'redeemed');
    });
});

describe('db/sessions — sessions', () => {
    it('a session resolves to its user until deleted', () => {
        const user = createUser('sess1@example.com', 'sess1');
        const token = createSession(user.id);
        assert.equal(findSessionUserId(token), user.id);
        deleteSession(token);
        assert.equal(findSessionUserId(token), null);
    });

    it('an unknown or expired session resolves to null', () => {
        assert.equal(findSessionUserId('forged'), null);
        const user = createUser('sess2@example.com', 'sess2');
        const token = createSession(user.id);
        expireToken('sessions', token);
        assert.equal(findSessionUserId(token), null);
    });
});
