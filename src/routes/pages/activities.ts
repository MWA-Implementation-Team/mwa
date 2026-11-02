import { isActivitySlug } from '#src/client/activities.js';
import { writeErrorPage, writePage } from '#src/pages.js';
import { MwaHono } from '#src/state.js';

// Public pages — the landing feed links here, so no login wall.
export function registerActivitiesRoutes(app: MwaHono) {
    app.get('/activities/:slug', (ctx) => {
        const slug = ctx.req.param('slug');
        if (!isActivitySlug(slug)) return writeErrorPage(ctx, 404);

        return writePage(ctx, 'activity', { slug });
    });
}
