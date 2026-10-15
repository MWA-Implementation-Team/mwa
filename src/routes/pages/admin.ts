import { requireRole } from '#src/auth.js';
import { writePage } from '#src/pages.js';
import { MwaHono } from '#src/state.js';

export function registerAdminRoutes(app: MwaHono) {
    app.get('/admin', async (ctx) => {
        const user = requireRole(ctx, 'admin');
        if (user instanceof Response) return user;

        return writePage(ctx, 'admin', {});
    });
}
