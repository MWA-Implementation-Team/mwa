import type { User } from '#src/db/users/index.js';
// ^ type-only import: erased at compile time, so the browser never
// loads src/db/users/index.ts (it opens the database on import). Keeps one
// source of truth for the API response shape.

import { revive, type Serialized } from '#src/client/serialize.js';

export type { User };
export type UserJson = Serialized<User>;

export function reviveUser(user: UserJson): User {
    return revive(user, 'createdAt');
}
