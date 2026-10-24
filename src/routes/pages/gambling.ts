import { requireUser } from '#src/auth.js';
import { translate } from '#src/client/language.js';
import { acceptGamblingSession, findGamblingSessionById, giveCoins, initCoinFlip, PendingCoinFlip, queryGamblingInvitations, queryGamblingSessions, queryPendingCoinFlips, rejectGamblingSession, winCoinFlip } from '#src/db/gambling.js';
import { findUserByUsername } from '#src/db/users.js';
import { writeErrorPage, writePage } from '#src/pages.js';
import { publish, subscribe } from '#src/pubsub.js';
import { MwaHono, MwaState } from '#src/state.js';
import { getRequestLanguage } from '#src/utils.js';
import { streamSSE } from 'hono/streaming';

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

        const error = ctx.req.query('error');
        let message: string | undefined;
        switch (error) {
            case 'no_user':
                message = 'user not found';
                break;
            case 'broke':
                message = 'broke boy';
                break;
        }

        return writePage(ctx, 'gambling', {
            sessions: games,
            invitations,
            message,
        });
    });

    app.post('/app/gambling', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const lang = getRequestLanguage(ctx);

        const form = await ctx.req.formData().catch(() => null);
        if (!form) {
            return ctx.text(translate(lang)('badRequest'), 400);
        }

        const opponentUsername = String(form.get('opponent') ?? '');

        const opponent = findUserByUsername(ctx.var, opponentUsername);
        if (!opponent || user.id === opponent.id) {
            return ctx.redirect(`/app/gambling?error=no_user`);
        }

        const id = initCoinFlip(ctx.var, 'heads', {
            p1: user.id,
            p2: opponent.id,
            betAmount: 500,
        });
        if (id === null) {
            return ctx.redirect(`/app/gambling?error=broke`);
        }

        return ctx.redirect(`/app/gambling/sessions/${id}`);
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

        const sessionId = Number(ctx.req.param('id'));
        rejectGamblingSession(ctx.var, sessionId, user.id);
        broadcastSessionUpdate(ctx.var, sessionId);
        return ctx.redirect('/app/gambling');
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

function sessionChannel(id: number): string {
    return `gambling_session:${id}`;
}

function broadcastSessionUpdate(state: MwaState, sessionId: number) {
    const session = findGamblingSessionById(state, sessionId);
    if (!session) return;

    publish(sessionChannel(sessionId), JSON.stringify(session));
}
