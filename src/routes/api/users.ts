import { requireApiUser } from '#src/auth.js';
import { cookieSession } from '#src/client/constants.js';
import { findSessionUserId } from '#src/db/sessions/index.js';
import { getCookie } from 'hono/cookie';
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
            const token = getCookie(ctx, cookieSession)!;
            try {
                stream.onAbort(() => sub.close());

                // send the current notification, then resend on each poke
                let lastJson: string | undefined;
                while (!stream.aborted) {
                    if (findSessionUserId(ctx.var, token) !== user.id) break;
                    const json = JSON.stringify(queryUserNotification(ctx.var, user.id));
                    if (json !== lastJson) {
                        lastJson = json;
                        await stream.writeSSE({ data: json });
                    }
                    if ((await sub.recv()) === null) break;
                }
                if (!stream.aborted && findSessionUserId(ctx.var, token) !== user.id) {
                    await stream.writeSSE({ event: 'session-ended', data: 'null' });
                }
            } finally {
                sub.close();
            }
        });
    });
}
