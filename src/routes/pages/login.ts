import { redirectIfAuthed } from '#src/auth.js';
import { findUserByEmail } from '#src/db/users.js';
import { createLoginToken, deleteExpiredSessions, lastLoginTokenSentAt } from '#src/db/sessions.js';
import { sendLoginEmail } from '#src/mailer.js';
import { writePage } from '#src/pages.js';
import { Context, Hono } from 'hono';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
export function safeGoto(ctx: Context, raw: string | undefined): string | null {
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

const resendCooldownMs = 60_000;

export function registerLoginRoutes(app: Hono) {
    app.get('/login', async (ctx) => {
        const redirect = redirectIfAuthed(ctx);
        if (redirect) {
            return redirect;
        }

        return writePage(ctx, 'login', {});
    });

    app.post('/login', async (ctx) => {
        const form = await ctx.req.formData().catch(() => null);
        if (!form) {
            return ctx.text('Bad Request', 400);
        }
        const email = String(form.get('email') ?? '')
            .trim()
            .toLowerCase();

        if (!emailPattern.test(email)) {
            return writePage(ctx, 'login', { errorMessage: 'Enter a valid email' });
        }

        const isSignup = !findUserByEmail(email);
        const lastSent = lastLoginTokenSentAt(email);
        if (!lastSent || Date.now() - lastSent.getTime() > resendCooldownMs) {
            const { token, code } = createLoginToken(email);
            const url = new URL('/auth/verify', ctx.req.url);
            url.searchParams.set('token', token);
            // goto passes through unvalidated — safeGoto re-checks it on
            // the verify request, so nothing here can smuggle a bad redirect.
            const goto = ctx.req.query('goto');
            if (goto) {
                url.searchParams.set('goto', goto);
            }
            try {
                await sendLoginEmail(email, url.toString(), code);
            } catch (error) {
                // SMTP down/unreachable — tell the user instead of a 500.
                console.error('Failed to send login email', error);
                return writePage(ctx, 'login', {
                    errorMessage: 'Could not send the email — try again in a moment',
                });
            }
        }
        deleteExpiredSessions();

        return writePage(ctx, 'login', {
            sentTo: email,
            sentKind: isSignup ? 'signup' : 'login',
        });
    });
}
