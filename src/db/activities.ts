import { database } from '#src/state.js';
import { registeredActivities } from '#src/client/activities.js';

export type ActivityRow = {
    slug: string;
    createdAt: Date;
};

const insertActivityQuery = database.prepare(`
INSERT OR IGNORE INTO activities (slug) VALUES (?)
`);

const listActivitiesQuery = database.prepare(`
SELECT slug, created_at FROM activities ORDER BY created_at
`);

// The registry (src/client/activities.ts) is the source of truth; this
// table exists so other rows (queues, badges) can foreign-key a real
// slug. Slugs are inserted, never deleted — a removed registry entry
// keeps its row so existing references stay valid.
export function syncActivities() {
    for (const slug of Object.keys(registeredActivities)) {
        insertActivityQuery.run(slug);
    }
}

export function listActivities(): ActivityRow[] {
    return listActivitiesQuery.all().map((row) => {
        return {
            slug: row.slug as string,
            createdAt: new Date(row.created_at as string),
        };
    });
}
