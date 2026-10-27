import { MwaState } from '#src/state.js';
import { SQLOutputValue } from 'node:sqlite';
import { runTransaction } from '../transaction.js';

export const MIN_GROUP_MEMBERS = 2;
export const MAX_GROUP_MEMBERS = 6;
export const MAX_GROUP_NAME_LENGTH = 64;
export const MAX_PHONE_NUMBER_LENGTH = 32;

// Local group type
export type Group = {
    id: number;
    name: string;
    ownerId: number;
    phone_number: string;
    created_at: Date;
};

// Local group member type
export type GroupMember = {
    group_id: number;
    user_id: number;
    joined_at: Date;
};

// Mappers
function mapGroup(row: Record<string, SQLOutputValue>): Group {
    return {
        id: row.id as number,
        name: row.name as string,
        ownerId: row.owner_id as number,
        phone_number: row.phone_number as string,
        created_at: new Date(row.created_at as string),
    };
}

function mapGroupMember(row: Record<string, SQLOutputValue>): GroupMember {
    return {
        group_id: row.group_id as number,
        user_id: row.user_id as number,
        joined_at: new Date(row.joined_at as string),
    };
}

// Actions
export function createGroup(
    state: MwaState,
    name: string,
    ownerId: number,
    phone_number: string,
): Group {
    // Create group and return its info
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
        const row = createGroupQuery.get(name, ownerId, phone_number);
        addMemberQuery.run(row!.id, ownerId);
        return mapGroup(row!);
    });
}

export function findGroupById(state: MwaState, group_id: number): Group | null {
    const getGroupByIdQuery = state.prepare(`
        SELECT id, name, owner_id, phone_number, created_at
        FROM groups
        WHERE id = ?
    `);

    const row = getGroupByIdQuery.get(group_id);
    if (!row?.id) return null;
    return mapGroup(row);
}

export function deleteGroup(state: MwaState, group_id: number, owner_id: number): boolean {
    const deleteGroupQuery = state.prepare(`
        DELETE FROM groups
        WHERE id = ? AND owner_id = ?
    `);

    const result = deleteGroupQuery.run(group_id, owner_id);
    return result.changes > 0;
}

// Get group of user by user id
export function findUserGroup(state: MwaState, user_id: number): Group | null {
    const getUserGroupQuery = state.prepare(`
        SELECT groups.id, groups.name, groups.owner_id, groups.phone_number, groups.created_at
        FROM groups
        JOIN group_members ON groups.id = group_members.group_id
        WHERE group_members.user_id = ?    
    `);

    const row = getUserGroupQuery.get(user_id);
    if (!row?.id) return null;
    return mapGroup(row);
}

export function listUserGroups(state: MwaState, user_id: number): Group[] {
    const getUserGroupsQuery = state.prepare(`
        SELECT DISTINCT groups.id, groups.name, groups.owner_id, groups.phone_number, groups.created_at
        FROM groups
        LEFT JOIN group_members ON groups.id = group_members.group_id
        WHERE groups.owner_id = ? OR group_members.user_id = ?
        ORDER BY groups.created_at DESC
    `);

    const rows = getUserGroupsQuery.all(user_id, user_id);
    return rows.map((row) => mapGroup(row));
}

export function addGroupMember(
    state: MwaState,
    group_id: number,
    user_id: number,
): { success: boolean; error?: string } {
    const getGroupMemberCountQuery = state.prepare(`
        SELECT COUNT(*) as count
        FROM group_members
        WHERE group_id = ?
    `);
    const addMemberQuery = state.prepare(`
        INSERT INTO group_members (group_id, user_id)
        VALUES (?, ?)
    `);

    const row = getGroupMemberCountQuery.get(group_id) as { count: number };

    if (row.count >= MAX_GROUP_MEMBERS) {
        return {
            success: false,
            error: `Group has reached the max limit of ${MAX_GROUP_MEMBERS} members`,
        };
    }

    if (findUserGroup(state, user_id)) {
        return { success: false, error: 'Member is already in a group' };
    }

    try {
        addMemberQuery.run(group_id, user_id);
        return { success: true };
    } catch {
        return { success: false, error: 'Failed to add member' };
    }
}

export function removeGroupMember(
    state: MwaState,
    group_id: number,
    user_id: number,
): { success: boolean; error?: string } {
    const getGroupByIdQuery = state.prepare(`
        SELECT id, name, owner_id, phone_number, created_at
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

    const group = getGroupByIdQuery.get(group_id);
    if (!group) {
        return { success: false, error: 'Group not found' };
    }

    if (group.owner_id === user_id) {
        return { success: false, error: 'Cannot remove the group owner' };
    }

    const row = getGroupMemberCountQuery.get(group_id) as { count: number };

    if (row.count <= MIN_GROUP_MEMBERS) {
        return {
            success: false,
            error: `Cannot remove member. Groups must maintain a minimum of ${MIN_GROUP_MEMBERS} members`,
        };
    }

    removeMemberQuery.run(group_id, user_id);
    return { success: true };
}

export function listGroupMembers(state: MwaState, group_id: number): GroupMember[] {
    const getGroupMembersQuery = state.prepare(`
       SELECT group_id, user_id, joined_at
       FROM group_members
       WHERE group_id = ?
    `);

    const rows = getGroupMembersQuery.all(group_id);
    return rows.map((row) => mapGroupMember(row));
}
