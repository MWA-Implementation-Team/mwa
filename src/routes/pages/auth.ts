import { getRequestLanguage } from '#src/utils.js';
import { translate } from '#src/client/language.js';
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
import { MwaContext, MwaHono } from '#src/state.js';
import { setCookie } from 'hono/cookie';

export function registerAuthRoutes(app: MwaHono) {
    // The link inside login emails. Consuming a token is one-shot: it's marked
    // used in the same statement that returns the email, so replays get nothing.
    app.get('/auth/verify', async (ctx) => {
        const token = ctx.req.query('token');
        const email = token ? redeemLoginToken(ctx.var, token) : null;
        if (!email) {
            return writePage(ctx, 'login', {
                errorKey: 'loginLinkExpired',
            });
        }
        return logIn(ctx, email, ctx.req.query('goto'));
    });

    // The paste-the-code fallback on the "we sent it" page. Wrong codes count
    // against the token — too many kills it (see db/sessions.ts).
    app.post('/auth/verify', async (ctx) => {
        const form = await ctx.req.formData().catch(() => null);
        if (!form) {
            return ctx.text(translate(getRequestLanguage(ctx))('badRequest'), 400);
        }
        const email = String(form.get('email') ?? '')
            .trim()
            .toLowerCase();
        const code = String(form.get('code') ?? '').trim();
        const goto = String(form.get('goto') ?? '') || undefined;

        const result = redeemLoginCode(ctx.var, email, code);
        if (result !== 'redeemed') {
            return writePage(ctx, 'login', {
                errorKey: result === 'wrong' ? 'loginWrongCode' : 'loginCodeExpired',
                sentTo: email,
                sentKind: findUserByEmail(ctx.var, email) ? 'login' : 'signup',
                goto,
            });
        }
        return logIn(ctx, email, goto);
    });
}

async function logIn(ctx: MwaContext, email: string, goto?: string): Promise<Response> {
    let user = findUserByEmail(ctx.var, email);
    const isNewAccount = !user;
    if (!user) {
        user = createUser(ctx.var, email, deriveUsername(ctx.var, email));
    }
    markEmailVerified(ctx.var, user.id);
    setCookie(ctx, cookieSession, createSession(ctx.var, user.id), {
        httpOnly: true,
        sameSite: 'Lax',
        secure: !ctx.var.isDevMode,
        maxAge: sessionTtlDays * 86_400,
        path: '/',
    });

    // New accounts default to the profile page so the derived username can be
    // fixed; a valid goto still wins either way.
    const fallback = isNewAccount ? '/app/account' : '/app';
    return ctx.redirect(safeGoto(ctx, goto) ?? fallback);
}
