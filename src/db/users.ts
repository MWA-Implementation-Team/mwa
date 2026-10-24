import { MwaState } from '#src/state.js';
import { SQLOutputValue } from 'node:sqlite';
import { queryGamblingInvitations } from './gambling.js';
import { Notification } from '#src/client/context.js';

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

export function listUsers(state: MwaState): User[] {
    const listUsersQuery = state.prepare(`${selectUserWithBalance} GROUP BY users.id`);

    return listUsersQuery.all().map((row) => mapUser(row));
}

export function findUserByUsername(state: MwaState, username: string): User | null {
    const userByUsernameQuery = state.prepare(
        `${selectUserWithBalance} WHERE username = ? GROUP BY users.id`,
    );

    const row = userByUsernameQuery.get(username);
    return row?.id ? mapUser(row) : null;
}

export function findUserByEmail(state: MwaState, email: string): User | null {
    const userByEmailQuery = state.prepare(
        `${selectUserWithBalance} WHERE email = ? GROUP BY users.id`,
    );

    const row = userByEmailQuery.get(email);
    return row?.id ? mapUser(row) : null;
}

export function findUserById(state: MwaState, id: number): User | null {
    const userByIdQuery = state.prepare(
        `${selectUserWithBalance} WHERE users.id = ? GROUP BY users.id`,
    );

    const row = userByIdQuery.get(id);
    return row?.id ? mapUser(row) : null;
}

// Signup path — always role='user'. Hosts/admins are promoted by SQL, never
// through the app.
export function createUser(state: MwaState, email: string, username: string): User {
    const createUserQuery = state.prepare(
        `INSERT INTO users (email, username, role) VALUES (?, ?, 'user')`,
    );

    const id = Number(createUserQuery.run(email, username).lastInsertRowid);
    return findUserById(state, id)!;
}

// Called by the sessions module when a login link is consumed.
export function markEmailVerified(state: MwaState, userId: number) {
    const markEmailVerifiedQuery = state.prepare(
        `UPDATE users SET email_verified_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE id = ? AND email_verified_at IS NULL`,
    );

    markEmailVerifiedQuery.run(userId);
}

// New accounts are created from an email link, so nobody picks a username at
// signup — derive one from the email's local part. Users fix it on /app/account.
export function deriveUsername(state: MwaState, email: string): string {
    const local = email.split('@')[0].toLowerCase();
    const base = local.replace(/[^a-z0-9_-]/g, '_').replace(/^_+|_+$/g, '') || 'user';
    const trimmed = base.slice(0, 16);
    let candidate = trimmed;
    let n = 2;
    while (findUserByUsername(state, candidate)) {
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

export function queryUserNotification(state: MwaState, userId?: number): Notification | null {
    if (userId === undefined) return null;

    let notification: Notification | null = null;

    const invitations = queryGamblingInvitations(state, userId);
    if (invitations.length > 0) {
        notification = {
            type: 'gambling_invite',
            inviterName: invitations[0].p1Name,
            sessionId: invitations[0].id,
        };
    }

    return notification;
}
