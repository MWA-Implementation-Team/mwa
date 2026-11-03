import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createUser } from '../users/index.js';
import {
    findTokenByInteractCode,
    findUserByInteractToken,
    getOrCreateInteractCode,
    getOrCreateInteractToken,
    rotateInteractToken,
} from './index.js';
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

    it('mints a 5-letter unambiguous code for a user', () => {
        const user = createUser(state, 'code@example.com', 'code_user');
        assert.match(getOrCreateInteractCode(state, user.id), /^[A-HJ-KM-NP-Z]{5}$/);
    });

    it('code is stable and resolves to the same token', () => {
        const user = createUser(state, 'codec@example.com', 'codec_user');
        const code = getOrCreateInteractCode(state, user.id);
        assert.equal(getOrCreateInteractCode(state, user.id), code);
        assert.equal(
            findTokenByInteractCode(state, code),
            getOrCreateInteractToken(state, user.id),
        );
    });

    it('minting the token row later backfills the code too', () => {
        const user = createUser(state, 'codeb@example.com', 'codeb_user');
        const code = getOrCreateInteractCode(state, user.id);
        // rotating the QR token leaves the code — and its lookup — untouched
        const newToken = rotateInteractToken(state, user.id);
        assert.equal(findTokenByInteractCode(state, code), newToken);
    });

    it('findTokenByInteractCode returns null for unknown codes', () => {
        assert.equal(findTokenByInteractCode(state, 'ZZZZZ'), null);
        assert.equal(findTokenByInteractCode(state, ''), null);
    });
});
