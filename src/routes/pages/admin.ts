import { requireRole } from '#src/auth.js';
import { giveCoins } from '#src/db/transactions.js';
import { findUserByUsername } from '#src/db/users.js';
import { writePage } from '#src/pages.js';
import { MwaHono } from '#src/state.js';

export function registerAdminRoutes(app: MwaHono) {
    app.get('/admin', async (ctx) => {
        const user = requireRole(ctx, ctx.var.isDevMode ? 'user' : 'admin');
        if (user instanceof Response) return user;

        return writePage(ctx, 'admin', {
            message: ctx.req.query('minted') === '1' ? 'coins minted' : undefined,
        });
    });

    app.post('/admin/mint-coins', async (ctx) => {
        const user = requireRole(ctx, ctx.var.isDevMode ? 'user' : 'admin');
        if (user instanceof Response) return user;

        const form = await ctx.req.formData().catch(() => null);
        const username = form?.get('username');
        const amount = Number(form?.get('amount'));
        if (typeof username !== 'string' || !Number.isSafeInteger(amount) || amount <= 0) {
            ctx.status(400);
            return writePage(ctx, 'admin', {
                message: 'enter valid username and amount',
            });
        }

        const target = findUserByUsername(ctx.var, username.trim());
        if (!target) {
            ctx.status(400);
            return writePage(ctx, 'admin', { message: 'user not found' });
        }

        giveCoins(ctx.var, target.id, amount);
        return ctx.redirect('/admin?minted=1');
    });
}
