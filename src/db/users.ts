import { database } from '#src/state.js';

export type User = {
    id: number;
    username: string;
    email: string;
    balance_current: number;
    lifetime_earned: number;
    type: 'admin' | 'host' | 'user';
    created_at: string;
};

const listUsersQuery = database.prepare(`SELECT * FROM users ORDER BY id`);

export function listUsers(): User[] {
    return listUsersQuery.all() as unknown as User[];
}

const userByUsernameQuery = database.prepare(`SELECT * FROM users WHERE username = ?`);

export function findUserByUsername(username: string): User | null {
    return (userByUsernameQuery.get(username) as User | undefined) ?? null;
}
