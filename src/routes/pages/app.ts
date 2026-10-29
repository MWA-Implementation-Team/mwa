import { requireRole, requireUser } from '#src/auth.js';
import { listUserTransactions } from '#src/db/transactions/index.js';
import {
    LeaderboardBoard,
    listGroupLeaderboard,
    listPlayerLeaderboard,
    listViewerStandings,
} from '#src/db/leaderboard/index.js';
import {
    deleteGroup,
    findUserGroup,
    listGroupMemberInfos,
    listGroupMembers,
    listUserGroups,
    removeGroupMember,
} from '#src/db/groups/index.js';
import {
    callNextGroups,
    markEntryDone,
    joinQueue,
    leaveQueue,
    getQueuePosition,
    getUserWaitingEntry,
    listWaitingQueue,
    listStationGroups,
} from '#src/db/queue/index.js';
import { serialize } from '#src/client/serialize.js';
import { ActivitySlug, isActivitySlug, registeredActivities } from '#src/client/activities.js';
import { cookieSession } from '#src/client/constants.js';
import { findUserByInteractToken } from '#src/db/interactions/index.js';
import { deleteSession } from '#src/db/sessions/index.js';
import { writeErrorPage, writePage } from '#src/pages.js';
import { MwaHono } from '#src/state.js';
import { deleteCookie, getCookie } from 'hono/cookie';
import { Language } from '#src/client/language.js';

// Emoji stand-ins until real per-group art ships. The pick is stable per
// group — a mascot, not a slot machine — keyed off the group's id.
const GROUP_ART_PLACEHOLDERS = ['🦊', '🐸', '🐼', '🐨', '🐯', '🦁', '🐙', '🦄'];
const NO_GROUP_ART = '😔';

export function registerAppRoutes(app: MwaHono) {
    app.get('/app', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const group = findUserGroup(ctx.var, user.id);
        const queueEntry = getUserWaitingEntry(ctx.var, user.id);

        const memberCount = group ? listGroupMembers(ctx.var, group.id).length : 0;
        const groupEmoji =
            group && memberCount >= 1 && memberCount <= 6
                ? GROUP_ART_PLACEHOLDERS[group.id % GROUP_ART_PLACEHOLDERS.length]
                : NO_GROUP_ART;

        let queueError: keyof Language | undefined = ctx.req.query('queueError') as keyof Language;
        if (queueError !== 'queueJoinFailed' && queueError !== 'queueLeaveFailed') {
            queueError = undefined;
        }

        let groupError: keyof Language | undefined = ctx.req.query('groupError') as keyof Language;
        if (
            groupError !== 'groupKickFailed' &&
            groupError !== 'groupLeaveFailed' &&
            groupError !== 'groupDeleteFailed'
        ) {
            groupError = undefined;
        }

        // owner first, then join order — the member table reads top-down
        const groupMembers = group ? listGroupMemberInfos(ctx.var, group.id) : [];
        if (group) {
            groupMembers.sort(
                (a, b) => Number(b.userId === group.ownerId) - Number(a.userId === group.ownerId),
            );
        }

        return writePage(ctx, 'home', {
            transactions: listUserTransactions(ctx.var, user.id),
            groupName: group?.name ?? null,
            groupEmoji,
            groupMemberCount: group ? memberCount : null,
            groupOwnerId: group?.ownerId ?? null,
            groupMembers,
            groupError,
            queueError,
            queuePosition: queueEntry ? getQueuePosition(ctx.var, queueEntry.id) : null,
            standings: listViewerStandings(ctx.var, user.id, group?.id ?? null),
        });
    });

    // Members can only remove themselves; the owner can't leave — deleting
    // the group (on /app/group) is the only way out for them.
    app.post('/app/group/leave', (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const group = findUserGroup(ctx.var, user.id);
        if (!group || removeGroupMember(ctx.var, group.id, user.id) !== 'removed') {
            return ctx.redirect('/app?groupError=groupLeaveFailed', 303);
        }
        return ctx.redirect('/app', 303);
    });

    // Deleting is the owner's only way out — owner check is inside
    // deleteGroup, members/queue rows cascade away with the group.
    app.post('/app/group/delete', (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const group = findUserGroup(ctx.var, user.id);
        if (!group || !deleteGroup(ctx.var, group.id, user.id)) {
            return ctx.redirect('/app?groupError=groupDeleteFailed', 303);
        }
        return ctx.redirect('/app', 303);
    });

    // Kicking is owner-only; removeGroupMember still refuses below-minimum.
    app.post('/app/group/kick', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const group = findUserGroup(ctx.var, user.id);
        const form = await ctx.req.formData().catch(() => null);
        const memberId = Number(form?.get('member_id'));
        if (
            !group ||
            group.ownerId !== user.id ||
            !Number.isInteger(memberId) ||
            removeGroupMember(ctx.var, group.id, memberId) !== 'removed'
        ) {
            return ctx.redirect('/app?groupError=groupKickFailed', 303);
        }
        return ctx.redirect('/app', 303);
    });

    app.post('/app/queue/join', (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const group = findUserGroup(ctx.var, user.id);
        if (!group || joinQueue(ctx.var, group.id).type !== 'joined') {
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

        const boardParam = ctx.req.query('board');
        const board: LeaderboardBoard =
            boardParam === 'gambling' || boardParam === 'combined' ? boardParam : 'activity';
        const scope = ctx.req.query('scope') === 'groups' ? 'groups' : 'players';
        const viewerGroupId = findUserGroup(ctx.var, user.id)?.id ?? null;
        if (scope === 'players') {
            return writePage(ctx, 'leaderboard', {
                board,
                scope,
                rows: listPlayerLeaderboard(ctx.var, board),
                viewerGroupId,
            });
        }
        return writePage(ctx, 'leaderboard', {
            board,
            scope,
            groups: listGroupLeaderboard(ctx.var, board),
            viewerGroupId,
        });
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
