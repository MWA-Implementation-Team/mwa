const subscriptions = new Map<string, Set<SubscriptionImpl>>();

export function publish(channel: string, message: string) {
    // receives only the latest message
    for (const sub of subscriptions.get(channel) ?? []) sub.send(message);
}

export type Subscription = {
    recv(): Promise<string | null>;
    close(): void;
};

export function subscribe(channel: string): Subscription {
    return new SubscriptionImpl(channel);
}

export function sessionChannel(id: number): string {
    return `gambling_session:${id}`;
}

export function notificationsChannel(userId: number): string {
    return `user_notifications:${userId}`;
}

class SubscriptionImpl {
    #channel: string;
    #isClosed = false;
    #message: string | undefined;
    #wake: (() => void) | undefined;

    constructor(channel: string) {
        this.#channel = channel;
        let subs = subscriptions.get(channel);
        if (!subs) subscriptions.set(channel, (subs = new Set()));
        subs.add(this);
    }

    send(message: string) {
        if (this.#isClosed) return;
        this.#message = message;
        this.#wake?.();
        this.#wake = undefined;
    }

    async recv(): Promise<string | null> {
        while (!this.#isClosed) {
            if (this.#message !== undefined) {
                const message = this.#message;
                this.#message = undefined;
                return message;
            }
            await new Promise<void>((resolve) => {
                this.#wake = resolve;
            });
        }
        return null;
    }

    close(): void {
        if (this.#isClosed) return;
        this.#isClosed = true;
        this.#message = undefined;
        const subs = subscriptions.get(this.#channel)!;
        subs.delete(this);
        if (subs.size === 0) subscriptions.delete(this.#channel);
        this.#wake?.();
        this.#wake = undefined;
    }
}
