import { currentUser } from '#src/auth.js';
import { listUsers } from '#src/db/users.js';
import { writePage } from '#src/pages.js';
import { Hono } from 'hono';

export function registerLandingRoutes(app: Hono) {
    app.get('/', (ctx) => {
        // SSR data loading: the route reads the DB and passes data
        // as page props — they go into both the rendered HTML and
        // the serialized ssr-data, so hydration renders identically.
        const users = currentUser(ctx) ? listUsers() : null;
        return writePage(ctx, 'landing', { users });
    });
}
