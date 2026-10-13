import { database } from "#src/state.js";
import { SQLOutputValue } from "node:sqlite";

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

// Create group and return its info
const createGroupQuery = database.prepare(`
    INSERT INTO groups (name, owner_id, phone_number)
    VALUES (?, ?, ?)
    RETURNING id, name, owner_id, phone_number, created_at
`);

// Get group by its id
const getGroupByIdQuery = database.prepare(`
    SELECT id, name, owner_id, phone_number, created_at
    FROM groups
    WHERE id = ?
`);

const deleteGroupQuery = database.prepare(`
    DELETE FROM groups
    WHERE id = ? AND owner_id = ?
`);

// Get group of user by user id
const getUserGroupQuery = database.prepare(`
    SELECT *
    FROM groups
    JOIN group_members ON groups.id = group_members.group_id
    WHERE group_members.user_id = ?    
`);

// Get user groups
const getUserGroupsQuery = database.prepare(`
    SELECT DISTINCT groups.id, groups.name, groups.owner_id, groups.phone_number, groups.created_at
    FROM groups
    LEFT JOIN group_members ON groups.id = group_members.group_id
    WHERE groups.owner_id = ? OR group_members.user_id = ?
    ORDER BY groups.created_at DESC
`);

// Get current group member count (Fixed trailing comma!)
const getGroupMemberCountQuery = database.prepare(`
    SELECT COUNT(*) as count
    FROM group_members
    WHERE group_id = ?
`);

// Add member to group
const addMemberQuery = database.prepare(`
    INSERT INTO group_members (group_id, user_id)
    VALUES (?, ?)
`);

// Remove member
const removeMemberQuery = database.prepare(`
   DELETE FROM group_members
   WHERE group_id = ? AND user_id = ? 
`);

// Get members of group
const getGroupMembersQuery = database.prepare(`
   SELECT *
   FROM group_members
   WHERE group_id = ?
`);

// Mappers
function mapGroup(row: Record<string, SQLOutputValue>): Group {
    return {
        id: row.id as number,
        name: row.name as string,
        ownerId: row.owner_id as number,
        phone_number: row.phone_number as string,
        created_at: new Date(row.created_at as string)
    };
}

function mapGroupMember(row: Record<string, SQLOutputValue>): GroupMember {
    return {
        group_id: row.group_id as number,
        user_id: row.user_id as number,
        joined_at: new Date(row.joined_at as string)
    };
}

// Actions
export function createGroup(name: string, ownerId: number, phone_number: string): Group {
    database.exec('BEGIN');
    try {
        const row = createGroupQuery.get(name, ownerId, phone_number);
        addMemberQuery.run(row!.id, ownerId);
        database.exec('COMMIT');
        return mapGroup(row!);
    } catch (error) {
        database.exec('ROLLBACK');
        throw error;
    }
}

export function findGroupById(group_id: number): Group | null {
    const row = getGroupByIdQuery.get(group_id);
    if (!row?.id) return null;
    return mapGroup(row);
}

export function deleteGroup(group_id: number, owner_id: number): boolean {
    const result = deleteGroupQuery.run(group_id, owner_id);
    return result.changes > 0;
}

export function findUserGroup(user_id: number): Group | null {
    const row = getUserGroupQuery.get(user_id);
    if (!row?.id) return null;
    return mapGroup(row);
}

export function listUserGroups(user_id: number): Group[] {
    const rows = getUserGroupsQuery.all(user_id, user_id);
    return rows.map((row) => mapGroup(row));
}

export function addGroupMember(group_id: number, user_id: number): { success: boolean, error?: string } {
    const row = getGroupMemberCountQuery.get(group_id) as { count: number };

    if (row.count >= 6) {
        return { success: false, error: "Group has reached the max limit of 6 members" };
    }

    try {
        addMemberQuery.run(group_id, user_id);
        return { success: true };
    } catch {
        return { success: false, error: "Member is already in a group" };
    }
}

export function removeGroupMember(group_id: number, user_id: number): { success: boolean, error?: string } {
    const row = getGroupMemberCountQuery.get(group_id) as { count: number };

    if (row.count <= 2) {
        return { success: false, error: "Cannot remove member. Groups must maintain a minimum of 2 members" };
    }

    removeMemberQuery.run(group_id, user_id);
    return { success: true };
}

export function listGroupMembers(group_id: number): GroupMember[] {
    const rows = getGroupMembersQuery.all(group_id);
    return rows.map((row) => mapGroupMember(row));
}