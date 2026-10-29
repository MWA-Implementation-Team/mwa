import { cookieSession } from '#src/client/constants.js';
import { findSessionUserId } from '#src/db/sessions/index.js';
import { findUserById, User, UserRole } from '#src/db/users/index.js';
import { writeErrorPage } from '#src/pages.js';
import { getCookie } from 'hono/cookie';
import { MwaContext } from './state.js';

// The single place "who is logged in" is decided: resolve the mwa-session
// cookie's token against the sessions table, then load the user.
export function currentUser(ctx: MwaContext): User | null {
    const token = getCookie(ctx, cookieSession);
    const userId = token ? findSessionUserId(ctx.var, token) : null;
    return userId ? findUserById(ctx.var, userId) : null;
}

// Page guards return the User on success or the Response to send back —
// handlers check `instanceof Response` and return it. Anonymous page
// visitors bounce to /login; wrong roles get the 403 error page.
export function requireUser(ctx: MwaContext): User | Response {
    const user = currentUser(ctx);
    return user ?? goLogin(ctx);
}

export function requireRole(ctx: MwaContext, ...roles: UserRole[]): User | Response {
    const user = currentUser(ctx);
    if (!user) {
        return goLogin(ctx);
    }
    return roles.includes(user.role) ? user : writeErrorPage(ctx, 403);
}

// API variants answer with JSON — fetch calls can't use a login redirect.
export function requireApiUser(ctx: MwaContext): User | Response {
    const user = currentUser(ctx);
    return user ?? ctx.json({ error: 'unauthorized' }, 401);
}

export function requireApiRole(ctx: MwaContext, ...roles: UserRole[]): User | Response {
    const user = currentUser(ctx);
    if (!user) {
        return ctx.json({ error: 'unauthorized' }, 401);
    }
    return roles.includes(user.role) ? user : ctx.json({ error: 'forbidden' }, 403);
}

// Guest-only pages (login, signup): already-logged-in visitors bounce to /app.
export function redirectIfAuthed(ctx: MwaContext): Response | null {
    return currentUser(ctx) ? ctx.redirect('/app') : null;
}

function goLogin(ctx: MwaContext): Response {
    return ctx.redirect(`/login?goto=${encodeURIComponent(ctx.req.path)}`, 303);
}
