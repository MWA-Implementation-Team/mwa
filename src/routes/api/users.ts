import { cookieUsername } from '#src/client/constants.js';
import { listUsers } from '#src/db/users.js';
import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';

export function registerUsersRoutes(app: Hono) {
    // Example JSON list endpoint. Pattern for future endpoints:
    // the query lives in db/<domain>.ts as a prepared statement +
    // typed function; the route handler just checks auth and
    // serializes the result.
    app.get('/api/users', (ctx) => {
        if (!getCookie(ctx, cookieUsername)) {
            return ctx.json({ error: 'unauthorized' }, 401);
        }

        return ctx.json(listUsers());
    });
}
