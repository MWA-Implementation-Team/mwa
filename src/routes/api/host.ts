import { requireApiRole } from '#src/auth.js';
import { isActivitySlug } from '#src/client/activities.js';
import {
    callNextGroups,
    listStationGroups,
    listWaitingQueue,
    markEntryDone,
} from '#src/db/queue.js';
import { MwaContext, MwaHono } from '#src/state.js';

const MAX_CALL_COUNT = 20;

async function readJsonBody(ctx: MwaContext) {
    try {
        const body = await ctx.req.json();
        return (body ?? {}) as Record<string, unknown>;
    } catch {
        return null;
    }
}

function stationSnapshot(ctx: MwaContext, activitySlug: string) {
    return {
        atStation: listStationGroups(ctx.var, activitySlug),
        waitingCount: listWaitingQueue(ctx.var).length,
    };
}

export function registerHostRoutes(app: MwaHono) {
    // Pull the next N waiting groups to a station — FIFO, hosts never
    // pick specific groups. Returns the refreshed station view.
    app.post('/api/host/call', async (ctx) => {
        const user = requireApiRole(ctx, 'host', 'admin');
        if (user instanceof Response) return user;

        const body = await readJsonBody(ctx);
        if (!body) {
            return ctx.json({ error: 'invalid json body' }, 400);
        }

        const { activitySlug, count } = body;
        if (typeof activitySlug !== 'string' || !isActivitySlug(activitySlug)) {
            return ctx.json({ error: 'invalid activitySlug' }, 400);
        }
        if (typeof count !== 'number' || !Number.isInteger(count) || count < 1) {
            return ctx.json({ error: 'invalid count' }, 400);
        }

        const called = callNextGroups(ctx.var, Math.min(count, MAX_CALL_COUNT), activitySlug);
        return ctx.json({ called, ...stationSnapshot(ctx, activitySlug) });
    });

    // A group finished the activity — release it from the station list.
    app.post('/api/host/done', async (ctx) => {
        const user = requireApiRole(ctx, 'host', 'admin');
        if (user instanceof Response) return user;

        const body = await readJsonBody(ctx);
        if (!body) {
            return ctx.json({ error: 'invalid json body' }, 400);
        }

        const { entryId } = body;
        if (typeof entryId !== 'number' || !Number.isInteger(entryId)) {
            return ctx.json({ error: 'invalid entryId' }, 400);
        }

        if (!markEntryDone(ctx.var, entryId)) {
            return ctx.json({ error: 'entry is not at a station' }, 404);
        }

        return ctx.json({ success: true });
    });
}
