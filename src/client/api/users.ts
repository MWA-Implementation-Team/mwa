import type { User } from '#src/db/users.js';
// ^ type-only import: erased at compile time, so the browser never
// loads src/db/users.ts (it opens the database on import). Keeps one
// source of truth for the API response shape.

import { revive, type Serialized } from '#src/client/serialize.js';

export type { User };
export type UserJson = Serialized<User>;

export function reviveUser(user: UserJson): User {
    return revive(user, 'createdAt');
}

// Pattern for calling protected endpoints from pages: plain
// same-origin fetch sends cookies automatically
// (default credentials: 'same-origin'), so the mwa-session
// auth cookie is attached with no extra config.
export async function fetchUsers(): Promise<User[]> {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error(`GET /api/users failed: ${res.status}`);
    return (await res.json()).map(reviveUser);
}
