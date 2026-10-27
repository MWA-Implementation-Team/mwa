import { requireApiUser } from '#src/auth.js';
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
} from '#src/db/groups/index.js';
import { MwaContext, MwaHono } from '#src/state.js';

async function readJsonBody(ctx: MwaContext) {
    try {
        const body = await ctx.req.json();
        return (body ?? {}) as Record<string, unknown>;
    } catch {
        return null;
    }
}

export function registerGroupsRoutes(app: MwaHono) {
    app.get('/api/groups', (ctx) => {
        const user = requireApiUser(ctx);
        if (user instanceof Response) return user;

        return ctx.json(listUserGroups(ctx.var, user.id));
    });

    app.post('/api/groups', async (ctx) => {
        const user = requireApiUser(ctx);
        if (user instanceof Response) return user;

        const body = await readJsonBody(ctx);
        if (!body) {
            return ctx.json({ error: 'invalid json body' }, 400);
        }

        const { name, phoneNumber } = body;
        if (
            typeof name !== 'string' ||
            name.trim() === '' ||
            name.length > MAX_GROUP_NAME_LENGTH ||
            typeof phoneNumber !== 'string' ||
            phoneNumber.trim() === '' ||
            phoneNumber.length > MAX_PHONE_NUMBER_LENGTH
        ) {
            return ctx.json({ error: 'invalid name or phoneNumber' }, 400);
        }

        if (listUserGroups(ctx.var, user.id).length > 0) {
            return ctx.json({ error: 'you are already in a group' }, 409);
        }

        try {
            // The logged-in user is always the owner
            const group = createGroup(ctx.var, name.trim(), user.id, phoneNumber.trim());
            return ctx.json(group, 201);
        } catch (error) {
            // groups.name is UNIQUE — the only expected failure is a taken name
            if (error instanceof Error && error.message.includes('UNIQUE')) {
                return ctx.json({ error: 'a group with that name already exists' }, 409);
            }
            throw error;
        }
    });

    app.get('/api/groups/:id', (ctx) => {
        const user = requireApiUser(ctx);
        if (user instanceof Response) return user;

        const groupId = Number(ctx.req.param('id'));
        if (!Number.isInteger(groupId)) {
            return ctx.json({ error: 'invalid group id' }, 400);
        }

        const group = findGroupById(ctx.var, groupId);

        if (!group) {
            return ctx.json({ error: 'Group not found' }, 404);
        }
        return ctx.json(group);
    });

    app.delete('/api/groups/:id', (ctx) => {
        const user = requireApiUser(ctx);
        if (user instanceof Response) return user;

        const groupId = Number(ctx.req.param('id'));
        if (!Number.isInteger(groupId)) {
            return ctx.json({ error: 'invalid group id' }, 400);
        }

        const group = findGroupById(ctx.var, groupId);
        if (!group) {
            return ctx.json({ error: 'Group not found' }, 404);
        }
        if (group.ownerId !== user.id) {
            return ctx.json({ error: 'Only the group owner can delete it' }, 403);
        }

        deleteGroup(ctx.var, groupId, user.id);
        return ctx.json({ success: true });
    });

    // Add a member to a group — any member of that group may add
    app.post('/api/groups/:id/members', async (ctx) => {
        const user = requireApiUser(ctx);
        if (user instanceof Response) return user;

        const groupId = Number(ctx.req.param('id'));
        if (!Number.isInteger(groupId)) {
            return ctx.json({ error: 'invalid group id' }, 400);
        }
        if (!findGroupById(ctx.var, groupId)) {
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

        if (findUserGroup(ctx.var, user.id)?.id !== groupId) {
            return ctx.json({ error: 'only group members can add members' }, 403);
        }

        const result = addGroupMember(ctx.var, groupId, userId);
        return ctx.json(result, result.success ? 200 : 400);
    });

    // Remove a member from a group — owner only
    app.delete('/api/groups/:id/members/:userId', (ctx) => {
        const user = requireApiUser(ctx);
        if (user instanceof Response) return user;

        const groupId = Number(ctx.req.param('id'));
        const userId = Number(ctx.req.param('userId'));
        if (!Number.isInteger(groupId) || !Number.isInteger(userId)) {
            return ctx.json({ error: 'invalid id' }, 400);
        }

        const group = findGroupById(ctx.var, groupId);
        if (!group) {
            return ctx.json({ error: 'Group not found' }, 404);
        }
        if (group.ownerId !== user.id) {
            return ctx.json({ error: 'Only the group owner can remove members' }, 403);
        }

        const result = removeGroupMember(ctx.var, groupId, userId);
        return ctx.json(result, result.success ? 200 : 400);
    });

    app.get('/api/groups/:id/members', (ctx) => {
        const user = requireApiUser(ctx);
        if (user instanceof Response) return user;

        const groupId = Number(ctx.req.param('id'));
        if (!Number.isInteger(groupId)) {
            return ctx.json({ error: 'invalid group id' }, 400);
        }

        const members = listGroupMembers(ctx.var, groupId);
        return ctx.json(members);
    });
}
