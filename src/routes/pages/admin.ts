import { requireRole, requireUser } from '#src/auth.js';
import { giveCoins } from '#src/db/transactions.js';
import { findUserByUsername } from '#src/db/users.js';
import { writePage } from '#src/pages.js';
import { MwaContext, MwaHono } from '#src/state.js';
import { User } from '#src/db/users.js';

// In dev mode the admin page mints coins for testing, so any signed-in user
// gets in. In production it's admin-only.
function requireAdmin(ctx: MwaContext): User | Response {
    return ctx.var.isDevMode ? requireUser(ctx) : requireRole(ctx, 'admin');
}

export function registerAdminRoutes(app: MwaHono) {
    app.get('/admin', async (ctx) => {
        const user = requireAdmin(ctx);
        if (user instanceof Response) return user;

        return writePage(ctx, 'admin', {
            message: ctx.req.query('minted') === '1' ? 'coins minted' : undefined,
        });
    });

    app.post('/admin/mint-coins', async (ctx) => {
        const user = requireAdmin(ctx);
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
