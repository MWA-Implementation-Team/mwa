import { requireUser } from '#src/auth.js';
import { translate } from '#src/client/language.js';
import { acceptGamblingSession, findGamblingSessionById, giveCoins, initGamblingSession, queryGamblingInvitations, queryGamblingSessions } from '#src/db/gambling.js';
import { findUserByUsername } from '#src/db/users.js';
import { writeErrorPage, writePage } from '#src/pages.js';
import { MwaHono } from '#src/state.js';
import { getRequestLanguage } from '#src/utils.js';

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

    app.post('/app/gambling', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const lang = getRequestLanguage(ctx);

        const form = await ctx.req.formData().catch(() => null);
        if (!form) {
            return ctx.text(translate(lang)('badRequest'), 400);
        }

        const sessions = queryGamblingSessions(ctx.var);
        const invitations = queryGamblingInvitations(ctx.var, user.id);

        const opponentUsername = String(form.get('opponent') ?? '');

        const opponent = findUserByUsername(ctx.var, opponentUsername);
        if (!opponent) {
            return writePage(ctx, 'gambling', {
                sessions,
                invitations,
                message: 'no user',
            });
        }

        const id = initGamblingSession(ctx.var, 'coin_flip', {
            p1: user.id,
            p2: opponent.id,
            betAmount: 500,
        });
        if (id === null) {
            return writePage(ctx, 'gambling', {
                sessions,
                invitations,
                message: 'ur too broke',
            });
        }
        console.log('game id', id);

        return ctx.redirect('/app/gambling');
    });

    app.get('/app/gambling/sessions/:id', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const gameId = Number(ctx.req.param('id'));
        const game = findGamblingSessionById(ctx.var, gameId);
        if (!game) {
            return writeErrorPage(ctx, 404);
        }

        if (game.status === 'pending') {
            return writePage(ctx, 'game', {
                type: 'confirm',
                game,
            });
        }

        return writePage(ctx, 'game', {
            type: 'running',
            game,
        });
    });

    app.post('/app/gambling/sessions/:id', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        //const lang = getRequestLanguage(ctx);

        const form = await ctx.req.formData().catch(() => null);
        if (!form) {
            return writeErrorPage(ctx, 400);
        }

        const gameId = Number(ctx.req.param('id'));
        const game = findGamblingSessionById(ctx.var, gameId);
        if (!game) {
            return writeErrorPage(ctx, 404);
        }

        const result = acceptGamblingSession(ctx.var, gameId, user.id);
        if (result === 'invalid_session') {
            return writeErrorPage(ctx, 400);
        }
        if (result === 'too_broke') {
            return writePage(ctx, 'game', {
                type: 'confirm',
                game,
                message: 'broke boy'
            });
        }

        return writePage(ctx, 'game', {
            type: 'running',
            game,
        });
    });
}

