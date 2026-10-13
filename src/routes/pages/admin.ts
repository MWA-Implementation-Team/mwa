import { currentUser } from '#src/auth.js';
import { writeErrorPage, writePage } from '#src/pages.js';
import { goLogin } from '#src/routes/pages/app.js';
import { Hono } from 'hono';

export function registerAdminRoutes(app: Hono) {
    app.get('/admin', async (ctx) => {
        const user = currentUser(ctx);
        if (!user) return goLogin(ctx);
        if (user.role !== 'admin') return writeErrorPage(ctx, 403);

        return writePage(ctx, 'admin', {});
    });
}
