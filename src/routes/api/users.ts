import { requireApiUser } from '#src/auth.js';
import { queryUserNotification } from '#src/db/users/index.js';
import { notificationsChannel, subscribe } from '#src/pubsub.js';
import { MwaHono } from '#src/state.js';
import { streamSSE } from 'hono/streaming';

export function registerUsersRoutes(app: MwaHono) {
    app.get('/api/notifications', (ctx) => {
        const user = requireApiUser(ctx);
        if (user instanceof Response) return user;

        return streamSSE(ctx, async (stream) => {
            const sub = subscribe(notificationsChannel(user.id));
            try {
                stream.onAbort(() => sub.close());

                // send the current notification, then resend on each poke
                let lastJson: string | undefined;
                while (!stream.aborted) {
                    const json = JSON.stringify(queryUserNotification(ctx.var, user.id));
                    if (json !== lastJson) {
                        lastJson = json;
                        await stream.writeSSE({ data: json });
                    }
                    if ((await sub.recv()) === null) break;
                }
            } finally {
                sub.close();
            }
        });
    });
}
