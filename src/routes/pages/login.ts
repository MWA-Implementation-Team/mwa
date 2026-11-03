import { translate } from '#src/client/language.js';
import { redirectIfAuthed } from '#src/auth.js';
import { findUserByEmail } from '#src/db/users/index.js';
import {
    confirmLoginTokenSent,
    reserveLoginToken,
    deleteExpiredSessions,
    discardLoginToken,
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
        const origin = ctx.var.origin;
        const url = new URL(raw, origin);
        if (url.origin !== origin || url.pathname.startsWith('//')) {
            return null;
        }
        return url.pathname + url.search;
    } catch {
        return null;
    }
}

export function registerLoginRoutes(app: MwaHono) {
    app.get('/login', async (ctx) => {
        const redirect = redirectIfAuthed(ctx);
        if (redirect) {
            return redirect;
        }

        return writePage(ctx, 'login', {});
    });

    app.post('/login', async (ctx) => {
        const lang = getRequestLanguage(ctx);

        const form = await ctx.req.formData().catch(() => null);
        if (!form) {
            return ctx.text(translate(lang)('badRequest'), 400);
        }

        const email = String(form.get('email') ?? '')
            .trim()
            .toLowerCase();

        if (!emailPattern.test(email)) {
            return writePage(ctx, 'login', { errorKey: 'loginInvalidEmail' });
        }

        const isSignup = !findUserByEmail(ctx.var, email);
        const reservation = reserveLoginToken(ctx.var, email);
        if (reservation.type === 'cooldown') {
            ctx.status(429);
            ctx.header('Retry-After', String(reservation.retryAfter));
            return writePage(ctx, 'login', { errorKey: 'loginRateLimited' });
        }

        const created = reservation.login;
        const url = new URL('/auth/verify', ctx.var.origin);
        url.searchParams.set('token', created.token);

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
            discardLoginToken(ctx.var, created.id);
            console.error('Failed to send login email', error);
            return writePage(ctx, 'login', {
                errorKey: 'loginSendFailed',
            });
        }
        confirmLoginTokenSent(ctx.var, email, created.id);
        deleteExpiredSessions(ctx.var);

        return writePage(ctx, 'login', {
            sentTo: email,
            challengeId: created.challengeId,
            sentKind: isSignup ? 'signup' : 'login',
            goto: ctx.req.query('goto'),
        });
    });
}
