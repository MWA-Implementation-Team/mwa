import { requireApiUser } from '#src/auth.js';
import { listUsers } from '#src/db/users.js';
import { MwaHono } from '#src/state.js';

export function registerUsersRoutes(app: MwaHono) {
    // Example JSON list endpoint. Pattern for future endpoints:
    // the query lives in db/<domain>.ts as a prepared statement +
    // typed function; the route handler just checks auth and
    // serializes the result.
    app.get('/api/users', (ctx) => {
        const user = requireApiUser(ctx);
        if (user instanceof Response) return user;

        return ctx.json(listUsers(ctx.var));
    });
}
