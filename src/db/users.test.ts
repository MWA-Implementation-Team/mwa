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

describe('db/users', () => {
    it('createUser returns a user with role=user and unverified email', () => {
        const user = createUser('create@example.com', 'create_user');
        assert.equal(user.role, 'user');
        assert.equal(user.email, 'create@example.com');
        assert.equal(user.username, 'create_user');
        assert.equal(user.emailVerifiedAt, null);
    });

    it('findUserByEmail is case-insensitive', () => {
        createUser('case@example.com', 'case_user');
        assert.equal(findUserByEmail('CASE@EXAMPLE.COM')?.username, 'case_user');
    });

    it('findUserByEmail returns null for an unknown email', () => {
        assert.equal(findUserByEmail('nobody@example.com'), null);
    });

    it('findUserById round-trips a created user', () => {
        const user = createUser('byid@example.com', 'byid_user');
        assert.equal(findUserById(user.id)?.email, 'byid@example.com');
    });

    it('duplicate usernames are rejected', () => {
        createUser('dup1@example.com', 'dup_user');
        assert.throws(() => createUser('dup2@example.com', 'DUP_USER'));
    });

    it('duplicate emails are rejected', () => {
        createUser('dup@example.com', 'dup_email_a');
        assert.throws(() => createUser('DUP@example.com', 'dup_email_b'));
    });

    it('markEmailVerified records the timestamp', () => {
        const user = createUser('verify@example.com', 'verify_user');
        assert.equal(user.emailVerifiedAt, null);
        markEmailVerified(user.id);
        const verified = findUserById(user.id)!;
        assert.ok(verified.emailVerifiedAt instanceof Date);
    });

    it('findUserByUsername still resolves users', () => {
        createUser('legacy@example.com', 'legacy_user');
        assert.equal(findUserByUsername('legacy_user')?.email, 'legacy@example.com');
    });

    it('deriveUsername sanitizes the local part to ascii', () => {
        assert.equal(deriveUsername('fresh.face@example.com'), 'fresh_face');
        assert.equal(deriveUsername('ąčę@example.com'), 'user');
        assert.equal(deriveUsername('a'.repeat(30) + '@example.com'), 'a'.repeat(16));
    });

    it('deriveUsername dedupes with a numeric suffix', () => {
        createUser('dd1@example.com', 'same');
        createUser('dd2@example.com', 'same2');
        assert.equal(deriveUsername('same@x.com'), 'same3');
    });
});
