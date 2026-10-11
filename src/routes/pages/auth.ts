import { cookieSession } from '#src/client/constants.js';
import {
    createSession,
    redeemLoginCode,
    redeemLoginToken,
    sessionTtlDays,
} from '#src/db/sessions.js';
import { createUser, deriveUsername, findUserByEmail, markEmailVerified } from '#src/db/users.js';
import { writePage } from '#src/pages.js';
import { safeGoto } from '#src/routes/pages/login.js';
import { isDevMode } from '#src/state.js';
import { Context, Hono } from 'hono';
import { setCookie } from 'hono/cookie';

export function registerAuthRoutes(app: Hono) {
    // The link inside login emails. Consuming a token is one-shot: it's marked
    // used in the same statement that returns the email, so replays get nothing.
    app.get('/auth/verify', async (ctx) => {
        const token = ctx.req.query('token');
        const email = token ? redeemLoginToken(token) : null;
        if (!email) {
            return writePage(ctx, 'login', {
                errorMessage: 'That login link is expired or already used — request a new one',
            });
        }
        return logIn(ctx, email, ctx.req.query('goto'));
    });

    // The paste-the-code fallback on the "we sent it" page. Wrong codes count
    // against the token — too many kills it (see db/sessions.ts).
    app.post('/auth/verify', async (ctx) => {
        const form = await ctx.req.formData().catch(() => null);
        if (!form) {
            return ctx.text('Bad Request', 400);
        }
        const email = String(form.get('email') ?? '')
            .trim()
            .toLowerCase();
        const code = String(form.get('code') ?? '').trim();
        const goto = String(form.get('goto') ?? '') || undefined;

        const result = redeemLoginCode(email, code);
        if (result !== 'redeemed') {
            return writePage(ctx, 'login', {
                errorMessage:
                    result === 'wrong'
                        ? 'Wrong code — check the email and try again'
                        : 'That code is expired or already used — request a new one',
                sentTo: email,
                sentKind: findUserByEmail(email) ? 'login' : 'signup',
                goto,
            });
        }
        return logIn(ctx, email, goto);
    });
}

async function logIn(ctx: Context, email: string, goto?: string): Promise<Response> {
    let user = findUserByEmail(email);
    const isNewAccount = !user;
    if (!user) {
        user = createUser(email, deriveUsername(email));
    }
    markEmailVerified(user.id);
    setCookie(ctx, cookieSession, createSession(user.id), {
        httpOnly: true,
        sameSite: 'Lax',
        secure: !isDevMode,
        maxAge: sessionTtlDays * 86_400,
        path: '/',
    });

    // New accounts default to the profile page so the derived username can be
    // fixed; a valid goto still wins either way.
    const fallback = isNewAccount ? '/app/account' : '/app';
    return ctx.redirect(safeGoto(ctx, goto) ?? fallback);
}
