import { database } from '#src/state.js';
import { SQLOutputValue } from 'node:sqlite';

export type UserRole = 'admin' | 'host' | 'user';

export type User = {
    id: string;
    createdAt: Date;
    email: string;
    username: string;
    role: UserRole;
    currentBalance: number;
    lifetimeEarned: number;
};

const listUsersQuery = database.prepare(`
SELECT
    users.id,
    created_at,
    email,
    username,
    role,
    COALESCE(SUM(child_transactions.balance_delta), 0) AS current_balance,
    COALESCE(SUM(MAX(child_transactions.balance_delta, 0)), 0) AS lifetime_earned
FROM users
LEFT JOIN child_transactions ON child_transactions.user_id = users.id
GROUP BY users.id
`);

export function listUsers(): User[] {
    return listUsersQuery.all().map((row) => mapUser(row));
}

const userByUsernameQuery = database.prepare(`
SELECT
    users.id,
    created_at,
    email,
    username,
    role,
    COALESCE(SUM(child_transactions.balance_delta), 0) AS current_balance,
    COALESCE(SUM(MAX(child_transactions.balance_delta, 0)), 0) AS lifetime_earned
FROM users
LEFT JOIN child_transactions ON child_transactions.user_id = users.id
WHERE username = ?
GROUP BY users.id
`);

export function findUserByUsername(username: string): User | null {
    const row = userByUsernameQuery.get(username);
    if (!row?.id) return null;
    return mapUser(row);
}

function mapUser(row: Record<string, SQLOutputValue>): User {
    return {
        id: row.id as string,
        createdAt: new Date(row.created_at as string),
        email: row.email as string,
        username: row.username as string,
        role: row.role as UserRole,
        currentBalance: row.current_balance as number,
        lifetimeEarned: row.lifetime_earned as number,
    };
}
