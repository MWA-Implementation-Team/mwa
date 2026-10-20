import { requireUser } from '#src/auth.js';
import { translate } from '#src/client/language.js';
import { initGame, queryGames } from '#src/db/gambling.js';
import { findUserByUsername } from '#src/db/users.js';
import { writePage } from '#src/pages.js';
import { MwaHono } from '#src/state.js';
import { getRequestLanguage } from '#src/utils.js';

export function registerGamblingRoutes(app: MwaHono) {
    app.get('/app/gambling', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const games = queryGames(ctx.var);

        return writePage(ctx, 'gambling', {
            games,
        });
    });

    app.post('/app/gambling', async (ctx) => {
        const user = requireUser(ctx);
        if (user instanceof Response) return user;

        const lang = getRequestLanguage(ctx);
        const games = queryGames(ctx.var);

        const form = await ctx.req.formData().catch(() => null);
        if (!form) {
            return ctx.text(translate(lang)('badRequest'), 400);
        }

        const opponentUsername = String(form.get('opponent') ?? '');

        const opponent = findUserByUsername(ctx.var, opponentUsername);
        if (!opponent) {
            return writePage(ctx, 'gambling', {
                games,
                message: 'no user',
            });
        }

        const id = initGame(ctx.var, 'coin_flip', {
            p1: user.id,
            p2: opponent.id,
            betAmount: 500,
        });
        console.log('game id', id);

        return ctx.redirect('/app/gambling');
    });
}
