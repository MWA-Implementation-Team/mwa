import type { Group, GroupMember } from '#src/db/groups.js';
export type { Group, GroupMember };

export async function createGroup(
    name: string,
    ownerId: number,
    phone_number: string,
): Promise<Group> {
    const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ownerId, phone_number }),
    });
    if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `POST /api/groups failed: ${res.status}`);
    }
    return res.json();
}

export async function fetchGroupById(groupId: number): Promise<Group> {
    const res = await fetch(`/api/groups/${groupId}`);
    if (!res.ok) throw new Error(`GET /api/groups/${groupId} failed: ${res.status}`);
    return res.json();
}

export async function deleteGroup(groupId: number): Promise<void> {
    const res = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Could not delete group');
}

export async function addGroupMember(
    groupId: number,
    userId: number,
): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
    return res.json();
}

export async function removeGroupMember(
    groupId: number,
    userId: number,
): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(`/api/groups/${groupId}/members/${userId}`, {
        method: 'DELETE',
    });
    return res.json();
}

export async function fetchGroupMembers(groupId: number): Promise<GroupMember[]> {
    const res = await fetch(`/api/groups/${groupId}/members`);
    if (!res.ok) throw new Error(`GET /api/groups/${groupId}/members failed: ${res.status}`);
    return res.json();
}
