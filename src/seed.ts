import { database } from '#src/state.js';
import { UserRole } from '#src/db/users.js';
import { randomUUID } from 'node:crypto';

// Seed the database with sample data. Run via `npm run seed`.
// Refuses to run if the users table isn't empty — delete db.sqlite
// to start over.

const existing =
    (database.prepare(`SELECT COUNT(*) AS n FROM users`).get() as { n: number }).n ?? 0;
if (existing > 0) {
    console.log(`Database already has ${existing} user(s) — delete db.sqlite to reseed.`);
    process.exit(0);
}

const insertUser = database.prepare(
    `INSERT INTO users (id, username, email, role) VALUES (?, ?, ?, ?)`,
);
const insertParent = database.prepare(`INSERT INTO parent_transactions (kind) VALUES (?)`);
const insertLeg = database.prepare(
    `INSERT INTO child_transactions (parent_id, user_id, balance_delta) VALUES (?, ?, ?)`,
);
const awardBadge = database.prepare(`INSERT INTO user_badges (badge_id, user_id) VALUES (?, ?)`);

function addUser(username: string, email: string, role: UserRole): string {
    const id = randomUUID();
    insertUser.run(id, username, email, role);
    return id;
}

function addParent(kind: 'transfer' | 'purchase' | 'system'): number {
    return Number(insertParent.run(kind).lastInsertRowid);
}

function leg(parentId: number, userId: string, balanceDelta: number) {
    insertLeg.run(parentId, userId, balanceDelta);
}

database.exec('BEGIN');
try {
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

    database.exec('COMMIT');
} catch (error) {
    database.exec('ROLLBACK');
    throw error;
}

const balances = database
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
console.log('Seeded.');
