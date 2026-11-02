import { currentUser } from '#src/auth.js';
import { isActivitySlug } from '#src/client/activities.js';
import { findUserGroup } from '#src/db/groups/index.js';
import { listGroupCompletions } from '#src/db/queue/index.js';
import { writeErrorPage, writePage } from '#src/pages.js';
import { MwaHono } from '#src/state.js';

// Public pages — the landing feed links here, so no login wall.
export function registerActivitiesRoutes(app: MwaHono) {
    app.get('/activities/:slug', (ctx) => {
        const slug = ctx.req.param('slug');
        if (!isActivitySlug(slug)) return writeErrorPage(ctx, 404);

        // completion banner only makes sense for a signed-in player with a team
        const user = currentUser(ctx);
        const group = user ? findUserGroup(ctx.var, user.id) : null;
        const completed = group ? listGroupCompletions(ctx.var, group.id).includes(slug) : null;

        return writePage(ctx, 'activity', { slug, completed });
    });
}
