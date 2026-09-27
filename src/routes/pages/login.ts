import { cookieUsername } from '#src/client/constants.js';
import { writePage } from '#src/pages.js';
import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';

export function registerLoginRoutes(app: Hono) {
    app.get('/login', async (ctx) => {
        if (getCookie(ctx, cookieUsername)) {
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

        const allowedGotos = new Set<string>(['/app', '/app/casino']);

        let goto = ctx.req.query('goto') ?? null;
        if (goto && !allowedGotos.has(goto)) {
            goto = null;
        }
        goto = goto ?? '/app';

        setCookie(ctx, cookieUsername, username);
        return ctx.redirect(goto);
    });
}
