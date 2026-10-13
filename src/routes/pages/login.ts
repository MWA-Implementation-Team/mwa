import { currentUser } from '#src/auth.js';
import { cookieUsername } from '#src/client/constants.js';
import { findUserByUsername } from '#src/db/users.js';
import { writePage } from '#src/pages.js';
import { Context, Hono } from 'hono';
import { setCookie } from 'hono/cookie';

// Login redirects are limited to known app pages so ?goto= can't be used
// as an open redirect. Exact paths cover static routes; prefixes cover
// routes with dynamic segments (e.g. /app/activities/:id).
const allowedGotos = new Set<string>([
    '/app',
    '/app/activities',
    '/app/account',
    '/app/leaderboard',
    '/app/group',
    '/app/casino',
    '/admin',
]);
const allowedGotoPrefixes = ['/app/activities/'];

// Normalize goto before checking: a raw startsWith lets `..` escape the
// prefix (browsers resolve it), and absolute URLs on other origins must be
// rejected outright. Only the normalized path is used as the redirect target.
function safeGoto(ctx: Context, raw: string | undefined): string | null {
    if (!raw) {
        return null;
    }
    try {
        const origin = new URL(ctx.req.url).origin;
        const url = new URL(raw, origin);
        if (url.origin !== origin) {
            return null;
        }
        const allowed =
            allowedGotos.has(url.pathname) ||
            allowedGotoPrefixes.some((p) => url.pathname.startsWith(p));
        return allowed ? url.pathname + url.search : null;
    } catch {
        return null;
    }
}

export function registerLoginRoutes(app: Hono) {
    app.get('/login', async (ctx) => {
        if (currentUser(ctx)) {
            return ctx.redirect('/app');
        }

        return writePage(ctx, 'login', {});
    });

    app.post('/login', async (ctx) => {
        const form = await ctx.req.formData();

        let username = form.get('username');
        if (typeof username !== 'string' || username.trim() === '') {
            return writePage(ctx, 'login', {
                errorMessage: 'Invalid username',
            });
        }

        if (!findUserByUsername(username)) {
            return writePage(ctx, 'login', {
                errorMessage: 'Unknown user',
            });
        }

        const goto = safeGoto(ctx, ctx.req.query('goto')) ?? '/app';

        setCookie(ctx, cookieUsername, username);
        return ctx.redirect(goto);
    });
}
