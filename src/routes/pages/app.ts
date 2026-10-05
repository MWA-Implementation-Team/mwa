import { currentUser } from '#src/auth.js';
import { cookieUsername } from '#src/client/constants.js';
import { writePage } from '#src/pages.js';
import { Hono } from 'hono';
import { deleteCookie } from 'hono/cookie';
import { Context } from 'hono';

export function registerAppRoutes(app: Hono) {
    app.get('/app', async (ctx) => {
        if (!currentUser(ctx)) return goLogin(ctx);

        return writePage(ctx, 'home', {});
    });

    app.post('/app', async (ctx) => {
        deleteCookie(ctx, cookieUsername);
        return ctx.redirect('/login', 303);
    });

    app.get('/app/activities', async (ctx) => {
        if (!currentUser(ctx)) return goLogin(ctx);

        return writePage(ctx, 'activities', {});
    });

    app.get('/app/activities/:id', async (ctx) => {
        if (!currentUser(ctx)) return goLogin(ctx);

        return writePage(ctx, 'activity', { id: ctx.req.param('id') });
    });

    app.get('/app/account', async (ctx) => {
        if (!currentUser(ctx)) return goLogin(ctx);

        return writePage(ctx, 'account', {});
    });

    app.get('/app/leaderboard', async (ctx) => {
        if (!currentUser(ctx)) return goLogin(ctx);

        const type = ctx.req.query('type') === 'group' ? 'group' : 'team';
        return writePage(ctx, 'leaderboard', { type });
    });

    app.get('/app/group', async (ctx) => {
        if (!currentUser(ctx)) return goLogin(ctx);

        return writePage(ctx, 'group', {});
    });

    app.get('/app/casino', async (ctx) => {
        if (!currentUser(ctx)) return goLogin(ctx);

        return writePage(ctx, 'casino', {});
    });
}

export function goLogin(ctx: Context): Response {
    return ctx.redirect(`/login?goto=${encodeURIComponent(ctx.req.path)}`, 303);
}
