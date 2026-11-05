import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    createUser,
    deriveUsername,
    findUserByEmail,
    findUserById,
    findUserByUsername,
    markEmailVerified,
    updateUsername,
} from './index.js';
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

    it('deriveUsername returns a stable pseudonym that hides the email', () => {
        const name = deriveUsername(state, 'fresh.face@example.com');
        assert.match(name, /^[a-z]+_[a-z]+_\d{2}$/);
        assert.ok(!name.includes('fresh'));
        // deterministic — the same email always maps to the same pseudonym
        assert.equal(deriveUsername(state, 'fresh.face@example.com'), name);
    });

    it('deriveUsername dedupes with a numeric suffix', () => {
        const base = deriveUsername(state, 'taken-name@example.com');
        createUser(state, 'dd1@example.com', base);
        assert.equal(deriveUsername(state, 'taken-name@example.com'), `${base.slice(0, 29)}2`);
    });

    it('updateUsername trims, preserves case, and renames', () => {
        const user = createUser(state, 'rename@example.com', 'rename_me');
        assert.equal(updateUsername(state, user.id, '  NewName  '), 'updated');
        assert.equal(findUserById(state, user.id)!.username, 'NewName');
    });

    it('updateUsername rejects bad input and taken names, keeps its own', () => {
        const a = createUser(state, 'una@example.com', 'rename_a');
        const b = createUser(state, 'unb@example.com', 'rename_b');
        assert.equal(updateUsername(state, a.id, 'x'.repeat(30)), 'updated');
        assert.equal(findUserById(state, a.id)!.username, 'x'.repeat(30));
        assert.equal(updateUsername(state, a.id, 'bad name!'), 'invalid');
        assert.equal(updateUsername(state, a.id, 'x'.repeat(31)), 'invalid');
        assert.equal(updateUsername(state, a.id, ''), 'invalid');
        assert.equal(updateUsername(state, a.id, 'ReName_B'), 'taken');
        assert.equal(updateUsername(state, a.id, 'rename_a'), 'updated');
        assert.equal(findUserById(state, b.id)!.username, 'rename_b');
    });
});
