// One EventSource per browser, not per tab: every tab holding its own
// socket can exhaust the ~6-per-origin HTTP/1.1 connection cap and stall
// page loads. A Web Locks leader owns the connection and reposts events on
// a BroadcastChannel; when that tab closes the lock drops and a follower
// takes over. Without BroadcastChannel/Web Locks the tab connects itself.
export function subscribeSharedSse(
    url: string,
    channelName: string,
    handlers: {
        onmessage(data: string): void;
        onopen?(): void;
        onerror?(): void;
    },
): () => void {
    if (typeof BroadcastChannel === 'undefined' || !navigator.locks) {
        const es = new EventSource(url);
        es.onmessage = (msg) => handlers.onmessage(msg.data as string);
        es.onopen = () => handlers.onopen?.();
        es.onerror = () => handlers.onerror?.();
        return () => es.close();
    }

    const channel = new BroadcastChannel(channelName);
    channel.onmessage = (msg) => {
        const env = msg.data as { type: 'open' | 'message' | 'error'; data?: string };
        if (env.type === 'message') handlers.onmessage(env.data!);
        else if (env.type === 'open') handlers.onopen?.();
        else handlers.onerror?.();
    };

    let updates: EventSource | undefined;
    let cancelled = false;
    void navigator.locks.request(channelName, () => {
        if (cancelled) return;
        updates = new EventSource(url);
        updates.onmessage = (msg) => {
            handlers.onmessage(msg.data as string);
            channel.postMessage({ type: 'message', data: msg.data });
        };
        updates.onopen = () => {
            handlers.onopen?.();
            channel.postMessage({ type: 'open' });
        };
        updates.onerror = () => {
            handlers.onerror?.();
            channel.postMessage({ type: 'error' });
        };
        // never resolve — the lock stays held for the tab's life
        return new Promise<void>(() => {});
    });

    return () => {
        cancelled = true;
        updates?.close();
        channel.close();
    };
}
