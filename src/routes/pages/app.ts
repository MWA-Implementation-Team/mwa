import { requireUser } from '#src/auth.js';
import { listUserTransactions } from '#src/db/transactions.js';
import { findUserGroup, listUserGroups } from '#src/db/groups.js';
import { getQueuePosition, getUserWaitingEntry } from '#src/db/queue.js';
import { serialize } from '#src/client/serialize.js';
import { isActivitySlug } from '#src/client/activities.js';
import { cookieSession } from '#src/client/constants.js';
import { findUserByInteractToken, getOrCreateInteractToken } from '#src/db/interactions.js';
import { deleteSession } from '#src/db/sessions.js';
import { writeErrorPage, writePage } from '#src/pages.js';
import { MwaHono } from '#src/state.js';
import { deleteCookie, getCookie } from 'hono/cookie';
import { renderSVG } from 'uqr';

export function registerAppRoutes(app: MwaHono) {
    app.get('/app', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        // Personal QR — a stable link others scan to reach the interact page.
        const token = getOrCreateInteractToken(ctx.var, user.id);
        const interactUrl = new URL(`/app/interact/${token}`, ctx.req.url).toString();

        const group = findUserGroup(ctx.var, user.id);
        const queueEntry = getUserWaitingEntry(ctx.var, user.id);

        return writePage(ctx, 'home', {
            qrSvg: renderSVG(interactUrl),
            interactUrl,
            transactions: listUserTransactions(ctx.var, user.id),
            groupName: group?.name ?? null,
            queuePosition: queueEntry ? getQueuePosition(ctx.var, queueEntry.id) : null,
        });
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

    app.get('/app/interact/:token', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const target = findUserByInteractToken(ctx.var, ctx.req.param('token'));
        if (!target) return writeErrorPage(ctx, 404);

        const self = target.id === user.id;
        // Profile detail is serialized into #ssr-data — populate it only for
        // roles whose view includes it, never for regular users.
        const detail =
            !self && (user.role === 'host' || user.role === 'admin')
                ? {
                      email: target.email,
                      currentBalance: target.currentBalance,
                      joinedAt: target.createdAt.toISOString(),
                  }
                : null;

        return writePage(ctx, 'interact', {
            self,
            target: { username: target.username },
            detail,
        });
    });
}
