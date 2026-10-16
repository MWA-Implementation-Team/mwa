import { requireUser } from '#src/auth.js';
import { listUserGroups } from '#src/db/groups.js';
import { serialize } from '#src/client/serialize.js';
import { isActivitySlug } from '#src/client/activities.js';
import { cookieSession } from '#src/client/constants.js';
import { deleteSession } from '#src/db/sessions.js';
import { writeErrorPage, writePage } from '#src/pages.js';
import { MwaHono } from '#src/state.js';
import { deleteCookie, getCookie } from 'hono/cookie';

export function registerAppRoutes(app: MwaHono) {
    app.get('/app', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        return writePage(ctx, 'home', {});
    });

    app.post('/app', async (ctx) => {
        // Kill the session server-side, not just the cookie — a stolen token
        // stops working the moment it's logged out.
        const token = getCookie(ctx, cookieSession);
        if (token) {
            deleteSession(ctx.var, token);
        }
        deleteCookie(ctx, cookieSession);
        return ctx.redirect('/login', 303);
    });

    app.get('/app/activities', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        return writePage(ctx, 'activities', {});
    });

    app.get('/app/activities/:slug', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const slug = ctx.req.param('slug');
        if (!isActivitySlug(slug)) return writeErrorPage(ctx, 404);

        return writePage(ctx, 'activity', { slug });
    });

    app.get('/app/account', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        return writePage(ctx, 'account', {});
    });

    app.get('/app/leaderboard', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const type = ctx.req.query('type') === 'group' ? 'group' : 'team';
        return writePage(ctx, 'leaderboard', { type });
    });

    app.get('/app/group', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        return writePage(ctx, 'group', {
            initialGroups: listUserGroups(ctx.var, user.id).map(serialize),
        });
    });

    app.get('/app/casino', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        return writePage(ctx, 'casino', {});
    });
}
