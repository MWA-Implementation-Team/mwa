import { currentUser } from '#src/auth.js';
import { 
    createGroup, 
    findGroupById, 
    listUserGroups,
    addGroupMember, 
    removeGroupMember, 
    listGroupMembers 
} from '#src/db/groups.js';
import { Hono } from 'hono';

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

        const body = await ctx.req.json();
        const { name, phone_number } = body;

        try {
            // Automatically use the logged in users id as the owner
            const group = createGroup(name, user.id, phone_number);
            return ctx.json(group);
        } catch {
            return ctx.json({ error: 'Failed to create group' }, 400);
        }
    });

    // Get group details by id
    app.get('/api/groups/:id', (ctx) => {
        if(!currentUser(ctx)) {
            return ctx.json({ error: 'unauthorized' }, 401);
        }

        const groupId = Number(ctx.req.param('id'));
        const group = findGroupById(groupId);

        if (!group) {
            return ctx.json({ error: 'Group not found' }, 404);
        }
        return ctx.json(group);
    })

    // Add a member to a group
    app.post('/api/groups/:id/members', async (ctx) => {
        if (!currentUser(ctx)) {
            return ctx.json({ error: 'unauthorized' }, 401);
        }

        const groupId = Number(ctx.req.param('id'));
        const body = await ctx.req.json();
        const { userId } = body;

        const result = addGroupMember(groupId, userId);
        return ctx.json(result);
    });

    // Remove a member from a group
    app.delete('/api/groups/:id/members/:userId', (ctx) => {
        if (!currentUser(ctx)) {
            return ctx.json({ error: 'unauthorized' }, 401);
        }

        const groupId = Number(ctx.req.param('id'));
        const userId = Number(ctx.req.param('userId'));

        const result = removeGroupMember(groupId, userId);
        return ctx.json(result);
    });

    // List all members of a group
    app.get('/api/groups/:id/members', (ctx) => {
        if (!currentUser(ctx)) {
            return ctx.json({ error: 'unauthorized' }, 401);
        }

        const groupId = Number(ctx.req.param('id'));
        const members = listGroupMembers(groupId);
        return ctx.json(members);
    });
}