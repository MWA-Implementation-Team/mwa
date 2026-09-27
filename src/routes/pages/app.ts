import { currentUser } from '#src/auth.js';
import { cookieUsername } from '#src/client/constants.js';
import { writePage } from '#src/pages.js';
import { Hono } from 'hono';
import { deleteCookie } from 'hono/cookie';
import { Context } from 'hono';

export function registerAppRoutes(app: Hono) {
    app.get('/app', async (ctx) => {
        if (!currentUser(ctx)) return goLogin(ctx);

        return writePage(ctx, 'appHome', {});
    });

    app.post('/app', async (ctx) => {
        deleteCookie(ctx, cookieUsername);
        return ctx.redirect('/login', 303);
    });

    app.get('/app/casino', async (ctx) => {
        if (!currentUser(ctx)) return goLogin(ctx);

        return writePage(ctx, 'casino', {});
    });
}

function goLogin(ctx: Context): Response {
    return ctx.redirect(`/login?goto=${encodeURIComponent(ctx.req.path)}`, 303);
}
