import { translate } from '#src/client/language.js';
import { redirectIfAuthed } from '#src/auth.js';
import { findUserByEmail } from '#src/db/users/index.js';
import {
    confirmLoginTokenSent,
    createLoginToken,
    deleteExpiredSessions,
    discardLoginToken,
    lastLoginTokenSentAt,
    pruneLoginTokens,
} from '#src/db/sessions/index.js';
import { MwaContext, MwaHono } from '#src/state.js';
import { writePage } from '#src/pages.js';
import { getRequestLanguage } from '#src/utils.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Normalize goto before checking: a raw startsWith lets `..` escape the
// prefix (browsers resolve it), and absolute URLs on other origins must be
// rejected outright. Only the normalized path is used as the redirect target.
export function safeGoto(ctx: MwaContext, raw: string | undefined): string | null {
    if (!raw) {
        return null;
    }
    try {
        const origin = new URL(ctx.req.url).origin;
        const url = new URL(raw, origin);
        if (url.origin !== origin) {
            return null;
        }
        return url.pathname + url.search;
    } catch {
        return null;
    }
}

const resendCooldownMs = 60_000;

export function registerLoginRoutes(app: MwaHono) {
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
            return ctx.text(translate(getRequestLanguage(ctx))('badRequest'), 400);
        }

        const lang = getRequestLanguage(ctx);

        const email = String(form.get('email') ?? '')
            .trim()
            .toLowerCase();

        if (!emailPattern.test(email)) {
            return writePage(ctx, 'login', { errorKey: 'loginInvalidEmail' });
        }

        const isSignup = !findUserByEmail(ctx.var, email);
        const lastSent = lastLoginTokenSentAt(ctx.var, email);
        if (!lastSent || Date.now() - lastSent.getTime() > resendCooldownMs) {
            const created = createLoginToken(ctx.var, email);
            const url = new URL('/auth/verify', ctx.req.url);
            url.searchParams.set('token', created.token);
            // goto passes through unvalidated — safeGoto re-checks it on
            // the verify request, so nothing here can smuggle a bad redirect.
            const goto = ctx.req.query('goto');
            if (goto) {
                url.searchParams.set('goto', goto);
            }
            try {
                await ctx.var.mailer.sendLoginEmail(email, {
                    lang,
                    url: url.toString(),
                    code: created.code,
                });
            } catch (error) {
                // SMTP down/unreachable — drop the token so a retry actually
                // re-sends instead of hitting the resend cap on an email that
                // never existed, and the previous link stays alive.
                discardLoginToken(ctx.var, created.id);
                console.error('Failed to send login email', error);
                return writePage(ctx, 'login', {
                    errorKey: 'loginSendFailed',
                });
            }
            confirmLoginTokenSent(ctx.var, email, created.id);
        }
        deleteExpiredSessions(ctx.var);
        pruneLoginTokens(ctx.var);

        return writePage(ctx, 'login', {
            sentTo: email,
            sentKind: isSignup ? 'signup' : 'login',
            goto: ctx.req.query('goto'),
        });
    });
}
