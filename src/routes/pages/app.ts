import { requireRole, requireUser } from '#src/auth.js';
import { grantCoins, listUserTransactions, transferCoins } from '#src/db/transactions/index.js';
import {
    LeaderboardBoard,
    listGroupLeaderboard,
    listPlayerLeaderboard,
    listViewerStandings,
} from '#src/db/leaderboard/index.js';
import {
    acceptGroupInvite,
    createGroupInvite,
    disbandGroup,
    deleteGroupInvite,
    findGroupInviteById,
    findUserGroup,
    listGroupMemberInfos,
    listGroupMembers,
    MAX_GROUP_NAME_LENGTH,
    MAX_PHONE_NUMBER_LENGTH,
    removeGroupMember,
    updateGroup,
} from '#src/db/groups/index.js';
import {
    callNextGroups,
    markEntryDone,
    joinQueue,
    leaveQueue,
    QUEUE_MIN_GROUP_SIZE,
    getQueuePosition,
    getUserWaitingEntry,
    listGroupCompletions,
    listWaitingQueue,
    listStationGroups,
} from '#src/db/queue/index.js';
import { ActivitySlug, isActivitySlug, registeredActivities } from '#src/client/activities.js';
import { cookieSession } from '#src/client/constants.js';
import { findUserByInteractToken, rotateInteractToken } from '#src/db/interactions/index.js';
import { gambleErrorMessages } from './gambling.js';
import { claimSystemQrCode } from '#src/db/systemqr/index.js';
import { updateUsername } from '#src/db/users/index.js';
import { deleteSession } from '#src/db/sessions/index.js';
import { writeErrorPage, writePage } from '#src/pages.js';
import { notificationsChannel, publish } from '#src/pubsub.js';
import { MwaContext, MwaHono } from '#src/state.js';
import { deleteCookie, getCookie } from 'hono/cookie';
import { Language } from '#src/client/language.js';
import { safeGoto } from './login.js';

// Emoji stand-ins until real per-group art ships. The pick is stable per
// group — a mascot, not a slot machine — keyed off the group's id.
const GROUP_ART_PLACEHOLDERS = ['🦊', '🐸', '🐼', '🐨', '🐯', '🦁', '🐙', '🦄'];
const NO_GROUP_ART = '😔';

// Feedback query params are allowlist-guarded: an unknown value falls back to
// undefined so a stray ?xError=whatever can't smuggle a lang key or enum into
// the page.
function queryFlag<T extends string>(
    ctx: MwaContext,
    name: string,
    allowed: readonly T[],
): T | undefined {
    const value = ctx.req.query(name);
    return allowed.includes(value as T) ? (value as T) : undefined;
}

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

        const queueError = queryFlag(ctx, 'queueError', [
            'queueJoinFailed',
            'queueLeaveFailed',
            'queueTooSmall',
            'queueAtStation',
            'queueAllDone',
        ] as const);
        const groupError = queryFlag(ctx, 'groupError', [
            'groupKickFailed',
            'groupLeaveFailed',
            'groupDeleteFailed',
            'groupEditFailed',
            'groupNameTaken',
            'groupAcceptFailed',
        ] as const);

        // Reward qr scan outcome: claimed amount or a failure message
        const qrClaimed = Number(ctx.req.query('claimed'));
        const qrClaimedAmount = Number.isSafeInteger(qrClaimed) && qrClaimed > 0 ? qrClaimed : null;
        const qrError = queryFlag(ctx, 'qrError', [
            'not_found',
            'expired',
            'used_up',
            'already_claimed',
        ] as const);
        const youError = queryFlag(ctx, 'youError', [
            'youUsernameTaken',
            'youUsernameInvalid',
        ] as const);
        const youNotice = queryFlag(ctx, 'youNotice', ['youSaved', 'youQrReset'] as const);
        const groupNotice = queryFlag(ctx, 'groupNotice', [
            'groupSaved',
            'groupKicked',
            'groupDeleted',
            'groupLeft',
        ] as const);

        // QRs minted while the interact flow was a dialog on /app point to
        // ?interact=<token> — bounce them onto the standalone page so old
        // codes and shares keep working.
        const interactToken = ctx.req.query('interact');
        if (interactToken !== undefined) {
            const url = new URL(ctx.req.url);
            const target = new URL(`/app/interact/${encodeURIComponent(interactToken)}`, url);
            url.searchParams.forEach((value, key) => {
                if (key !== 'interact') target.searchParams.set(key, value);
            });
            return ctx.redirect(target.pathname + target.search, 303);
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
            groupPhone: group?.phoneNumber ?? null,
            groupEmoji,
            groupMemberCount: group ? memberCount : null,
            groupOwnerId: group?.ownerId ?? null,
            groupMembers,
            groupError,
            groupNotice,
            youError,
            youNotice,
            queueError,
            qrClaimedAmount,
            qrError,
            stationProgress: group
                ? (Object.keys(registeredActivities) as ActivitySlug[]).map((slug) => ({
                      slug,
                      name: registeredActivities[slug].name,
                      done: listGroupCompletions(ctx.var, group.id).includes(slug),
                  }))
                : null,
            queueCanJoin: memberCount >= QUEUE_MIN_GROUP_SIZE,
            queuePosition: queueEntry ? getQueuePosition(ctx.var, queueEntry.id) : null,
            standings: listViewerStandings(ctx.var, user.id, group?.id ?? null),
        });
    });

    // Members can only remove themselves; the owner can't leave — deleting
    // the group is the only way out for them.
    app.post('/app/group/leave', (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const group = findUserGroup(ctx.var, user.id);
        if (!group || removeGroupMember(ctx.var, group.id, user.id) !== 'removed') {
            return ctx.redirect('/app?groupError=groupLeaveFailed#panel-group', 303);
        }
        return ctx.redirect('/app?groupNotice=groupLeft#panel-group', 303);
    });

    // Disbanding is the owner's only way out — owner check is inside
    // disbandGroup. It's a soft delete: the row stays (scores and queue
    // history survive), members leave and queue spots close.
    app.post('/app/group/delete', (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const group = findUserGroup(ctx.var, user.id);
        if (!group || !disbandGroup(ctx.var, group.id, user.id)) {
            return ctx.redirect('/app?groupError=groupDeleteFailed#panel-group', 303);
        }
        return ctx.redirect('/app?groupNotice=groupDeleted#panel-group', 303);
    });

    // Kicking is owner-only; removeGroupMember refuses non-members and
    // evicts the group from the queue when it drops below the queue minimum.
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
            return ctx.redirect('/app?groupError=groupKickFailed#panel-group', 303);
        }
        return ctx.redirect('/app?groupNotice=groupKicked#panel-group', 303);
    });

    // The group's name/phone are edited from the home table's per-field
    // dialogs — owner only. Each dialog posts both columns (the untouched
    // field rides along as a hidden input).
    app.post('/app/group/edit', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const form = await ctx.req.formData().catch(() => null);
        const name = String(form?.get('name') ?? '').trim();
        const phoneNumber = String(form?.get('phone_number') ?? '').trim();
        const group = findUserGroup(ctx.var, user.id);

        if (
            !group ||
            name === '' ||
            name.length > MAX_GROUP_NAME_LENGTH ||
            phoneNumber.length > MAX_PHONE_NUMBER_LENGTH
        ) {
            return ctx.redirect('/app?groupError=groupEditFailed', 303);
        }

        const result = updateGroup(ctx.var, group.id, user.id, name, phoneNumber);
        if (result === 'taken') return ctx.redirect('/app?groupError=groupNameTaken', 303);
        if (result !== 'updated') return ctx.redirect('/app?groupError=groupEditFailed', 303);
        return ctx.redirect('/app?groupNotice=groupSaved', 303);
    });

    // Join request from the interact page — the requester asks into the
    // target's team (must be groupless themselves); the target sees it as a
    // notification.
    app.post('/app/interact/:token/group-request', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const token = ctx.req.param('token');
        const target = findUserByInteractToken(ctx.var, token);
        if (!target || target.id === user.id) return writeErrorPage(ctx, 404);
        if (user.role !== 'user' || target.role !== 'user') return writeErrorPage(ctx, 403);

        const back = `/app/interact/${encodeURIComponent(token)}`;
        if (findUserGroup(ctx.var, user.id)) {
            return ctx.redirect(`${back}?interactError=groupRequestFailed`, 303);
        }

        createGroupInvite(ctx.var, user.id, target.id);
        publish(notificationsChannel(target.id), '');
        return ctx.redirect(`${back}?interactNotice=groupRequestSent`, 303);
    });

    // Accepting a team-up invite forms the group immediately — the accepter
    // owns it and can rename it from the home table.
    app.post('/app/groups/invites/:id/accept', (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const inviteId = Number(ctx.req.param('id'));
        const invite = findGroupInviteById(ctx.var, inviteId);
        const result = acceptGroupInvite(ctx.var, inviteId, user.id);

        if (invite) {
            publish(notificationsChannel(invite.fromUserId), '');
            publish(notificationsChannel(invite.toUserId), '');
        }
        return ctx.redirect(
            result === 'accepted' ? '/app' : '/app?groupError=groupAcceptFailed',
            303,
        );
    });

    app.post('/app/groups/invites/:id/reject', (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const inviteId = Number(ctx.req.param('id'));
        const invite = findGroupInviteById(ctx.var, inviteId);
        if (!invite || !deleteGroupInvite(ctx.var, inviteId, user.id)) {
            return writeErrorPage(ctx, 404);
        }

        publish(notificationsChannel(invite.fromUserId), '');
        publish(notificationsChannel(invite.toUserId), '');

        let goto: string | undefined;
        try {
            goto = new URL(ctx.req.header('Referer') ?? '').pathname;
        } catch {
            // fallback below
        }
        return ctx.redirect(safeGoto(ctx, goto) ?? '/app', 303);
    });

    // Username edits come from the you tab's modal on /app; a bad name bounces
    // back with an error the reopened dialog shows.
    app.post('/app/you/username', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const form = await ctx.req.formData().catch(() => null);
        const result = updateUsername(ctx.var, user.id, String(form?.get('username') ?? ''));
        if (result !== 'updated') {
            const error = result === 'taken' ? 'youUsernameTaken' : 'youUsernameInvalid';
            return ctx.redirect(`/app?youError=${error}`, 303);
        }
        return ctx.redirect('/app?youNotice=youSaved', 303);
    });

    app.post('/app/queue/join', (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const group = findUserGroup(ctx.var, user.id);
        if (!group) return ctx.redirect('/app?queueError=queueJoinFailed#panel-game', 303);

        const result = joinQueue(ctx.var, group.id);
        if (result.type === 'too_small') {
            return ctx.redirect('/app?queueError=queueTooSmall#panel-game', 303);
        }
        if (result.type === 'at_station') {
            return ctx.redirect('/app?queueError=queueAtStation#panel-game', 303);
        }
        if (result.type === 'all_done') {
            return ctx.redirect('/app?queueError=queueAllDone#panel-game', 303);
        }
        if (result.type !== 'joined') {
            return ctx.redirect('/app?queueError=queueJoinFailed#panel-game', 303);
        }

        return ctx.redirect('/app#panel-game', 303);
    });

    app.post('/app/queue/leave', (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const group = findUserGroup(ctx.var, user.id);
        if (!group || !leaveQueue(ctx.var, group.id)) {
            return ctx.redirect('/app?queueError=queueLeaveFailed#panel-game', 303);
        }

        return ctx.redirect('/app#panel-game', 303);
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

    // One host page serves every station — the host cycles cards client-side
    // to pick the activity they're staffing, so there's no host↔station binding.
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

        callNextGroups(ctx.var, Math.min(count, 4), station);
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

    // Scanner paying the scanned user — amount comes from the page's send
    // form. Errors bounce back to it; a sent transfer lands on the page with
    // the amount as a success note.
    app.post('/app/interact/:token/send-money', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const token = ctx.req.param('token');
        const target = findUserByInteractToken(ctx.var, token);
        if (!target || target.id === user.id) return writeErrorPage(ctx, 404);
        if (user.role !== 'user' || target.role !== 'user') return writeErrorPage(ctx, 403);

        const form = await ctx.req.formData().catch(() => null);
        if (!form) return writeErrorPage(ctx, 400);

        const back = `/app/interact/${encodeURIComponent(token)}`;
        const amount = Number(form.get('amount'));
        if (!Number.isSafeInteger(amount) || amount <= 0) {
            return ctx.redirect(`${back}?sendError=interactSendInvalid`, 303);
        }

        const result = transferCoins(ctx.var, user.id, target.id, amount);
        if (result !== 'sent') {
            const key = result === 'too_broke' ? 'interactSendInsufficient' : 'interactSendInvalid';
            return ctx.redirect(`${back}?sendError=${key}`, 303);
        }
        return ctx.redirect(`${back}?sent=${amount}`, 303);
    });

    // What the personal QR opens — the standalone interact page.
    app.get('/app/interact/:token', (ctx) => {
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

        const interactError = queryFlag(ctx, 'interactError', [
            'groupRequestFailed',
            'interactAwardInvalid',
        ] as const);
        const interactNotice = queryFlag(ctx, 'interactNotice', [
            'groupRequestSent',
            'interactAwarded',
        ] as const);
        const sendError = queryFlag(ctx, 'sendError', [
            'interactSendInvalid',
            'interactSendInsufficient',
        ] as const);
        const sent = Number(ctx.req.query('sent'));
        const sentAmount = Number.isSafeInteger(sent) && sent > 0 ? sent : null;

        // the scanned user's team for the shared-info panel — same stable
        // emoji pick the home queue panel uses, sad face when groupless
        const targetGroup = findUserGroup(ctx.var, target.id);
        const group = targetGroup
            ? {
                  name: targetGroup.name,
                  memberCount: listGroupMembers(ctx.var, targetGroup.id).length,
              }
            : null;
        const groupEmoji = targetGroup
            ? GROUP_ART_PLACEHOLDERS[targetGroup.id % GROUP_ART_PLACEHOLDERS.length]
            : NO_GROUP_ART;

        // a challenge POST that bounced — reopen its game's dialog with the
        // message, same contract the invite page used
        const errorGame = queryFlag(ctx, 'error_game', [
            'coin_flip',
            'connect_4',
            'chess',
        ] as const);
        const errorType = queryFlag(ctx, 'error_type', ['invalid', 'broke'] as const);
        const gamblingError = errorGame
            ? {
                  dialog: errorGame,
                  message: errorType ? gambleErrorMessages[errorType] : undefined,
              }
            : undefined;

        return writePage(ctx, 'interact', {
            token,
            self,
            target: { username: target.username },
            canPlay: user.role === 'user' && target.role === 'user',
            group,
            groupEmoji,
            // same three boards as the home standings table, for the target
            // and their team
            standings: listViewerStandings(ctx.var, target.id, targetGroup?.id ?? null),
            detail,
            interactError,
            interactNotice,
            sendError,
            sentAmount,
            gamblingError,
        });
    });

    // Host (admin) award form: give the scanned user coins plus write an optional note
    app.post('/app/interact/:token/award', async (ctx) => {
        const user = requireRole(ctx, 'host', 'admin');
        if (user instanceof Response) return user;

        const token = ctx.req.param('token');
        const target = findUserByInteractToken(ctx.var, token);
        if (!target || target.id === user.id) return writeErrorPage(ctx, 404);

        const form = await ctx.req.formData().catch(() => null);
        if (!form) return writeErrorPage(ctx, 400);

        const back = `/app/interact/${encodeURIComponent(token)}`;
        const amount = Number(form.get('amount'));
        if (!Number.isSafeInteger(amount) || amount <= 0) {
            return ctx.redirect(`${back}?interactError=interactAwardInvalid`, 303);
        }

        const note = form.get('note');
        const noteText = typeof note === 'string' && note.trim() ? note.trim().slice(0, 200) : null;

        grantCoins(ctx.var, target.id, amount, noteText);
        return ctx.redirect(`${back}?interactNotice=interactAwarded`, 303);
    });

    // Reward qr scan (the secret in the QR is the route param)
    // Any signed-in user can claim (server side guard against double scans)
    app.get('/app/qr/:secret', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const secret = ctx.req.param('secret');
        const result = claimSystemQrCode(ctx.var, secret, user.id);
        const outcome =
            result.type === 'claimed' ? `claimed=${result.balanceDelta}` : `qrError=${result.type}`;
        return ctx.redirect(`/app?${outcome}`, 303);
    });

    // Reset the personal qr token (the old code stops working immediately))
    app.post('/app/you/reset-qr', (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        rotateInteractToken(ctx.var, user.id);
        return ctx.redirect('/app?youNotice=youQrReset', 303);
    });
}
