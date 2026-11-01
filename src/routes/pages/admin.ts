import { requireRole, requireUser } from '#src/auth.js';
import { giveCoins } from '#src/db/transactions/index.js';
import { findUserByUsername } from '#src/db/users/index.js';
import { createSystemQrCode, listSystemQrCodes } from '#src/db/systemqr/index.js';
import { writePage } from '#src/pages.js';
import { MwaContext, MwaHono } from '#src/state.js';
import { User } from '#src/db/users/index.js';
import { renderSVG } from 'uqr';

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
            qrCreated: ctx.req.query('qrCreated') === '1',
            qrError: ctx.req.query('qrError') === '1',
            qrCodes: listSystemQrCodes(ctx.var).map((qr) => {
                const url = new URL(`/app/qr/${qr.secret}`, ctx.req.url).toString();
                return { ...qr, url, svg: renderSVG(url) };
            }),
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
                qrCodes: listSystemQrCodes(ctx.var).map((qr) => {
                    const url = new URL(`/app/qr/${qr.secret}`, ctx.req.url).toString();
                    return { ...qr, url, svg: renderSVG(url) };
                }),
            });
        }

        const target = findUserByUsername(ctx.var, username.trim());
        if (!target) {
            ctx.status(400);
            return writePage(ctx, 'admin', {
                message: 'user not found',
                qrCodes: listSystemQrCodes(ctx.var).map((qr) => {
                    const url = new URL(`/app/qr/${qr.secret}`, ctx.req.url).toString();
                    return { ...qr, url, svg: renderSVG(url) };
                }),
            });
        }

        giveCoins(ctx.var, target.id, amount);
        return ctx.redirect('/admin?minted=1');
    });

    app.post('/admin/create-qr', async (ctx) => {
        const user = requireAdmin(ctx);
        if (user instanceof Response) return user;

        const form = await ctx.req.formData().catch(() => null);
        const amount = Number(form?.get('amount'));
        const maxUses = Number(form?.get('max_uses'));
        if (!Number.isSafeInteger(amount) || amount <= 0) {
            return ctx.redirect('/admin?qrError=1', 303);
        }
        if (!Number.isSafeInteger(maxUses) || maxUses <= 0) {
            return ctx.redirect('/admin?qrError=1', 303);
        }

        const message = form?.get('message');
        const messageText =
            typeof message === 'string' && message.trim() ? message.trim().slice(0, 200) : null;

        createSystemQrCode(ctx.var, amount, maxUses, messageText);
        return ctx.redirect('/admin?qrCreated=1', 303);
    });
}
