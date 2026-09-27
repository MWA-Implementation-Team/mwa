import { database } from '#src/state.js';

export type Activity = {
    id: number;
    local_id: string;
    title: string;
    description: string;
};

const listActivitiesQuery = database.prepare(`SELECT * FROM activities ORDER BY id`);

export function listActivities(): Activity[] {
    return listActivitiesQuery.all() as unknown as Activity[];
}
