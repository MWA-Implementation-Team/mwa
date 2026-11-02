import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createUser } from '../users/index.js';
import {
    addGroupMember,
    createGroup,
    disbandGroup,
    findUserGroup,
    listGroupMembers,
    removeGroupMember,
    updateGroup,
} from './index.js';
import { callNextGroups, joinQueue, getWaitingEntry, listStationGroups } from '../queue/index.js';
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

describe('db/groups disbandGroup', () => {
    it('disbands: members leave, the group stops resolving, and it cannot disband twice', () => {
        const { group, owner, members } = groupOf(2);
        assert.ok(disbandGroup(state, group.id, owner.id));
        assert.equal(listGroupMembers(state, group.id).length, 0);
        assert.equal(findUserGroup(state, members[0].id), null);
        assert.equal(disbandGroup(state, group.id, owner.id), false);
    });

    it('refuses a non-owner', () => {
        const { group, members } = groupOf(2);
        assert.equal(disbandGroup(state, group.id, members[1].id), false);
        assert.ok(findUserGroup(state, members[0].id));
    });

    it('drops a waiting spot and marks a called entry left', () => {
        // clear leftovers from earlier tests so only these groups can be called
        state.db.exec(`DELETE FROM queue_entries`);
        const { group, owner } = groupOf(2);
        const waiting = groupOf(2);
        joinQueue(state, group.id);
        joinQueue(state, waiting.group.id);
        state.prepare(`INSERT OR IGNORE INTO activities (slug) VALUES ('test-station')`).run();
        callNextGroups(state, 2, 'test-station');

        assert.ok(disbandGroup(state, group.id, owner.id));
        const row = state
            .prepare(`SELECT status, done_at FROM queue_entries WHERE group_id = ?`)
            .get(group.id);
        assert.equal(row?.status, 'left');
        assert.equal(row?.done_at, null);
        assert.equal(listStationGroups(state, 'test-station').length, 1);

        // a group still waiting loses its spot outright
        const inLine = groupOf(2);
        joinQueue(state, inLine.group.id);
        assert.ok(getWaitingEntry(state, inLine.group.id));
        assert.ok(disbandGroup(state, inLine.group.id, inLine.owner.id));
        assert.equal(getWaitingEntry(state, inLine.group.id), null);

        assert.ok(disbandGroup(state, waiting.group.id, waiting.owner.id));
        assert.equal(listStationGroups(state, 'test-station').length, 0);
    });

    it("still reports 'taken' against a live name under the partial index", () => {
        const { group, owner } = groupOf(1);
        createGroup(state, 'db taken name', createUser(state, 'tk@example.com', 'tk').id, '555');
        assert.equal(updateGroup(state, group.id, owner.id, 'db taken name', '555'), 'taken');
    });
});
