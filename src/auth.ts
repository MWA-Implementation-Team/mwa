import { cookieUsername } from '#src/client/constants.js';
import { findUserByUsername, User } from '#src/db/users.js';
import { fakeUsername, isDevMode } from '#src/state.js';
import { Context } from 'hono';
import { getCookie } from 'hono/cookie';

// The single place "who is logged in" is decided. Today: resolve the
// cookie's username against the users table. Real auth swaps the lookup
// for session-token verification — the return type (User | null) and
// all call sites stay identical.
// In dev mode a missing cookie falls back to fakeUsername; point it at
// a seeded user to simulate logged-in, anything else = logged-out.
export function currentUser(ctx: Context): User | null {
    const username = getCookie(ctx, cookieUsername) ?? (isDevMode ? fakeUsername : undefined);
    return username ? findUserByUsername(username) : null;
}
