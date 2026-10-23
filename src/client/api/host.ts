import type { QueueEntry, WaitingQueueRow } from '#src/db/queue.js';
export type { QueueEntry, WaitingQueueRow };

async function errorFrom(res: Response, fallback: string): Promise<Error> {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return new Error(body?.error ?? fallback);
}

export async function callGroups(
    activitySlug: string,
    count: number,
): Promise<{ called: QueueEntry[]; atStation: WaitingQueueRow[]; waitingCount: number }> {
    const res = await fetch('/api/host/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activitySlug, count }),
    });
    if (!res.ok) throw await errorFrom(res, `POST /api/host/call failed: ${res.status}`);
    return res.json();
}

export async function markDone(entryId: number): Promise<void> {
    const res = await fetch('/api/host/done', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId }),
    });
    if (!res.ok) throw await errorFrom(res, `POST /api/host/done failed: ${res.status}`);
}
