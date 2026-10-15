// Helpers for values that cross JSON boundaries (fetch responses, SSR
// page props, boot data). JSON has no Date, so date fields arrive as
// strings. Serialized<T> types that wire shape honestly, serialize()
// produces it explicitly, and revive() restores the Dates on the
// other side.
export type Serialized<T> = { [K in keyof T]: T[K] extends Date ? string : T[K] };

export type DateKeys<T> = { [K in keyof T]: T[K] extends Date ? K : never }[keyof T];

export function serialize<T>(obj: T): Serialized<T> {
    const out = { ...obj } as Record<string, unknown>;
    for (const key in out) {
        const value = out[key];
        if (value instanceof Date) {
            out[key] = value.toJSON();
        }
    }
    return out as Serialized<T>;
}

export function revive<T>(obj: Serialized<T>, ...keys: DateKeys<T>[]): T {
    const out = { ...obj } as Record<string, unknown>;
    for (const key of keys) {
        out[key as string] = new Date(out[key as string] as string);
    }
    return out as T;
}
