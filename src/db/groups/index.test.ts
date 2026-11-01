import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createUser } from '../users/index.js';
import { addGroupMember, createGroup, listGroupMembers, removeGroupMember } from './index.js';
import { joinQueue, getWaitingEntry } from '../queue/index.js';
import { createTestMwaState } from '#src/state.js';

const state = createTestMwaState({});

let seq = 0;
function groupOf(memberCount: number) {
    const n = seq++;
    const owner = createUser(state, `g${n}o@example.com`, `g${n}_owner`);
    const group = createGroup(state, `group ${n}`, owner.id, '555');
    const members = [owner];
    for (let i = 1; i < memberCount; i++) {
        const member = createUser(state, `g${n}m${i}@example.com`, `g${n}_m${i}`);
        addGroupMember(state, group.id, member.id);
        members.push(member);
    }
    return { group, owner, members };
}

describe('db/groups removeGroupMember', () => {
    it('removes a member and allows dropping to one member', () => {
        const { group, members } = groupOf(2);
        assert.equal(removeGroupMember(state, group.id, members[1].id), 'removed');
        assert.deepEqual(
            listGroupMembers(state, group.id).map((m) => m.userId),
            [members[0].id],
        );
    });

    it('refuses to remove the owner', () => {
        const { group, owner } = groupOf(3);
        assert.equal(removeGroupMember(state, group.id, owner.id), 'is_owner');
        assert.equal(listGroupMembers(state, group.id).length, 3);
    });

    it('refuses a user who is not in the group', () => {
        const { group } = groupOf(3);
        const outsider = createUser(state, 'outsider@example.com', 'outsider');
        assert.equal(removeGroupMember(state, group.id, outsider.id), 'not_a_member');
        assert.equal(listGroupMembers(state, group.id).length, 3);
    });

    it('reports group_not_found for a bogus id', () => {
        const { members } = groupOf(2);
        assert.equal(removeGroupMember(state, 999999, members[1].id), 'group_not_found');
    });

    it('evicts the group from the queue when it drops below the minimum', () => {
        const { group, members } = groupOf(2);
        assert.equal(joinQueue(state, group.id).type, 'joined');
        assert.ok(getWaitingEntry(state, group.id));

        assert.equal(removeGroupMember(state, group.id, members[1].id), 'removed');
        assert.equal(getWaitingEntry(state, group.id), null);
    });

    it('keeps the queue spot when enough members remain', () => {
        const { group, members } = groupOf(3);
        assert.equal(joinQueue(state, group.id).type, 'joined');

        assert.equal(removeGroupMember(state, group.id, members[2].id), 'removed');
        assert.ok(getWaitingEntry(state, group.id));
    });
});
