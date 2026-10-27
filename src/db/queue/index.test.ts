import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { createUser } from '../users/index.js';
import { addGroupMember, createGroup } from '../groups/index.js';
import {
    callNextGroups,
    getQueuePosition,
    getUserWaitingEntry,
    getWaitingEntry,
    joinQueue,
    leaveQueue,
    listStationGroups,
    listWaitingQueue,
    markEntryDone,
} from './index.js';
import { createTestMwaState } from '#src/state.js';

const state = createTestMwaState({});

let groupSeq = 0;
function queuedGroup(memberNames: string[]): number {
    const owner = createUser(state, `q${groupSeq}@example.com`, `q${groupSeq}_owner`);
    const group = createGroup(state, `queue group ${groupSeq++}`, owner.id, '555');
    for (const name of memberNames) {
        const member = createUser(state, `${name}@example.com`, name);
        addGroupMember(state, group.id, member.id);
    }
    return group.id;
}

describe('db/queue', () => {
    // tests share one in-memory db — clear the line so leftovers from a
    // previous test don't shift position assertions
    beforeEach(() => state.db.exec(`DELETE FROM queue_entries`));

    it('joins the queue as a waiting entry', () => {
        const groupId = queuedGroup([]);
        const { success, entry } = joinQueue(state, groupId);
        assert.equal(success, true);
        assert.equal(entry!.status, 'waiting');
        assert.equal(entry!.closedAt, null);
        assert.equal(entry!.activitySlug, null);
    });

    it('rejects a second join while the group is waiting', () => {
        const groupId = queuedGroup([]);
        assert.equal(joinQueue(state, groupId).success, true);
        const second = joinQueue(state, groupId);
        assert.equal(second.success, false);
        assert.equal(listWaitingQueue(state).filter((e) => e.groupId === groupId).length, 1);
    });

    it('orders positions by join order', () => {
        const a = queuedGroup([]);
        const b = queuedGroup([]);
        const ea = joinQueue(state, a).entry!;
        const eb = joinQueue(state, b).entry!;
        assert.equal(getQueuePosition(state, ea.id), 1);
        assert.equal(getQueuePosition(state, eb.id), 2);
    });

    it('leave marks the entry instead of deleting it', () => {
        const groupId = queuedGroup([]);
        const { entry } = joinQueue(state, groupId);
        assert.equal(leaveQueue(state, groupId), true);
        assert.equal(getWaitingEntry(state, groupId), null);

        const row = state
            .prepare(`SELECT status, closed_at FROM queue_entries WHERE id = ?`)
            .get(entry!.id);
        assert.equal(row?.status, 'left');
        assert.equal(typeof row?.closed_at, 'string');
    });

    it('a leaving group frees its position for the next in line', () => {
        const a = queuedGroup([]);
        const b = queuedGroup([]);
        joinQueue(state, a);
        const eb = joinQueue(state, b).entry!;
        assert.equal(getQueuePosition(state, eb.id), 2);
        leaveQueue(state, a);
        assert.equal(getQueuePosition(state, eb.id), 1);
    });

    it('rejoining after leaving lands at the back of the line', () => {
        const a = queuedGroup([]);
        const b = queuedGroup([]);
        joinQueue(state, a);
        const eb = joinQueue(state, b).entry!;
        leaveQueue(state, a);
        const rejoined = joinQueue(state, a).entry!;
        assert.equal(getQueuePosition(state, eb.id), 1);
        assert.equal(getQueuePosition(state, rejoined.id), 2);
    });

    it('leaving twice is a no-op', () => {
        const groupId = queuedGroup([]);
        joinQueue(state, groupId);
        assert.equal(leaveQueue(state, groupId), true);
        assert.equal(leaveQueue(state, groupId), false);
    });

    it('getUserWaitingEntry resolves through group membership', () => {
        const user = createUser(state, 'queued@example.com', 'queued_user');
        assert.equal(getUserWaitingEntry(state, user.id), null);

        const group = createGroup(state, `member group ${groupSeq++}`, user.id, '555');
        const entry = joinQueue(state, group.id).entry!;
        assert.equal(getUserWaitingEntry(state, user.id)?.id, entry.id);
    });

    it('callNextGroups takes the front of the line and marks it called', () => {
        const a = queuedGroup([]);
        const b = queuedGroup([]);
        const c = queuedGroup([]);
        const ea = joinQueue(state, a).entry!;
        const eb = joinQueue(state, b).entry!;
        const ec = joinQueue(state, c).entry!;

        state.prepare(`INSERT INTO activities (slug) VALUES ('test-station')`).run();
        const called = callNextGroups(state, 2, 'test-station');

        assert.deepEqual(
            called.map((e) => e.id),
            [ea.id, eb.id],
        );
        assert.equal(called[0].status, 'called');
        assert.equal(called[0].activitySlug, 'test-station');

        assert.equal(getQueuePosition(state, ec.id), 1);
        assert.equal(getQueuePosition(state, ea.id), null);
        assert.equal(listWaitingQueue(state).length, 1);
    });

    it('callNextGroups returns what is left when fewer groups are waiting', () => {
        const only = queuedGroup([]);
        joinQueue(state, only);
        const called = callNextGroups(state, 5, 'test-station');
        assert.equal(called.length, 1);
    });

    it('listStationGroups shows called groups until they are marked done', () => {
        const a = queuedGroup([]);
        const b = queuedGroup([]);
        joinQueue(state, a);
        joinQueue(state, b);

        state.prepare(`INSERT OR IGNORE INTO activities (slug) VALUES ('test-station')`).run();
        const [ea, eb] = callNextGroups(state, 2, 'test-station');

        assert.deepEqual(
            listStationGroups(state, 'test-station').map((r) => r.id),
            [ea.id, eb.id],
        );
        // a different station sees nothing
        assert.equal(listStationGroups(state, 'other-station').length, 0);

        assert.equal(markEntryDone(state, ea.id), true);
        assert.deepEqual(
            listStationGroups(state, 'test-station').map((r) => r.id),
            [eb.id],
        );

        // the row is kept, with done_at set
        const row = state
            .prepare(`SELECT status, done_at FROM queue_entries WHERE id = ?`)
            .get(ea.id);
        assert.equal(row?.status, 'called');
        assert.equal(typeof row?.done_at, 'string');
    });

    it('markEntryDone refuses entries that are not at a station', () => {
        const groupId = queuedGroup([]);
        const { entry } = joinQueue(state, groupId);
        assert.equal(markEntryDone(state, entry!.id), false);
        assert.equal(markEntryDone(state, 999999), false);
    });

    it('a station can hold several called groups — calling more is not gated', () => {
        const a = queuedGroup([]);
        const b = queuedGroup([]);
        joinQueue(state, a);
        joinQueue(state, b);

        state.prepare(`INSERT OR IGNORE INTO activities (slug) VALUES ('test-station')`).run();
        callNextGroups(state, 1, 'test-station');
        const second = callNextGroups(state, 1, 'test-station');

        assert.equal(second.length, 1);
        assert.equal(listStationGroups(state, 'test-station').length, 2);
    });

    it('listWaitingQueue returns group names in join order', () => {
        const a = queuedGroup([]);
        const b = queuedGroup([]);
        joinQueue(state, b);
        joinQueue(state, a);

        const rows = listWaitingQueue(state).filter((e) => e.groupId === a || e.groupId === b);
        assert.deepEqual(
            rows.map((r) => r.groupId),
            [b, a],
        );
        assert.match(rows[0].groupName, /queue group/);
    });
});
