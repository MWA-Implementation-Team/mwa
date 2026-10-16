import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    createUser,
    deriveUsername,
    findUserByEmail,
    findUserById,
    findUserByUsername,
    markEmailVerified,
} from './users.js';
import { createTestMwaState } from '#src/state.js';

const state = createTestMwaState({});

describe('db/users', () => {
    it('createUser returns a user with role=user and unverified email', () => {
        const user = createUser(state, 'create@example.com', 'create_user');
        assert.equal(user.role, 'user');
        assert.equal(user.email, 'create@example.com');
        assert.equal(user.username, 'create_user');
        assert.equal(user.emailVerifiedAt, null);
    });

    it('findUserByEmail is case-insensitive', () => {
        createUser(state, 'case@example.com', 'case_user');
        assert.equal(findUserByEmail(state, 'CASE@EXAMPLE.COM')?.username, 'case_user');
    });

    it('findUserByEmail returns null for an unknown email', () => {
        assert.equal(findUserByEmail(state, 'nobody@example.com'), null);
    });

    it('findUserById round-trips a created user', () => {
        const user = createUser(state, 'byid@example.com', 'byid_user');
        assert.equal(findUserById(state, user.id)?.email, 'byid@example.com');
    });

    it('duplicate usernames are rejected', () => {
        createUser(state, 'dup1@example.com', 'dup_user');
        assert.throws(() => createUser(state, 'dup2@example.com', 'DUP_USER'));
    });

    it('duplicate emails are rejected', () => {
        createUser(state, 'dup@example.com', 'dup_email_a');
        assert.throws(() => createUser(state, 'DUP@example.com', 'dup_email_b'));
    });

    it('markEmailVerified records the timestamp', () => {
        const user = createUser(state, 'verify@example.com', 'verify_user');
        assert.equal(user.emailVerifiedAt, null);
        markEmailVerified(state, user.id);
        const verified = findUserById(state, user.id)!;
        assert.ok(verified.emailVerifiedAt instanceof Date);
    });

    it('findUserByUsername still resolves users', () => {
        createUser(state, 'legacy@example.com', 'legacy_user');
        assert.equal(findUserByUsername(state, 'legacy_user')?.email, 'legacy@example.com');
    });

    it('deriveUsername sanitizes the local part to ascii', () => {
        assert.equal(deriveUsername(state, 'fresh.face@example.com'), 'fresh_face');
        assert.equal(deriveUsername(state, 'ąčę@example.com'), 'user');
        assert.equal(deriveUsername(state, 'a'.repeat(30) + '@example.com'), 'a'.repeat(16));
    });

    it('deriveUsername dedupes with a numeric suffix', () => {
        createUser(state, 'dd1@example.com', 'same');
        createUser(state, 'dd2@example.com', 'same2');
        assert.equal(deriveUsername(state, 'same@x.com'), 'same3');
    });
});
