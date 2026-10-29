import { requireRole, requireUser } from '#src/auth.js';
import { listUserTransactions } from '#src/db/transactions.js';
import { findUserGroup, listUserGroups } from '#src/db/groups.js';
import {
    callNextGroups,
    markEntryDone,
    joinQueue,
    leaveQueue,
    getQueuePosition,
    getUserWaitingEntry,
    listWaitingQueue,
    listStationGroups,
} from '#src/db/queue.js';
import { serialize } from '#src/client/serialize.js';
import { ActivitySlug, isActivitySlug, registeredActivities } from '#src/client/activities.js';
import { cookieSession } from '#src/client/constants.js';
import { findUserByInteractToken } from '#src/db/interactions.js';
import { deleteSession } from '#src/db/sessions.js';
import { writeErrorPage, writePage } from '#src/pages.js';
import { MwaHono } from '#src/state.js';
import { deleteCookie, getCookie } from 'hono/cookie';
import { Language } from '#src/client/language.js';

export function registerAppRoutes(app: MwaHono) {
    app.get('/app', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const group = findUserGroup(ctx.var, user.id);
        const queueEntry = getUserWaitingEntry(ctx.var, user.id);

        let queueError: keyof Language | undefined = ctx.req.query('queueError') as keyof Language;
        if (queueError !== 'queueJoinFailed' && queueError !== 'queueLeaveFailed') {
            queueError = undefined;
        }

        return writePage(ctx, 'home', {
            transactions: listUserTransactions(ctx.var, user.id),
            groupName: group?.name ?? null,
            queueError,
            queuePosition: queueEntry ? getQueuePosition(ctx.var, queueEntry.id) : null,
        });
    });

    app.post('/app/queue/join', (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const group = findUserGroup(ctx.var, user.id);
        if (!group || !joinQueue(ctx.var, group.id).success) {
            return ctx.redirect('/app?queueError=queueJoinFailed', 303);
        }

        return ctx.redirect('/app', 303);
    });

    app.post('/app/queue/leave', (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const group = findUserGroup(ctx.var, user.id);
        if (!group || !leaveQueue(ctx.var, group.id)) {
            return ctx.redirect('/app?queueError=queueLeaveFailed', 303);
        }

        return ctx.redirect('/app', 303);
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

    // One host page serves every station — the host picks which activity
    // they're staffing from a dropdown, so there's no host↔station binding.
    app.get('/app/host', async (ctx) => {
        const user = requireRole(ctx, 'host', 'admin');
        if (user instanceof Response) return user;

        const activities = (Object.keys(registeredActivities) as ActivitySlug[]).map((slug) => ({
            slug,
            name: registeredActivities[slug].name,
        }));

        // called-and-not-done rows across all stations; the page filters
        // client-side by the selected activity
        const atStation = activities.flatMap(({ slug }) => listStationGroups(ctx.var, slug));

        const requestedStation = ctx.req.query('station');
        const station =
            requestedStation && isActivitySlug(requestedStation)
                ? requestedStation
                : (activities[0]?.slug ?? '');

        let error: keyof Language | undefined = ctx.req.query('error') as keyof Language;
        if (error !== 'hostRequestFailed' && error !== 'hostDoneFailed') {
            error = undefined;
        }

        return writePage(ctx, 'host', {
            station,
            error,
            activities,
            waiting: listWaitingQueue(ctx.var),
            atStation,
        });
    });

    app.post('/app/host/call', async (ctx) => {
        const user = requireRole(ctx, 'host', 'admin');
        if (user instanceof Response) return user;

        const form = await ctx.req.formData().catch(() => null);
        const station = form?.get('activity_slug');
        if (typeof station !== 'string' || !isActivitySlug(station)) {
            return ctx.redirect('/app/host?error=hostRequestFailed', 303);
        }

        const target = `/app/host?station=${encodeURIComponent(station)}`;
        const count = Number(form?.get('count'));
        if (!Number.isInteger(count) || count < 1) {
            return ctx.redirect(`${target}&error=hostRequestFailed`, 303);
        }

        callNextGroups(ctx.var, Math.min(count, 20), station);
        return ctx.redirect(target, 303);
    });

    app.post('/app/host/done', async (ctx) => {
        const user = requireRole(ctx, 'host', 'admin');
        if (user instanceof Response) return user;

        const form = await ctx.req.formData().catch(() => null);
        const station = form?.get('activity_slug');
        if (typeof station !== 'string' || !isActivitySlug(station)) {
            return ctx.redirect('/app/host?error=hostDoneFailed', 303);
        }

        const target = `/app/host?station=${encodeURIComponent(station)}`;
        const entryId = Number(form?.get('entry_id'));
        if (!Number.isSafeInteger(entryId) || entryId < 1 || !markEntryDone(ctx.var, entryId)) {
            return ctx.redirect(`${target}&error=hostDoneFailed`, 303);
        }

        return ctx.redirect(target, 303);
    });

    app.get('/app/interact/:token', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const token = ctx.req.param('token');
        const target = findUserByInteractToken(ctx.var, token);
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
            token,
            self,
            target: { username: target.username },
            detail,
        });
    });
}
