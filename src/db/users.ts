import { database } from '#src/state.js';
import { SQLOutputValue } from 'node:sqlite';

export type UserRole = 'admin' | 'host' | 'user';

export type User = {
    id: number;
    createdAt: Date;
    email: string;
    username: string;
    role: UserRole;
    emailVerifiedAt: Date | null;
    currentBalance: number;
    lifetimeEarned: number;
};

const selectUserWithBalance = `
SELECT
    users.id,
    created_at,
    email,
    username,
    role,
    email_verified_at,
    COALESCE(SUM(child_transactions.balance_delta), 0) AS current_balance,
    COALESCE(SUM(MAX(child_transactions.balance_delta, 0)), 0) AS lifetime_earned
FROM users
LEFT JOIN child_transactions ON child_transactions.user_id = users.id
`;

const listUsersQuery = database.prepare(`${selectUserWithBalance} GROUP BY users.id`);

export function listUsers(): User[] {
    return listUsersQuery.all().map((row) => mapUser(row));
}

const userByUsernameQuery = database.prepare(
    `${selectUserWithBalance} WHERE username = ? GROUP BY users.id`,
);

export function findUserByUsername(username: string): User | null {
    const row = userByUsernameQuery.get(username);
    return row?.id ? mapUser(row) : null;
}

const userByEmailQuery = database.prepare(
    `${selectUserWithBalance} WHERE email = ? GROUP BY users.id`,
);

export function findUserByEmail(email: string): User | null {
    const row = userByEmailQuery.get(email);
    return row?.id ? mapUser(row) : null;
}

const userByIdQuery = database.prepare(
    `${selectUserWithBalance} WHERE users.id = ? GROUP BY users.id`,
);

export function findUserById(id: number): User | null {
    const row = userByIdQuery.get(id);
    return row?.id ? mapUser(row) : null;
}

const createUserQuery = database.prepare(
    `INSERT INTO users (email, username, role) VALUES (?, ?, 'user')`,
);

// Signup path — always role='user'. Hosts/admins are promoted by SQL, never
// through the app.
export function createUser(email: string, username: string): User {
    const id = Number(createUserQuery.run(email, username).lastInsertRowid);
    return findUserById(id)!;
}

const markEmailVerifiedQuery = database.prepare(
    `UPDATE users SET email_verified_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE id = ? AND email_verified_at IS NULL`,
);

// Called by the sessions module when a login link is consumed.
export function markEmailVerified(userId: number) {
    markEmailVerifiedQuery.run(userId);
}

// New accounts are created from an email link, so nobody picks a username at
// signup — derive one from the email's local part. Users fix it on /app/account.
export function deriveUsername(email: string): string {
    const local = email.split('@')[0].toLowerCase();
    const base = local.replace(/[^a-z0-9_-]/g, '_').replace(/^_+|_+$/g, '') || 'user';
    const trimmed = base.slice(0, 16);
    let candidate = trimmed;
    let n = 2;
    while (findUserByUsername(candidate)) {
        const suffix = `${n++}`;
        candidate = trimmed.slice(0, 16 - suffix.length) + suffix;
    }
    return candidate;
}

function mapUser(row: Record<string, SQLOutputValue>): User {
    return {
        id: row.id as number,
        createdAt: new Date(row.created_at as string),
        email: row.email as string,
        username: row.username as string,
        role: row.role as UserRole,
        emailVerifiedAt: row.email_verified_at ? new Date(row.email_verified_at as string) : null,
        currentBalance: row.current_balance as number,
        lifetimeEarned: row.lifetime_earned as number,
    };
}
