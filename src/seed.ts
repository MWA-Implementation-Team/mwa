import { createDefaultMwaState } from '#src/state.js';
import type { UserRole } from '#src/db/users/index.js';
import { runTransaction } from './db/transaction.js';
import { syncActivities } from './db/activities/index.js';
import { acceptGamblingSession, initCoinFlip, winCoinFlip } from './db/gambling/index.js';
import { callNextGroups, joinQueue } from './db/queue/index.js';
import { getOrCreateInteractToken } from './db/interactions/index.js';

// Seed the database with sample data. Run via `npm run seed`.
// Refuses to run if the users table isn't empty — delete db.sqlite
// to start over.

try {
    process.loadEnvFile('.env');
} catch {}

const state = createDefaultMwaState(false);

const existing = (state.prepare(`SELECT COUNT(*) AS n FROM users`).get() as { n: number }).n ?? 0;
if (existing > 0) {
    console.log(`Database already has ${existing} user(s) — delete db.sqlite to reseed.`);
    process.exit(0);
}

const insertUser = state.prepare(`INSERT INTO users (username, email, role) VALUES (?, ?, ?)`);
const insertParent = state.prepare(`INSERT INTO parent_transactions (kind) VALUES (?)`);
const insertLeg = state.prepare(
    `INSERT INTO child_transactions (parent_id, user_id, balance_delta, group_id) VALUES (?, ?, ?, ?)`,
);
const awardBadge = state.prepare(`INSERT INTO user_badges (badge_id, user_id) VALUES (?, ?)`);
const insertGroup = state.prepare(
    `INSERT INTO groups (name, owner_id, phone_number) VALUES (?, ?, ?)`,
);
const insertMember = state.prepare(`INSERT INTO group_members (group_id, user_id) VALUES (?, ?)`);

function addUser(username: string, email: string, role: UserRole): number {
    return Number(insertUser.run(username, email, role).lastInsertRowid);
}

function addParent(kind: 'transfer' | 'purchase' | 'system' | 'host_grant'): number {
    return Number(insertParent.run(kind).lastInsertRowid);
}

// groupId stamps the leg the way insertTransaction does at runtime — pass the
// group the user belonged to when the delta was earned
function leg(
    parentId: number,
    userId: number,
    balanceDelta: number,
    groupId: number | null = null,
) {
    insertLeg.run(parentId, userId, balanceDelta, groupId);
}

function addGroup(name: string, ownerId: number, phoneNumber: string): number {
    return Number(insertGroup.run(name, ownerId, phoneNumber).lastInsertRowid);
}

function member(groupId: number, userId: number) {
    insertMember.run(groupId, userId);
}

// users, groups and their stamped transaction legs in one shot; queue,
// gambling and activities go through the real db functions below, which
// manage their own transactions and can't nest inside this one
const ids = runTransaction(state.db, () => {
    const adminId = addUser('admin', 'admin@mwa.dev', 'admin');
    addUser('host', 'host@mwa.dev', 'host');
    const aliceId = addUser('alice', 'alice@mwa.dev', 'user');
    const bobId = addUser('bob', 'bob@mwa.dev', 'user');
    const carolId = addUser('carol', 'carol@mwa.dev', 'user');
    const daveId = addUser('dave', 'dave@mwa.dev', 'user');
    const erinId = addUser('erin', 'erin@mwa.dev', 'user');
    const frankId = addUser('frank', 'frank@mwa.dev', 'user');

    const highRollers = addGroup('high rollers', aliceId, '555-0100');
    member(highRollers, aliceId);
    member(highRollers, bobId);
    member(highRollers, carolId);
    const luckyDucks = addGroup('lucky ducks', daveId, '555-0101');
    member(luckyDucks, daveId);
    member(luckyDucks, erinId);

    // host grants — the activity board's coin source
    leg(addParent('host_grant'), aliceId, 40, highRollers);
    leg(addParent('host_grant'), bobId, 25, highRollers);
    leg(addParent('host_grant'), daveId, 60, luckyDucks);
    leg(addParent('host_grant'), erinId, 35, luckyDucks);

    const grantId = addParent('transfer');
    leg(grantId, aliceId, 100, highRollers);
    leg(grantId, adminId, -100);

    const p2pId = addParent('transfer');
    leg(p2pId, aliceId, -30, highRollers);
    leg(p2pId, bobId, 30, highRollers);

    const purchaseId = addParent('purchase');
    leg(purchaseId, bobId, -20, highRollers);

    leg(addParent('system'), carolId, 50, highRollers);
    leg(addParent('system'), daveId, 15, luckyDucks);
    // frank is groupless — these stay unstamped and count for no group
    leg(addParent('system'), frankId, 50);

    awardBadge.run('test_badge', aliceId);
    awardBadge.run('test_badge', daveId);

    return { aliceId, bobId, carolId, daveId, frankId, highRollers, luckyDucks };
});
const { aliceId, bobId, carolId, daveId, frankId, highRollers, luckyDucks } = ids;

syncActivities(state);

// 'high rollers' gets called to a station, 'lucky ducks' still waits in line
joinQueue(state, highRollers);
joinQueue(state, luckyDucks);
callNextGroups(state, 1, 'stone-age');

// two settled coin flips — one cross-group, one inside 'high rollers' where it
// nets to zero — plus an invite left pending for dave
const crossGroupFlip = initCoinFlip(state, 'heads', {
    p1: aliceId,
    p2: daveId,
    betAmount: 10,
});
if (crossGroupFlip) {
    acceptGamblingSession(state, crossGroupFlip, daveId);
    winCoinFlip(state, crossGroupFlip);
}
const inGroupFlip = initCoinFlip(state, 'tails', { p1: bobId, p2: carolId, betAmount: 15 });
if (inGroupFlip) {
    acceptGamblingSession(state, inGroupFlip, carolId);
    winCoinFlip(state, inGroupFlip);
}
initCoinFlip(state, 'heads', { p1: daveId, p2: frankId, betAmount: 5 });

getOrCreateInteractToken(state, aliceId);
getOrCreateInteractToken(state, daveId);

const balances = state.db
    .prepare(
        `SELECT users.username,
                COALESCE(SUM(child_transactions.balance_delta), 0) AS balance_current,
                COALESCE(SUM(MAX(child_transactions.balance_delta, 0)), 0) AS lifetime_earned
         FROM users
         LEFT JOIN child_transactions ON child_transactions.user_id = users.id
         GROUP BY users.id
         ORDER BY users.username`,
    )
    .all();
console.table(balances);

const groups = state.db
    .prepare(
        `SELECT groups.name,
                users.username AS owner,
                COUNT(group_members.user_id) AS members,
                groups.phone_number
         FROM groups
         JOIN users ON users.id = groups.owner_id
         LEFT JOIN group_members ON group_members.group_id = groups.id
         GROUP BY groups.id`,
    )
    .all();
console.table(groups);

const sessions = state.db
    .prepare(
        `SELECT gambling_sessions.id, p1_u.username AS p1, p2_u.username AS p2,
                gambling_sessions.bet_amount, gambling_sessions.status, gambling_sessions.winner
         FROM gambling_sessions
         JOIN users AS p1_u ON p1_u.id = gambling_sessions.p1
         JOIN users AS p2_u ON p2_u.id = gambling_sessions.p2`,
    )
    .all();
console.table(sessions);

const queue = state.db
    .prepare(
        `SELECT groups.name AS grp, queue_entries.status, queue_entries.activity_slug
         FROM queue_entries
         JOIN groups ON groups.id = queue_entries.group_id`,
    )
    .all();
console.table(queue);
console.log('Seeded.');
