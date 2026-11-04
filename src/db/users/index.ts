import { MAX_USERNAME_LENGTH } from '#src/client/constants.js';
import { MwaState } from '#src/state.js';
import { createHash } from 'node:crypto';
import { SQLOutputValue } from 'node:sqlite';
import { queryActiveGamblingSession, queryGamblingInvitations } from '../gambling/index.js';
import { findUserGroup, queryUserGroupInvite } from '../groups/index.js';

export type UserRole = 'admin' | 'host' | 'user';

// Sent to the client over /api/notifications and embedded in page context.
export type Notification =
    | {
          type: 'gambling_invite';
          inviterName: string;
          sessionId: number;
      }
    | {
          type: 'return_to_gambling';
          opponentName: string;
          sessionId: number;
      }
    | {
          type: 'group_invite';
          inviterName: string;
          inviteId: number;
          // target is groupless — accepting creates a new team they own
          createsTeam: boolean;
      };

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

// Self-serve rename from /app's you tab — same charset as deriveUsername, so a
// rename can't produce a name signup never would.
export function updateUsername(
    state: MwaState,
    userId: number,
    raw: string,
): 'updated' | 'taken' | 'invalid' {
    const username = raw.trim().toLowerCase();
    if (username.length > MAX_USERNAME_LENGTH || !/^[a-z0-9_-]+$/.test(username)) {
        return 'invalid';
    }
    const clash = findUserByUsername(state, username);
    if (clash && clash.id !== userId) return 'taken';

    state.prepare(`UPDATE users SET username = ? WHERE id = ?`).run(username, userId);
    return 'updated';
}

// Called by the sessions module when a login link is consumed.
export function markEmailVerified(state: MwaState, userId: number) {
    const markEmailVerifiedQuery = state.prepare(
        `UPDATE users SET email_verified_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE id = ? AND email_verified_at IS NULL`,
    );

    markEmailVerifiedQuery.run(userId);
}

// Pseudonym word pools — every word is ≤6 chars so adjective_noun_NN stays
// comfortably inside the username limit.
const pseudonymAdjectives = [
    'agile',
    'alert',
    'bold',
    'brave',
    'brisk',
    'calm',
    'cheery',
    'clever',
    'cosy',
    'eager',
    'fleet',
    'fuzzy',
    'gentle',
    'glad',
    'happy',
    'jolly',
    'keen',
    'kind',
    'lively',
    'lucky',
    'merry',
    'mighty',
    'nimble',
    'perky',
    'proud',
    'quick',
    'quiet',
    'shiny',
    'smart',
    'sunny',
    'swift',
    'witty',
] as const;

const pseudonymNouns = [
    'badger',
    'beaver',
    'bison',
    'boar',
    'crane',
    'drake',
    'eagle',
    'egret',
    'elk',
    'falcon',
    'finch',
    'fox',
    'gecko',
    'goose',
    'hare',
    'heron',
    'lark',
    'lynx',
    'marten',
    'mink',
    'moose',
    'otter',
    'owl',
    'panda',
    'perch',
    'pike',
    'raven',
    'seal',
    'stork',
    'tiger',
    'viper',
    'wolf',
] as const;

// New accounts are created from an email link, so nobody picks a username at
// signup — derive a stable pseudonym by hashing the email. Deriving from the
// local part would leak the address into every leaderboard; the hash keeps the
// name stable for a given email without revealing it. Users fix it on /app's
// you tab.
export function deriveUsername(state: MwaState, email: string): string {
    const hash = createHash('sha256').update(email).digest();
    const adjective = pseudonymAdjectives[hash[0] % pseudonymAdjectives.length];
    const noun = pseudonymNouns[hash[1] % pseudonymNouns.length];
    const tag = String(hash.readUInt16BE(2) % 100).padStart(2, '0');
    const trimmed = `${adjective}_${noun}_${tag}`;
    let candidate = trimmed;
    let n = 2;
    while (findUserByUsername(state, candidate)) {
        const suffix = `${n++}`;
        candidate = trimmed.slice(0, MAX_USERNAME_LENGTH - suffix.length) + suffix;
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

    const active = queryActiveGamblingSession(state, userId);
    if (active !== null) {
        return {
            type: 'return_to_gambling',
            opponentName: active.opponentName,
            sessionId: active.id,
        };
    }

    const invitations = queryGamblingInvitations(state, userId);
    if (invitations.length > 0) {
        return {
            type: 'gambling_invite',
            inviterName: invitations[0].p1Name,
            sessionId: invitations[0].id,
        };
    }

    const groupInvite = queryUserGroupInvite(state, userId);
    if (groupInvite !== null) {
        return {
            type: 'group_invite',
            inviterName: groupInvite.fromUsername,
            inviteId: groupInvite.id,
            createsTeam: findUserGroup(state, userId) === null,
        };
    }

    return null;
}
