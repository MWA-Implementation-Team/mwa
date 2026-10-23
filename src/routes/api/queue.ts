import { requireApiUser } from '#src/auth.js';
import { findUserGroup } from '#src/db/groups.js';
import { getQueuePosition, joinQueue, leaveQueue } from '#src/db/queue.js';
import { MwaHono } from '#src/state.js';

export function registerQueueRoutes(app: MwaHono) {
    // Join the event-wide queue with the caller's group — any member can
    // put the group in line.
    app.post('/api/queue', (ctx) => {
        const user = requireApiUser(ctx);
        if (user instanceof Response) return user;

        const group = findUserGroup(ctx.var, user.id);
        if (!group) {
            return ctx.json({ error: 'you are not in a group' }, 409);
        }

        const result = joinQueue(ctx.var, group.id);
        if (!result.success) {
            return ctx.json({ error: result.error }, 409);
        }

        return ctx.json(
            { entry: result.entry, position: getQueuePosition(ctx.var, result.entry!.id) },
            201,
        );
    });

    // Leaving is always allowed and keeps history — the entry is marked
    // 'left', not deleted.
    app.delete('/api/queue', (ctx) => {
        const user = requireApiUser(ctx);
        if (user instanceof Response) return user;

        const group = findUserGroup(ctx.var, user.id);
        if (!group || !leaveQueue(ctx.var, group.id)) {
            return ctx.json({ error: 'your group is not in the queue' }, 404);
        }

        return ctx.json({ success: true });
    });
}
