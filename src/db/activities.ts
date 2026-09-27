import { database } from '#src/state.js';

export type Activity = {
    id: number;
    local_id: string;
    title: string;
    description: string;
};

database.exec(`
CREATE TABLE IF NOT EXISTS "activities" (
	"id" INTEGER NOT NULL,
	"local_id" TEXT NOT NULL UNIQUE,
	"title" TEXT NOT NULL,
	"description" TEXT NOT NULL,
	PRIMARY KEY("id")
);
`);

const listActivitiesQuery = database.prepare(`SELECT * FROM activities ORDER BY id`);

export function listActivities(): Activity[] {
    return listActivitiesQuery.all() as unknown as Activity[];
}
