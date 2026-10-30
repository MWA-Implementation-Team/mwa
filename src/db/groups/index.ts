import { MwaState } from '#src/state.js';
import { SQLOutputValue } from 'node:sqlite';
import { randomBytes } from 'node:crypto';
import { runTransaction } from '../transaction.js';

export const MIN_GROUP_MEMBERS = 2;
export const MAX_GROUP_MEMBERS = 6;
export const MAX_GROUP_NAME_LENGTH = 64;
export const MAX_PHONE_NUMBER_LENGTH = 32;

export type Group = {
    id: number;
    name: string;
    ownerId: number;
    phoneNumber: string;
    createdAt: Date;
};

export type GroupMember = {
    groupId: number;
    userId: number;
    joinedAt: Date;
};

function mapGroup(row: Record<string, SQLOutputValue>): Group {
    return {
        id: row.id as number,
        name: row.name as string,
        ownerId: row.owner_id as number,
        phoneNumber: row.phone_number as string,
        createdAt: new Date(row.created_at as string),
    };
}

function mapGroupMember(row: Record<string, SQLOutputValue>): GroupMember {
    return {
        groupId: row.group_id as number,
        userId: row.user_id as number,
        joinedAt: new Date(row.joined_at as string),
    };
}

// The owner joins as a member in the same transaction — that's what keeps
// "owner is always a member" true for every other query in this module.
export function createGroup(
    state: MwaState,
    name: string,
    ownerId: number,
    phoneNumber: string,
): Group {
    const createGroupQuery = state.prepare(`
        INSERT INTO groups (name, owner_id, phone_number)
        VALUES (?, ?, ?)
        RETURNING id, name, owner_id, phone_number, created_at
    `);
    const addMemberQuery = state.prepare(`
        INSERT INTO group_members (group_id, user_id)
        VALUES (?, ?)
    `);

    return runTransaction(state.db, () => {
        const row = createGroupQuery.get(name, ownerId, phoneNumber);
        addMemberQuery.run(row!.id, ownerId);
        return mapGroup(row!);
    });
}

export function findGroupById(state: MwaState, groupId: number): Group | null {
    const getGroupByIdQuery = state.prepare(`
        SELECT id, name, owner_id, phone_number, created_at
        FROM groups
        WHERE id = ?
    `);

    const row = getGroupByIdQuery.get(groupId);
    if (!row?.id) return null;
    return mapGroup(row);
}

export function deleteGroup(state: MwaState, groupId: number, ownerId: number): boolean {
    const deleteGroupQuery = state.prepare(`
        DELETE FROM groups
        WHERE id = ? AND owner_id = ?
    `);

    const result = deleteGroupQuery.run(groupId, ownerId);
    return result.changes > 0;
}

// A user belongs to at most one group — group_members.user_id is UNIQUE.
export function findUserGroup(state: MwaState, userId: number): Group | null {
    const getUserGroupQuery = state.prepare(`
        SELECT groups.id, groups.name, groups.owner_id, groups.phone_number, groups.created_at
        FROM groups
        JOIN group_members ON groups.id = group_members.group_id
        WHERE group_members.user_id = ?
    `);

    const row = getUserGroupQuery.get(userId);
    if (!row?.id) return null;
    return mapGroup(row);
}

export type AddGroupMemberResult = 'added' | 'group_full' | 'already_in_group';

export type GroupInvite = {
    id: number;
    fromUserId: number;
    toUserId: number;
    fromUsername: string;
};

function mapGroupInvite(row: Record<string, SQLOutputValue>): GroupInvite {
    return {
        id: row.id as number,
        fromUserId: row.from_user_id as number,
        toUserId: row.to_user_id as number,
        fromUsername: row.from_username as string,
    };
}

const selectInvite = `
SELECT group_invites.id, from_user_id, to_user_id, users.username AS from_username
FROM group_invites
JOIN users ON users.id = group_invites.from_user_id
`;

// A groupless user's request to team up — UNIQUE(from, to) makes a repeat
// request a no-op rather than a second pending invite.
export function createGroupInvite(
    state: MwaState,
    fromUserId: number,
    toUserId: number,
): 'created' | 'duplicate' {
    const createInviteQuery = state.prepare(`
        INSERT INTO group_invites (from_user_id, to_user_id)
        VALUES (?, ?)
    `);

    try {
        createInviteQuery.run(fromUserId, toUserId);
        return 'created';
    } catch (error) {
        if (error instanceof Error && error.message.includes('UNIQUE')) {
            return 'duplicate';
        }
        throw error;
    }
}

export function findGroupInviteById(state: MwaState, inviteId: number): GroupInvite | null {
    const row = state.prepare(`${selectInvite} WHERE group_invites.id = ?`).get(inviteId);
    return row?.id ? mapGroupInvite(row) : null;
}

// Oldest pending invite addressed to the user — feeds the notification modal.
export function queryUserGroupInvite(state: MwaState, userId: number): GroupInvite | null {
    const row = state
        .prepare(`${selectInvite} WHERE to_user_id = ? ORDER BY group_invites.id`)
        .get(userId);
    return row?.id ? mapGroupInvite(row) : null;
}

// Only the recipient can reject — the row carries no state, deleting is the
// whole answer.
export function deleteGroupInvite(state: MwaState, inviteId: number, toUserId: number): boolean {
    const result = state
        .prepare(`DELETE FROM group_invites WHERE id = ? AND to_user_id = ?`)
        .run(inviteId, toUserId);
    return result.changes > 0;
}

// groups.name is UNIQUE — auto-created groups get a random placeholder the
// owner renames from the home table.
function randomGroupName(): string {
    return `team-${randomBytes(3).toString('hex')}`;
}

export type AcceptGroupInviteResult = 'accepted' | 'not_found' | 'forbidden' | 'grouped' | 'full';

// The requester wants into the accepter's team: if the accepter already has
// one the requester joins it; if not, a group is created on the spot —
// the accepter owns it, name is random and phone empty until the owner edits
// them from the home table.
export function acceptGroupInvite(
    state: MwaState,
    inviteId: number,
    accepterId: number,
): AcceptGroupInviteResult {
    const invite = findGroupInviteById(state, inviteId);
    if (!invite) return 'not_found';
    if (invite.toUserId !== accepterId) return 'forbidden';

    const deleteInviteQuery = state.prepare(`DELETE FROM group_invites WHERE id = ?`);

    // The requester may have grouped since the request — drop the stale
    // invite. The accepter's own group is fine: the requester joins it.
    if (findUserGroup(state, invite.fromUserId)) {
        deleteInviteQuery.run(inviteId);
        return 'grouped';
    }

    const existing = findUserGroup(state, accepterId);
    if (existing) {
        return runTransaction(state.db, () => {
            const res = addGroupMember(state, existing.id, invite.fromUserId);
            if (res === 'added') {
                deleteInviteQuery.run(inviteId);
                return 'accepted';
            }
            deleteInviteQuery.run(inviteId);
            return res === 'group_full' ? 'full' : 'grouped';
        });
    }

    const createGroupQuery = state.prepare(`
        INSERT INTO groups (name, owner_id, phone_number)
        VALUES (?, ?, '')
        RETURNING id
    `);
    const addMemberQuery = state.prepare(`
        INSERT INTO group_members (group_id, user_id)
        VALUES (?, ?)
    `);

    return runTransaction(state.db, () => {
        let groupId: number | null = null;
        for (let attempt = 0; attempt < 5 && groupId === null; attempt++) {
            try {
                groupId = createGroupQuery.get(randomGroupName(), accepterId)!.id as number;
            } catch (error) {
                if (!(error instanceof Error && error.message.includes('UNIQUE'))) throw error;
            }
        }
        if (groupId === null) throw new Error('could not generate a unique group name');

        addMemberQuery.run(groupId, accepterId);
        addMemberQuery.run(groupId, invite.fromUserId);
        deleteInviteQuery.run(inviteId);
        return 'accepted';
    });
}

// Name/phone edits from the home table's dialog — owner only, so a member
// can't hijack the group's public identity.
export function updateGroup(
    state: MwaState,
    groupId: number,
    ownerId: number,
    name: string,
    phoneNumber: string,
): 'updated' | 'taken' | 'forbidden' {
    try {
        const result = state
            .prepare(`UPDATE groups SET name = ?, phone_number = ? WHERE id = ? AND owner_id = ?`)
            .run(name, phoneNumber, groupId, ownerId);
        return result.changes > 0 ? 'updated' : 'forbidden';
    } catch (error) {
        if (error instanceof Error && error.message.includes('UNIQUE')) return 'taken';
        throw error;
    }
}

export function addGroupMember(
    state: MwaState,
    groupId: number,
    userId: number,
): AddGroupMemberResult {
    const getGroupMemberCountQuery = state.prepare(`
        SELECT COUNT(*) as count
        FROM group_members
        WHERE group_id = ?
    `);
    const addMemberQuery = state.prepare(`
        INSERT INTO group_members (group_id, user_id)
        VALUES (?, ?)
    `);

    const count = getGroupMemberCountQuery.get(groupId)!.count as number;

    if (count >= MAX_GROUP_MEMBERS) {
        return 'group_full';
    }

    if (findUserGroup(state, userId)) {
        return 'already_in_group';
    }

    try {
        addMemberQuery.run(groupId, userId);
        return 'added';
    } catch (error) {
        // user_id is UNIQUE — the only expected failure is a duplicate member
        if (error instanceof Error && error.message.includes('UNIQUE')) {
            return 'already_in_group';
        }
        throw error;
    }
}

export type RemoveGroupMemberResult = 'removed' | 'group_not_found' | 'is_owner' | 'below_minimum';

export function removeGroupMember(
    state: MwaState,
    groupId: number,
    userId: number,
): RemoveGroupMemberResult {
    const getGroupByIdQuery = state.prepare(`
        SELECT id, owner_id
        FROM groups
        WHERE id = ?
    `);
    const getGroupMemberCountQuery = state.prepare(`
        SELECT COUNT(*) as count
        FROM group_members
        WHERE group_id = ?
    `);
    const removeMemberQuery = state.prepare(`
       DELETE FROM group_members
       WHERE group_id = ? AND user_id = ?
    `);

    const group = getGroupByIdQuery.get(groupId);
    if (!group) {
        return 'group_not_found';
    }

    // The owner is a member like any other but can never be removed —
    // deleting the group is the only way out for them.
    if (group.owner_id === userId) {
        return 'is_owner';
    }

    const count = getGroupMemberCountQuery.get(groupId)!.count as number;

    if (count <= MIN_GROUP_MEMBERS) {
        return 'below_minimum';
    }

    removeMemberQuery.run(groupId, userId);
    return 'removed';
}

export type GroupMemberInfo = { userId: number; username: string };

// Member ids joined to usernames — for display lists where raw
// GroupMember rows would force a lookup per member.
export function listGroupMemberInfos(state: MwaState, groupId: number): GroupMemberInfo[] {
    const getMemberInfosQuery = state.prepare(`
       SELECT group_members.user_id, users.username
       FROM group_members
       JOIN users ON users.id = group_members.user_id
       WHERE group_members.group_id = ?
       ORDER BY group_members.joined_at
    `);

    return getMemberInfosQuery.all(groupId).map((row) => ({
        userId: row.user_id as number,
        username: row.username as string,
    }));
}

export function listGroupMembers(state: MwaState, groupId: number): GroupMember[] {
    const getGroupMembersQuery = state.prepare(`
       SELECT group_id, user_id, joined_at
       FROM group_members
       WHERE group_id = ?
    `);

    const rows = getGroupMembersQuery.all(groupId);
    return rows.map((row) => mapGroupMember(row));
}
