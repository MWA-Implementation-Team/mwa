const subscriptions = new Map<string, SubscriptionImpl[]>();

export function publish(channel: string, message: string) {
    for (const sub of subscriptions.get(channel) ?? []) {
        sub.queue.push(message);
        sub.nextResolve?.();
        sub.nextPromise = undefined;
        sub.nextResolve = undefined;
    }
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
    queue: string[] = [];
    nextPromise: Promise<void> | undefined;
    nextResolve: (() => void) | undefined;

    constructor(channel: string) {
        this.#channel = channel;
        const subs = subscriptions.get(channel);
        if (subs) {
            subs.push(this);
        } else {
            subscriptions.set(channel, [this]);
        }
    }

    async recv(): Promise<string | null> {
        while (true) {
            if (this.#isClosed) return null;

            const first = this.queue.shift();
            if (first !== undefined) {
                return first;
            }

            if (!this.nextPromise) {
                this.nextPromise = new Promise<void>((res) => {
                    this.nextResolve = res;
                });
            }
            await this.nextPromise;
        }
    }

    close(): void {
        if (this.#isClosed) return;
        this.#isClosed = true;

        const subs = subscriptions.get(this.#channel)!;
        subs.splice(subs.indexOf(this), 1);
        if (subs.length === 0) {
            subscriptions.delete(this.#channel);
        }

        this.nextResolve?.();
    }
}
