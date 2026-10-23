import type { QueueEntry } from '#src/db/queue.js';
export type { QueueEntry };

async function errorFrom(res: Response, fallback: string): Promise<Error> {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return new Error(body?.error ?? fallback);
}

export async function joinQueue(): Promise<{ entry: QueueEntry; position: number }> {
    const res = await fetch('/api/queue', { method: 'POST' });
    if (!res.ok) throw await errorFrom(res, `POST /api/queue failed: ${res.status}`);
    return res.json();
}

export async function leaveQueue(): Promise<void> {
    const res = await fetch('/api/queue', { method: 'DELETE' });
    if (!res.ok) throw await errorFrom(res, `DELETE /api/queue failed: ${res.status}`);
}
