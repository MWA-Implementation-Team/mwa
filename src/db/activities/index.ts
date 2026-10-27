import { MwaState } from '#src/state.js';
import { registeredActivities } from '#src/client/activities.js';

export type ActivityRow = {
    slug: string;
    createdAt: Date;
};

// The registry (src/client/activities.ts) is the source of truth; this
// table exists so other rows (queues, badges) can foreign-key a real
// slug. Slugs are inserted, never deleted — a removed registry entry
// keeps its row so existing references stay valid.
export function syncActivities(state: MwaState) {
    const insert = state.prepare(`
    INSERT OR IGNORE INTO activities (slug) VALUES (?)
    `);

    for (const slug of Object.keys(registeredActivities)) {
        insert.run(slug);
    }
}

export function listActivities(state: MwaState): ActivityRow[] {
    const query = state.prepare(`
    SELECT slug, created_at FROM activities ORDER BY created_at
    `);

    return query.all().map((row) => {
        return {
            slug: row.slug as string,
            createdAt: new Date(row.created_at as string),
        };
    });
}
