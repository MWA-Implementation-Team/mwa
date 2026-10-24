import { requireUser } from '#src/auth.js';
import { InviteToGamblePageProps } from '#src/client/pages/app/gambling/InviteToGamblePage.js';
import { acceptGamblingSession, CoinSide, findGamblingSessionById, GameType, giveCoins, initCoinFlip, PendingCoinFlip, queryGamblingInvitations, queryGamblingSessions, queryPendingCoinFlips, rejectGamblingSession, winCoinFlip } from '#src/db/gambling.js';
import { findUserByInteractToken } from '#src/db/interactions.js';
import { writeErrorPage, writePage } from '#src/pages.js';
import { notificationsChannel, publish, sessionChannel, subscribe } from '#src/pubsub.js';
import { MwaHono, MwaState } from '#src/state.js';
import { streamSSE } from 'hono/streaming';
import { safeGoto } from './login.js';

export function registerGamblingRoutes(app: MwaHono) {
    app.get('/app/give-coins', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const amount = Number(ctx.req.query('amount'));
        giveCoins(ctx.var, user.id, amount);
        return ctx.text('ok');
    });

    app.get('/app/gambling', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const games = queryGamblingSessions(ctx.var);
        const invitations = queryGamblingInvitations(ctx.var, user.id);

        return writePage(ctx, 'gambling', {
            sessions: games,
            invitations,
        });
    });

    app.get('/app/interact/:token/gamble', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const token = ctx.req.param('token');
        const target = findUserByInteractToken(ctx.var, token);
        if (!target || target.id === user.id) return writeErrorPage(ctx, 404);

        let errorDialog = ctx.req.query('error_game');
        if (errorDialog !== 'coin_flip') {
            errorDialog = '';
        }

        const errorType = ctx.req.query('error_type');
        let errorMessage: string | undefined;
        switch (errorType) {
            case 'broke':
                errorMessage = 'broke boy';
                break;
        }

        let error: InviteToGamblePageProps['error'] | undefined;
        if (errorMessage && errorDialog) {
            error = {
                dialog: errorDialog as GameType,
                message: errorMessage,
            };
        }

        return writePage(ctx, 'inviteToGamble', {
            targetUsername: target.username,
            error,
        });
    });

    app.post('/app/interact/:token/gamble', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const token = ctx.req.param('token');
        const target = findUserByInteractToken(ctx.var, token);
        if (!target || target.id === user.id) return writeErrorPage(ctx, 404);

        const form = await ctx.req.formData().catch(() => null);
        if (!form) return writeErrorPage(ctx, 400);

        const betAmount = Number(form.get('bet_amount'));
        if (isNaN(betAmount) || betAmount <= 0) return writeErrorPage(ctx, 400);

        const gameType = form.get('game_type') as GameType;

        let sessionId: number | null = null;
        switch (gameType) {
            case 'coin_flip': {
                const coinFlipBet = form.get('cf_bet') as CoinSide;
                if (coinFlipBet !== 'heads' && coinFlipBet !== 'tails') return writeErrorPage(ctx, 400);

                sessionId = initCoinFlip(ctx.var, coinFlipBet, {
                    p1: user.id,
                    p2: target.id,
                    betAmount,
                });
                break;
            }
            default:
                return writeErrorPage(ctx, 400);
        }

        if (sessionId === null) {
            return ctx.redirect(`/app/interact/${encodeURIComponent(token)}/gamble?error_game=coin_flip&error_type=broke`);
        }
        // signal for /api/notifications to update notification
        publish(notificationsChannel(target.id), '');

        return ctx.redirect(`/app/gambling/sessions/${sessionId}`);
    });

    app.get('/app/gambling/sessions/:id', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const gameId = Number(ctx.req.param('id'));
        const game = findGamblingSessionById(ctx.var, gameId);
        if (!game) {
            return writeErrorPage(ctx, 404);
        }

        const error = ctx.req.query('error');
        let message: string | undefined;
        switch (error) {
            case 'broke':
                message = 'broke boy';
                break;
        }

        return writePage(ctx, 'game', {
            sessionId: gameId,
            game,
            message,
        });
    });

    app.get('/app/gambling/sessions/:id/watch', async (ctx) => {
        const sessionId = Number(ctx.req.param('id'));

        return streamSSE(ctx, async (stream) => {
            const sub = subscribe(sessionChannel(sessionId));
            stream.onAbort(() => sub.close());
            while (!stream.aborted) {
                const json = await sub.recv();
                if (!json) break;

                await stream.writeSSE({
                    data: json,
                })
            }
        })
    });

    app.post('/app/gambling/sessions/:id/accept', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        //const lang = getRequestLanguage(ctx);

        const form = await ctx.req.formData().catch(() => null);
        if (!form) {
            return writeErrorPage(ctx, 400);
        }

        const sessionId = Number(ctx.req.param('id'));
        const game = findGamblingSessionById(ctx.var, sessionId);
        if (!game) {
            return writeErrorPage(ctx, 404);
        }

        const result = acceptGamblingSession(ctx.var, sessionId, user.id);
        if (result === 'too_broke') {
            return ctx.redirect(`/app/gambling/sessions/${encodeURIComponent(sessionId)}?error=broke`);
        }
        broadcastSessionUpdate(ctx.var, sessionId);

        scheduleCoinFlipWinner(ctx.var, {
            sessionId,
            acceptedTime: new Date(),
        });

        return ctx.redirect(`/app/gambling/sessions/${encodeURIComponent(sessionId)}`);
    });

    app.post('/app/gambling/sessions/:id/reject', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        //const lang = getRequestLanguage(ctx);

        const form = await ctx.req.formData().catch(() => null);
        if (!form) {
            return writeErrorPage(ctx, 400);
        }

        let goto: string | undefined;
        const ref = ctx.req.header('Referer');
        if (ref) {
            goto = new URL(ref).pathname;
        }

        const gotoQuery = ctx.req.query('goto');
        if (gotoQuery) {
            goto = gotoQuery;
        }

        const sessionId = Number(ctx.req.param('id'));
        rejectGamblingSession(ctx.var, sessionId, user.id);
        broadcastSessionUpdate(ctx.var, sessionId);
        return ctx.redirect(safeGoto(ctx, goto) ?? '/app');
    });
}

export function scheduleGamblingTimers(state: MwaState) {
    const coinFlips = queryPendingCoinFlips(state);
    coinFlips.forEach(flip => scheduleCoinFlipWinner(state, flip));
}

function scheduleCoinFlipWinner(state: MwaState, pending: PendingCoinFlip) {
    const flipTimeMs = pending.acceptedTime.getTime() + 5000;
    const remainingMs = Math.max(0, flipTimeMs - Date.now());

    setTimeout(() => {
        winCoinFlip(state, pending.sessionId);
        broadcastSessionUpdate(state, pending.sessionId);
    }, remainingMs);
}

function broadcastSessionUpdate(state: MwaState, sessionId: number) {
    const session = findGamblingSessionById(state, sessionId);
    if (!session) return;

    publish(sessionChannel(sessionId), JSON.stringify(session));
}
