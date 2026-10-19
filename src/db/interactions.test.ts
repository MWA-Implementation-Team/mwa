import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createUser } from './users.js';
import { findUserByInteractToken, getOrCreateInteractToken } from './interactions.js';
import { createTestMwaState } from '#src/state.js';

const state = createTestMwaState({});

describe('db/interactions', () => {
    it('mints a 256-bit base64url token for a user', () => {
        const user = createUser(state, 'tok@example.com', 'tok_user');
        const token = getOrCreateInteractToken(state, user.id);
        assert.match(token, /^[A-Za-z0-9_-]{43}$/);
    });

    it('is stable — the same user always gets the same token', () => {
        const user = createUser(state, 'stable@example.com', 'stable_user');
        assert.equal(
            getOrCreateInteractToken(state, user.id),
            getOrCreateInteractToken(state, user.id),
        );
    });

    it('mints different tokens for different users', () => {
        const a = createUser(state, 'toka@example.com', 'toka_user');
        const b = createUser(state, 'tokb@example.com', 'tokb_user');
        assert.notEqual(
            getOrCreateInteractToken(state, a.id),
            getOrCreateInteractToken(state, b.id),
        );
    });

    it('findUserByInteractToken resolves the owner', () => {
        const user = createUser(state, 'resolve@example.com', 'resolve_user');
        const token = getOrCreateInteractToken(state, user.id);
        assert.equal(findUserByInteractToken(state, token)?.id, user.id);
    });

    it('findUserByInteractToken returns null for unknown tokens', () => {
        assert.equal(findUserByInteractToken(state, 'nope'), null);
        assert.equal(findUserByInteractToken(state, ''), null);
    });
});
