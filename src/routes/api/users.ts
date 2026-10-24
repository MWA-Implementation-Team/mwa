import { requireApiUser } from '#src/auth.js';
import { listUsers, queryUserNotification } from '#src/db/users.js';
import { notificationsChannel, subscribe } from '#src/pubsub.js';
import { MwaHono } from '#src/state.js';
import { streamSSE } from 'hono/streaming';

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

    app.get('/api/notifications', (ctx) => {
        const user = requireApiUser(ctx);
        if (user instanceof Response) return user;

        return streamSSE(ctx, async (stream) => {
            const sub = subscribe(notificationsChannel(user.id));
            stream.onAbort(() => sub.close());

            let lastJson = '';
            while (!stream.aborted) {
                if (lastJson !== '') {
                    const signal = await sub.recv();
                    if (signal === null) break;
                }

                const notification = queryUserNotification(ctx.var, user.id);
                const json = JSON.stringify(notification);
                if (lastJson === json) continue;
                lastJson = json;

                await stream.writeSSE({
                    data: json,
                });
            }
        })
    });
}
