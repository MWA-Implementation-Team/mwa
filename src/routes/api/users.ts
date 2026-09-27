import { currentUser } from '#src/auth.js';
import { listUsers } from '#src/db/users.js';
import { Hono } from 'hono';

export function registerUsersRoutes(app: Hono) {
    // Example JSON list endpoint. Pattern for future endpoints:
    // the query lives in db/<domain>.ts as a prepared statement +
    // typed function; the route handler just checks auth and
    // serializes the result.
    app.get('/api/users', (ctx) => {
        if (!currentUser(ctx)) {
            return ctx.json({ error: 'unauthorized' }, 401);
        }

        return ctx.json(listUsers());
    });
}
