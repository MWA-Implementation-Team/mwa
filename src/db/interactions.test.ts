import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createUser } from './users.js';
import { findUserByInteractToken, getOrCreateInteractToken } from './interactions.js';

describe('db/interactions', () => {
    it('mints a 256-bit base64url token for a user', () => {
        const user = createUser('tok@example.com', 'tok_user');
        const token = getOrCreateInteractToken(user.id);
        assert.match(token, /^[A-Za-z0-9_-]{43}$/);
    });

    it('is stable — the same user always gets the same token', () => {
        const user = createUser('stable@example.com', 'stable_user');
        assert.equal(getOrCreateInteractToken(user.id), getOrCreateInteractToken(user.id));
    });

    it('mints different tokens for different users', () => {
        const a = createUser('toka@example.com', 'toka_user');
        const b = createUser('tokb@example.com', 'tokb_user');
        assert.notEqual(getOrCreateInteractToken(a.id), getOrCreateInteractToken(b.id));
    });

    it('findUserByInteractToken resolves the owner', () => {
        const user = createUser('resolve@example.com', 'resolve_user');
        const token = getOrCreateInteractToken(user.id);
        assert.equal(findUserByInteractToken(token)?.id, user.id);
    });

    it('findUserByInteractToken returns null for unknown tokens', () => {
        assert.equal(findUserByInteractToken('nope'), null);
        assert.equal(findUserByInteractToken(''), null);
    });
});
