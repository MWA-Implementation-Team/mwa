import { requireRole } from '#src/auth.js';
import { writePage } from '#src/pages.js';
import { Hono } from 'hono';

export function registerAdminRoutes(app: Hono) {
    app.get('/admin', async (ctx) => {
        const user = requireRole(ctx, 'admin');
        if (user instanceof Response) return user;

        return writePage(ctx, 'admin', {});
    });
}
