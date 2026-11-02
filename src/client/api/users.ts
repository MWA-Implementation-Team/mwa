import type { User } from '#src/db/users/index.js';
import { revive, type Serialized } from '#src/client/serialize.js';

export type { User };
export type UserJson = Serialized<User>;

export function reviveUser(user: UserJson): User {
    return revive(user, 'createdAt');
}
