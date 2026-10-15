import { currentUser } from '#src/auth.js';
import {
    createGroup,
    deleteGroup,
    findGroupById,
    findUserGroup,
    listUserGroups,
    addGroupMember,
    removeGroupMember,
    listGroupMembers,
    MAX_GROUP_NAME_LENGTH,
    MAX_PHONE_NUMBER_LENGTH,
} from '#src/db/groups.js';
import { Context, Hono } from 'hono';

async function readJsonBody(ctx: Context) {
    try {
        const body = await ctx.req.json();
        return (body ?? {}) as Record<string, unknown>;
    } catch {
        return null;
    }
}

export function registerGroupsRoutes(app: Hono) {
    app.get('/api/groups', (ctx) => {
        const user = currentUser(ctx);
        if (!user) {
            return ctx.json({ error: 'unauthorized' }, 401);
        }

        return ctx.json(listUserGroups(user.id));
    });

    // Create new group
    app.post('/api/groups', async (ctx) => {
        const user = currentUser(ctx);
        if (!user) {
            return ctx.json({ error: 'unauthorized' }, 401);
        }

        const body = await readJsonBody(ctx);
        if (!body) {
            return ctx.json({ error: 'invalid json body' }, 400);
        }

        const { name, phone_number } = body;
        if (
            typeof name !== 'string' ||
            name.trim() === '' ||
            name.length > MAX_GROUP_NAME_LENGTH ||
            typeof phone_number !== 'string' ||
            phone_number.trim() === '' ||
            phone_number.length > MAX_PHONE_NUMBER_LENGTH
        ) {
            return ctx.json({ error: 'invalid name or phone_number' }, 400);
        }

        if (listUserGroups(user.id).length > 0) {
            return ctx.json({ error: 'you are already in a group' }, 409);
        }

        try {
            // Automatically use the logged in users id as the owner
            const group = createGroup(name.trim(), user.id, phone_number.trim());
            return ctx.json(group, 201);
        } catch {
            return ctx.json({ error: 'Failed to create group' }, 400);
        }
    });

    // Get group details by id
    app.get('/api/groups/:id', (ctx) => {
        if (!currentUser(ctx)) {
            return ctx.json({ error: 'unauthorized' }, 401);
        }

        const groupId = Number(ctx.req.param('id'));
        if (!Number.isInteger(groupId)) {
            return ctx.json({ error: 'invalid group id' }, 400);
        }

        const group = findGroupById(groupId);

        if (!group) {
            return ctx.json({ error: 'Group not found' }, 404);
        }
        return ctx.json(group);
    });

    app.delete('/api/groups/:id', (ctx) => {
        const user = currentUser(ctx);
        if (!user) {
            return ctx.json({ error: 'unauthorized' }, 401);
        }

        const groupId = Number(ctx.req.param('id'));
        if (!Number.isInteger(groupId)) {
            return ctx.json({ error: 'invalid group id' }, 400);
        }

        const group = findGroupById(groupId);
        if (!group) {
            return ctx.json({ error: 'Group not found' }, 404);
        }
        if (group.ownerId !== user.id) {
            return ctx.json({ error: 'Only the group owner can delete it' }, 403);
        }

        deleteGroup(groupId, user.id);
        return ctx.json({ success: true });
    });

    // Add a member to a group — any member of that group may add
    app.post('/api/groups/:id/members', async (ctx) => {
        const user = currentUser(ctx);
        if (!user) {
            return ctx.json({ error: 'unauthorized' }, 401);
        }

        const groupId = Number(ctx.req.param('id'));
        if (!Number.isInteger(groupId)) {
            return ctx.json({ error: 'invalid group id' }, 400);
        }
        if (!findGroupById(groupId)) {
            return ctx.json({ error: 'Group not found' }, 404);
        }

        const body = await readJsonBody(ctx);
        if (!body) {
            return ctx.json({ error: 'invalid json body' }, 400);
        }

        const { userId } = body;
        if (typeof userId !== 'number' || !Number.isInteger(userId)) {
            return ctx.json({ error: 'invalid userId' }, 400);
        }

        if (findUserGroup(user.id)?.id !== groupId) {
            return ctx.json({ error: 'only group members can add members' }, 403);
        }

        const result = addGroupMember(groupId, userId);
        return ctx.json(result);
    });

    // Remove a member from a group — owner only
    app.delete('/api/groups/:id/members/:userId', (ctx) => {
        const user = currentUser(ctx);
        if (!user) {
            return ctx.json({ error: 'unauthorized' }, 401);
        }

        const groupId = Number(ctx.req.param('id'));
        const userId = Number(ctx.req.param('userId'));
        if (!Number.isInteger(groupId) || !Number.isInteger(userId)) {
            return ctx.json({ error: 'invalid id' }, 400);
        }

        const group = findGroupById(groupId);
        if (!group) {
            return ctx.json({ error: 'Group not found' }, 404);
        }
        if (group.ownerId !== user.id) {
            return ctx.json({ error: 'Only the group owner can remove members' }, 403);
        }

        const result = removeGroupMember(groupId, userId);
        return ctx.json(result);
    });

    // List all members of a group
    app.get('/api/groups/:id/members', (ctx) => {
        if (!currentUser(ctx)) {
            return ctx.json({ error: 'unauthorized' }, 401);
        }

        const groupId = Number(ctx.req.param('id'));
        if (!Number.isInteger(groupId)) {
            return ctx.json({ error: 'invalid group id' }, 400);
        }

        const members = listGroupMembers(groupId);
        return ctx.json(members);
    });
}
