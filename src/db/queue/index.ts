import { MwaState } from '#src/state.js';
import { registeredActivities } from '#src/client/activities.js';
import { SQLOutputValue } from 'node:sqlite';
import { runTransaction } from '../transaction.js';

export type QueueStatus = 'waiting' | 'left' | 'called';

export type QueueEntry = {
    id: number;
    groupId: number;
    // kept as the ISO string stored in sqlite — same reason as Transaction.createdAt
    joinedAt: string;
    status: QueueStatus;
    closedAt: string | null;
    // status stays 'called' at the station; done_at set = finished there
    doneAt: string | null;
    activitySlug: string | null;
};

export type WaitingQueueRow = QueueEntry & { groupName: string; completedSlugs: string[] };

function mapQueueEntry(row: Record<string, SQLOutputValue>): QueueEntry {
    return {
        id: row.id as number,
        groupId: row.group_id as number,
        joinedAt: row.joined_at as string,
        status: row.status as QueueStatus,
        closedAt: (row.closed_at as string) ?? null,
        doneAt: (row.done_at as string) ?? null,
        activitySlug: (row.activity_slug as string) ?? null,
    };
}

// The queue is a team activity — a group needs at least this many members
// to hold a spot. Groups may exist below it (the owner invites or deletes).
export const QUEUE_MIN_GROUP_SIZE = 2;

export type JoinQueueResult =
    | { type: 'joined'; entry: QueueEntry }
    | { type: 'already_queued' }
    | { type: 'at_station' }
    | { type: 'all_done' }
    | { type: 'too_small' };

// A group holds one spot at a time; rejoining after leaving inserts a
// new row so the old 'left' entry stays in the history.
export function joinQueue(state: MwaState, groupId: number): JoinQueueResult {
    if (getWaitingEntry(state, groupId)) {
        return { type: 'already_queued' };
    }

    const atStationQuery = state.prepare(`
        SELECT 1 FROM queue_entries
        WHERE group_id = ? AND status = 'called' AND done_at IS NULL
    `);
    if (atStationQuery.get(groupId)) {
        return { type: 'at_station' };
    }

    const memberCountQuery = state.prepare(`
        SELECT COUNT(*) AS count
        FROM group_members
        WHERE group_id = ?
    `);
    if ((memberCountQuery.get(groupId)!.count as number) < QUEUE_MIN_GROUP_SIZE) {
        return { type: 'too_small' };
    }

    // a group that finished every registered station is done playing
    const completed = listGroupCompletions(state, groupId);
    const slugs = Object.keys(registeredActivities);
    if (slugs.length > 0 && slugs.every((slug) => completed.includes(slug))) {
        return { type: 'all_done' };
    }

    const joinQuery = state.prepare(`
        INSERT INTO queue_entries (group_id)
        VALUES (?)
        RETURNING id, group_id, joined_at, status, closed_at, done_at, activity_slug
    `);
    return { type: 'joined', entry: mapQueueEntry(joinQuery.get(groupId)!) };
}

export function leaveQueue(state: MwaState, groupId: number): boolean {
    const leaveQuery = state.prepare(`
        UPDATE queue_entries
        SET status = 'left', closed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE group_id = ? AND status = 'waiting'
    `);
    return leaveQuery.run(groupId).changes > 0;
}

export function getWaitingEntry(state: MwaState, groupId: number): QueueEntry | null {
    const query = state.prepare(`
        SELECT id, group_id, joined_at, status, closed_at, done_at, activity_slug
        FROM queue_entries
        WHERE group_id = ? AND status = 'waiting'
    `);
    const row = query.get(groupId);
    return row ? mapQueueEntry(row) : null;
}

// The spot the user's own group is holding, if any — one group per user,
// so at most one waiting entry ever matches.
export function getUserWaitingEntry(state: MwaState, userId: number): QueueEntry | null {
    const query = state.prepare(`
        SELECT queue_entries.id, queue_entries.group_id, queue_entries.joined_at,
               queue_entries.status, queue_entries.closed_at, queue_entries.done_at, queue_entries.activity_slug
        FROM queue_entries
        JOIN group_members ON group_members.group_id = queue_entries.group_id
        WHERE group_members.user_id = ? AND queue_entries.status = 'waiting'
    `);
    const row = query.get(userId);
    return row ? mapQueueEntry(row) : null;
}

// 1-based place in line. ids order the queue — they're monotonic, so a
// rejoined group correctly lands behind everyone already waiting.
export function getQueuePosition(state: MwaState, entryId: number): number | null {
    const selfQuery = state.prepare(`
        SELECT status FROM queue_entries WHERE id = ?
    `);
    if (selfQuery.get(entryId)?.status !== 'waiting') return null;

    const countQuery = state.prepare(`
        SELECT COUNT(*) + 1 AS position
        FROM queue_entries
        WHERE status = 'waiting' AND id < ?
    `);
    return countQuery.get(entryId)!.position as number;
}

// The stations a group finished — distinct slugs from its called-and-done
// queue rows. A completion belongs to the group; disbanding doesn't erase it.
export function listGroupCompletions(state: MwaState, groupId: number): string[] {
    const query = state.prepare(`
        SELECT DISTINCT activity_slug
        FROM queue_entries
        WHERE group_id = ? AND status = 'called' AND done_at IS NOT NULL
          AND activity_slug IS NOT NULL
    `);
    return query.all(groupId).map((row) => row.activity_slug as string);
}

// group_id → completed slugs for every group that finished anything — one
// query so list pages can decorate rows without an N+1.
function listCompletionsByGroup(state: MwaState): Map<number, string[]> {
    const rows = state
        .prepare(
            `SELECT DISTINCT group_id, activity_slug
             FROM queue_entries
             WHERE status = 'called' AND done_at IS NOT NULL AND activity_slug IS NOT NULL`,
        )
        .all();
    const byGroup = new Map<number, string[]>();
    for (const row of rows) {
        const groupId = row.group_id as number;
        if (!byGroup.has(groupId)) byGroup.set(groupId, []);
        byGroup.get(groupId)!.push(row.activity_slug as string);
    }
    return byGroup;
}

// The line from front to back — what a host reads before calling groups.
export function listWaitingQueue(state: MwaState): WaitingQueueRow[] {
    const query = state.prepare(`
        SELECT queue_entries.id, queue_entries.group_id, queue_entries.joined_at,
               queue_entries.status, queue_entries.closed_at, queue_entries.done_at, queue_entries.activity_slug,
               groups.name AS group_name
        FROM queue_entries
        JOIN groups ON groups.id = queue_entries.group_id
        WHERE queue_entries.status = 'waiting'
        ORDER BY queue_entries.id
    `);
    const completions = listCompletionsByGroup(state);
    return query.all().map((row) => ({
        ...mapQueueEntry(row),
        groupName: row.group_name as string,
        completedSlugs: completions.get(row.group_id as number) ?? [],
    }));
}

// A station freed up: take the next `count` groups in line and mark them
// called to `activitySlug`. They stop counting toward queue positions.
export function callNextGroups(state: MwaState, count: number, activitySlug: string): QueueEntry[] {
    // a group that already completed this station keeps its place but is
    // skipped — the station can't credit it twice
    const pickQuery = state.prepare(`
        SELECT id, group_id, joined_at, status, closed_at, done_at, activity_slug
        FROM queue_entries
        WHERE status = 'waiting'
          AND NOT EXISTS (
              SELECT 1 FROM queue_entries d
              WHERE d.group_id = queue_entries.group_id
                AND d.activity_slug = ?
                AND d.status = 'called'
                AND d.done_at IS NOT NULL
          )
        ORDER BY id
        LIMIT ?
    `);
    const markCalledQuery = state.prepare(`
        UPDATE queue_entries
        SET status = 'called', closed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
            activity_slug = ?
        WHERE id = ? AND status = 'waiting'
    `);

    return runTransaction(state.db, () => {
        const picked = pickQuery.all(activitySlug, count).map(mapQueueEntry);
        for (const entry of picked) {
            markCalledQuery.run(activitySlug, entry.id);
            entry.status = 'called';
            entry.activitySlug = activitySlug;
        }
        return picked;
    });
}

// Groups currently at a station — called there and not yet done, oldest
// arrival first. Hosts read this to see who's on the floor.
export function listStationGroups(state: MwaState, activitySlug: string): WaitingQueueRow[] {
    const query = state.prepare(`
        SELECT queue_entries.id, queue_entries.group_id, queue_entries.joined_at,
               queue_entries.status, queue_entries.closed_at, queue_entries.done_at,
               queue_entries.activity_slug, groups.name AS group_name
        FROM queue_entries
        JOIN groups ON groups.id = queue_entries.group_id
        WHERE queue_entries.status = 'called'
          AND queue_entries.done_at IS NULL
          AND queue_entries.activity_slug = ?
        ORDER BY queue_entries.closed_at
    `);
    const completions = listCompletionsByGroup(state);
    return query.all(activitySlug).map((row) => ({
        ...mapQueueEntry(row),
        groupName: row.group_name as string,
        completedSlugs: completions.get(row.group_id as number) ?? [],
    }));
}

// The group finished the activity — releases it from the station list.
// The row stays 'called' with done_at set; points awarding happens
// separately through the scan flow.
export function markEntryDone(state: MwaState, entryId: number): boolean {
    const query = state.prepare(`
        UPDATE queue_entries
        SET done_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id = ? AND status = 'called' AND done_at IS NULL
    `);
    return query.run(entryId).changes > 0;
}
