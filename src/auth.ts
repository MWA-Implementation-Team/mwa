import { cookieUsername } from '#src/client/constants.js';
import { findUserByUsername, User } from '#src/db/users.js';
import { Context } from 'hono';
import { getCookie } from 'hono/cookie';

// The single place "who is logged in" is decided. Today: resolve the
// cookie's username against the users table. Real auth swaps the lookup
// for session-token verification — the return type (User | null) and
// all call sites stay identical.
export function currentUser(ctx: Context): User | null {
    const username = getCookie(ctx, cookieUsername);
    return username ? findUserByUsername(username) : null;
}
