import { getRequestLanguage } from '#src/utils.js';
import { translate } from '#src/client/language.js';
import { cookieSession } from '#src/client/constants.js';
import {
    createSession,
    redeemLoginCode,
    redeemLoginToken,
    sessionTtlDays,
} from '#src/db/sessions/index.js';
import {
    createUser,
    deriveUsername,
    findUserByEmail,
    markEmailVerified,
} from '#src/db/users/index.js';
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
    // against the token — too many kills it (see db/sessions/index.ts).
    app.post('/auth/verify', async (ctx) => {
        const form = await ctx.req.formData().catch(() => null);
        if (!form) {
            return ctx.text(translate(getRequestLanguage(ctx))('badRequest'), 400);
        }
        const challengeId = String(form.get('challenge_id') ?? '');
        const code = String(form.get('code') ?? '').trim();
        const goto = String(form.get('goto') ?? '') || undefined;

        const result = redeemLoginCode(ctx.var, challengeId, code);
        if (result.type === 'invalid') {
            return writePage(ctx, 'login', { errorKey: 'loginCodeExpired' });
        }
        if (result.type === 'wrong') {
            return writePage(ctx, 'login', {
                errorKey: 'loginWrongCode',
                sentTo: result.email,
                challengeId,
                sentKind: findUserByEmail(ctx.var, result.email) ? 'login' : 'signup',
                goto,
            });
        }
        return logIn(ctx, result.email, goto);
    });
}

async function logIn(ctx: MwaContext, email: string, goto?: string): Promise<Response> {
    let user = findUserByEmail(ctx.var, email);
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

    // A valid goto always wins; everyone else lands on /app, where the you
    // tab holds the derived username.
    return ctx.redirect(safeGoto(ctx, goto) ?? '/app');
}
