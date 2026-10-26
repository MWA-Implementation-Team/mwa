import { createDefaultMwaState } from '#src/state.js';
import type { UserRole } from '#src/db/users.js';
import { runTransaction } from './db/transaction.js';

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
    `INSERT INTO child_transactions (parent_id, user_id, balance_delta) VALUES (?, ?, ?)`,
);
const awardBadge = state.prepare(`INSERT INTO user_badges (badge_id, user_id) VALUES (?, ?)`);
const insertGroup = state.prepare(
    `INSERT INTO groups (name, owner_id, phone_number) VALUES (?, ?, ?)`,
);
const insertMember = state.prepare(`INSERT INTO group_members (group_id, user_id) VALUES (?, ?)`);
const insertQueueEntry = state.prepare(`INSERT INTO queue_entries (group_id) VALUES (?)`);

function addUser(username: string, email: string, role: UserRole): number {
    return Number(insertUser.run(username, email, role).lastInsertRowid);
}

function addParent(kind: 'transfer' | 'purchase' | 'system'): number {
    return Number(insertParent.run(kind).lastInsertRowid);
}

function leg(parentId: number, userId: number, balanceDelta: number) {
    insertLeg.run(parentId, userId, balanceDelta);
}

function addGroup(name: string, ownerId: number, phoneNumber: string): number {
    return Number(insertGroup.run(name, ownerId, phoneNumber).lastInsertRowid);
}

function member(groupId: number, userId: number) {
    insertMember.run(groupId, userId);
}

runTransaction(state.db, () => {
    const adminId = addUser('admin', 'admin@mwa.dev', 'admin');
    addUser('host', 'host@mwa.dev', 'host');
    const aliceId = addUser('alice', 'alice@mwa.dev', 'user');
    const bobId = addUser('bob', 'bob@mwa.dev', 'user');
    const carolId = addUser('carol', 'carol@mwa.dev', 'user');

    const grantId = addParent('transfer');
    leg(grantId, aliceId, 100);
    leg(grantId, adminId, -100);

    const p2pId = addParent('transfer');
    leg(p2pId, aliceId, -30);
    leg(p2pId, bobId, 30);

    const purchaseId = addParent('purchase');
    leg(purchaseId, bobId, -20);

    const systemId = addParent('system');
    leg(systemId, carolId, 50);

    awardBadge.run('test_badge', aliceId);

    const groupId = addGroup('high rollers', aliceId, '555-0100');
    member(groupId, aliceId);
    member(groupId, bobId);
    member(groupId, carolId);

    insertQueueEntry.run(groupId);
});

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
console.log('Seeded.');
