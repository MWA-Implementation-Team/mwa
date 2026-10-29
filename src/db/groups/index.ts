import { MwaState } from '#src/state.js';
import { SQLOutputValue } from 'node:sqlite';
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

export function listUserGroups(state: MwaState, userId: number): Group[] {
    const getUserGroupsQuery = state.prepare(`
        SELECT groups.id, groups.name, groups.owner_id, groups.phone_number, groups.created_at
        FROM groups
        JOIN group_members ON groups.id = group_members.group_id
        WHERE group_members.user_id = ?
        ORDER BY groups.created_at DESC
    `);

    const rows = getUserGroupsQuery.all(userId);
    return rows.map((row) => mapGroup(row));
}

export type AddGroupMemberResult = 'added' | 'group_full' | 'already_in_group';

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
