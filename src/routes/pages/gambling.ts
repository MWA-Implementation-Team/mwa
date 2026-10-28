import { requireApiUser, requireUser } from '#src/auth.js';
import { InviteToGamblePageProps } from '#src/client/pages/app/gambling/InviteToGamblePage.js';
import {
    acceptGamblingSession,
    CoinSide,
    findGamblingSessionById,
    findPendingGamblingSession,
    GameType,
    initCoinFlip,
    PendingCoinFlip,
    queryGamblingInvitations,
    queryGamblingSessions,
    queryPendingCoinFlips,
    cancelGamblingSession,
    winCoinFlip,
    ExpiringGamblingSession,
    queryExpiringGamblingSessions,
    initConnect4,
    connect4TakeTurn,
    Gambler,
    winGamblingSession,
} from '#src/db/gambling.js';
import { findUserByInteractToken } from '#src/db/interactions.js';
import { writeErrorPage, writePage } from '#src/pages.js';
import { notificationsChannel, publish, sessionChannel, subscribe } from '#src/pubsub.js';
import { MwaHono, MwaState } from '#src/state.js';
import { streamSSE } from 'hono/streaming';
import { safeGoto } from './login.js';
import { gamblingPendingExpiryMinutes } from '#src/client/constants.js';
import { Language } from '#src/client/language.js';
import { C4Cell, C4Player, c4Width, Connect4Board } from '#src/client/gambling/connect4.js';

// error_type values pages render as an inline message
const gambleErrorMessages = {
    broke: 'gamblingInsufficientCoins',
    invalid: 'gamblingInvalidBet',
} as const satisfies Record<string, keyof Language>;

export function registerGamblingRoutes(app: MwaHono) {
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

        const errorGame = ctx.req.query('error_game') as GameType;
        const message =
            gambleErrorMessages[ctx.req.query('error_type') as keyof typeof gambleErrorMessages];
        let error: InviteToGamblePageProps['error'] | undefined = undefined;
        if (errorGame === 'coin_flip' || errorGame === 'connect_4') {
            error = { dialog: errorGame, message };
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

        const gameType = form.get('game_type') as GameType;
        if (gameType !== 'coin_flip' && gameType !== 'connect_4') {
            return writeErrorPage(ctx, 400);
        }

        const betAmount = Number(form.get('bet_amount'));
        if (!Number.isSafeInteger(betAmount) || betAmount <= 0) {
            return ctx.redirect(
                `/app/interact/${encodeURIComponent(token)}/gamble?error_game=${gameType}&error_type=invalid`,
            );
        }

        const pendingId = findPendingGamblingSession(ctx.var, user.id, target.id);
        if (pendingId !== null) {
            return ctx.redirect(`/app/gambling/sessions/${pendingId}`);
        }

        let sessionId: number | null = null;
        switch (gameType) {
            case 'coin_flip': {
                const coinFlipBet = form.get('cf_bet') as CoinSide;
                if (coinFlipBet !== 'heads' && coinFlipBet !== 'tails')
                    return writeErrorPage(ctx, 400);

                sessionId = initCoinFlip(ctx.var, coinFlipBet, {
                    p1: user.id,
                    p2: target.id,
                    betAmount,
                });
                break;
            }
            case 'connect_4': {
                sessionId = initConnect4(ctx.var, {
                    p1: user.id,
                    p2: target.id,
                    betAmount,
                });
                break;
            }
        }

        if (sessionId === null) {
            return ctx.redirect(
                `/app/interact/${encodeURIComponent(token)}/gamble?error_game=${gameType}&error_type=broke`,
            );
        }

        scheduleExpiry(ctx.var, {
            id: sessionId,
            creationTime: new Date(),
        });

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

        const message =
            gambleErrorMessages[ctx.req.query('error') as keyof typeof gambleErrorMessages];

        return writePage(ctx, 'gamblingSession', {
            sessionId: gameId,
            game,
            message,
        });
    });

    app.get('/app/gambling/sessions/:id/watch', async (ctx) => {
        const user = requireApiUser(ctx);
        if (user instanceof Response) return user;

        const sessionId = Number(ctx.req.param('id'));

        return streamSSE(ctx, async (stream) => {
            const sub = subscribe(sessionChannel(sessionId));
            try {
                stream.onAbort(() => sub.close());

                const session = findGamblingSessionById(ctx.var, sessionId);
                if (!session) return;
                await stream.writeSSE({
                    data: JSON.stringify(session),
                });

                while (!stream.aborted) {
                    const json = await sub.recv();
                    if (!json) break;

                    await stream.writeSSE({
                        data: json,
                    });
                }
            } finally {
                sub.close();
            }
        });
    });

    app.post('/app/gambling/sessions/:id/accept', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

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
        switch (result) {
            case 'too_broke':
                return ctx.redirect(
                    `/app/gambling/sessions/${encodeURIComponent(sessionId)}?error=broke`,
                );
            case 'invalid_session':
                return ctx.redirect('/app/gambling');
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

        const form = await ctx.req.formData().catch(() => null);
        if (!form) {
            return writeErrorPage(ctx, 400);
        }

        let goto = ctx.req.query('goto');
        if (!goto) {
            try {
                goto = new URL(ctx.req.header('Referer') ?? '').pathname;
            } catch {
                // fallback below
            }
        }

        const sessionId = Number(ctx.req.param('id'));
        cancelGamblingSession(ctx.var, sessionId, 'rejected', user.id);
        broadcastSessionUpdate(ctx.var, sessionId);
        return ctx.redirect(safeGoto(ctx, goto) ?? '/app');
    });

    app.post('/app/gambling/sessions/:id/c4-place', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const sessionId = Number(ctx.req.param('id'));
        const game = findGamblingSessionById(ctx.var, sessionId);
        if (!game) {
            return writeErrorPage(ctx, 404);
        }

        if (game.gameType !== 'connect_4' || (user.id !== game.p1 && user.id !== game.p2)) {
            return writeErrorPage(ctx, 400);
        }

        const form = await ctx.req.formData().catch(() => null);
        if (!form) {
            return writeErrorPage(ctx, 400);
        }

        const x = Number(form.get('x'));
        if (x < 0 || x >= c4Width) {
            return writeErrorPage(ctx, 400);
        }

        const gambler: Gambler = game.p1 === user.id ? 'p1' : 'p2';
        const c4Player: C4Player = gambler === 'p1' ? 'x' : 'o';
        const board = Connect4Board.fromString(game.boardStr);

        if (!board.place(x, c4Player)) {
            return ctx.redirect(`/app/gambling/sessions/${sessionId}`);
        }

        if (connect4TakeTurn(ctx.var, sessionId, gambler, board)) {
            const winner = board.winner();
            if (winner) {
                winGamblingSession(ctx.var, sessionId, winner === 'x' ? 'p1' : 'p2');
            }

            broadcastSessionUpdate(ctx.var, sessionId);
        }

        return ctx.redirect(`/app/gambling/sessions/${sessionId}`);
    });
}

export function scheduleGamblingTimers(state: MwaState) {
    const expiring = queryExpiringGamblingSessions(state);
    expiring.forEach((exp) => scheduleExpiry(state, exp));

    const coinFlips = queryPendingCoinFlips(state);
    coinFlips.forEach((flip) => scheduleCoinFlipWinner(state, flip));
}

// Fires task at the given timestamp, or immediately if it already passed.
function scheduleAfter(atMs: number, task: () => void) {
    setTimeout(task, Math.max(0, atMs - Date.now()));
}

function scheduleExpiry(state: MwaState, expiring: ExpiringGamblingSession) {
    scheduleAfter(expiring.creationTime.getTime() + gamblingPendingExpiryMinutes * 60000, () => {
        cancelGamblingSession(state, expiring.id, 'expired');
        broadcastSessionUpdate(state, expiring.id);
    });
}

function scheduleCoinFlipWinner(state: MwaState, pending: PendingCoinFlip) {
    scheduleAfter(pending.acceptedTime.getTime() + 5000, () => {
        winCoinFlip(state, pending.sessionId);
        broadcastSessionUpdate(state, pending.sessionId);
    });
}

function broadcastSessionUpdate(state: MwaState, sessionId: number) {
    const session = findGamblingSessionById(state, sessionId);
    if (!session) return;

    publish(sessionChannel(sessionId), JSON.stringify(session));

    publish(notificationsChannel(session.p1), '');
    publish(notificationsChannel(session.p2), '');
}
