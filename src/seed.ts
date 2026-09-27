import { database } from '#src/state.js';

// Seed the database with sample data. Run via `npm run seed`.
// Refuses to run if the users table isn't empty — delete db.sqlite
// to start over.

const now = () => new Date().toISOString();

const existing =
    (database.prepare(`SELECT COUNT(*) AS n FROM users`).get() as { n: number }).n ?? 0;
if (existing > 0) {
    console.log(`Database already has ${existing} user(s) — delete db.sqlite to reseed.`);
    process.exit(0);
}

const insertUser = database.prepare(
    `INSERT INTO users (username, email, type, created_at) VALUES (?, ?, ?, ?)`,
);
const insertParent = database.prepare(
    `INSERT INTO parent_transactions (created_by, kind, issued_at) VALUES (?, ?, ?)`,
);
const insertLeg = database.prepare(
    `INSERT INTO child_transactions (parent_id, user_id, type, amount, balance_after, issued_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
);
const updateBalance = database.prepare(
    `UPDATE users
     SET balance_current = balance_current + ?,
         lifetime_earned = lifetime_earned + ?
     WHERE id = ?`,
);
const balanceOf = database.prepare(`SELECT balance_current AS b FROM users WHERE id = ?`);
const insertActivity = database.prepare(
    `INSERT INTO activities (local_id, title, description) VALUES (?, ?, ?)`,
);
const insertBadge = database.prepare(
    `INSERT INTO badges (local_id, activity_id, title, description) VALUES (?, ?, ?, ?)`,
);
const awardBadge = database.prepare(
    `INSERT INTO user_badges (badge_id, user_id, received_at) VALUES (?, ?, ?)`,
);

function addUser(username: string, email: string, type: 'admin' | 'host' | 'user'): number {
    return Number(insertUser.run(username, email, type, now()).lastInsertRowid);
}

function addParent(kind: string, createdBy: number | null): number {
    return Number(insertParent.run(createdBy, kind, now()).lastInsertRowid);
}

// Keeps the money invariants in sync: updates balance_current /
// lifetime_earned and records the resulting balance on the leg.
function leg(
    parentId: number | null,
    userId: number,
    type: 'sent' | 'received' | 'assignment' | 'purchase' | 'system',
    amount: number,
) {
    updateBalance.run(amount, Math.max(amount, 0), userId);
    const balanceAfter = (balanceOf.get(userId) as { b: number }).b;
    insertLeg.run(parentId, userId, type, amount, balanceAfter, now());
}

database.exec('BEGIN');
try {
    const adminId = addUser('admin', 'admin@mwa.dev', 'admin');
    addUser('host', 'host@mwa.dev', 'host');
    const aliceId = addUser('alice', 'alice@mwa.dev', 'user');
    const bobId = addUser('bob', 'bob@mwa.dev', 'user');
    const carolId = addUser('carol', 'carol@mwa.dev', 'user');

    const grantId = addParent('admin_grant', adminId);
    leg(grantId, aliceId, 'assignment', 100);
    leg(grantId, adminId, 'assignment', -100);

    const p2pId = addParent('p2p', aliceId);
    leg(p2pId, aliceId, 'sent', -30);
    leg(p2pId, bobId, 'received', 30);

    const purchaseId = addParent('purchase', bobId);
    leg(purchaseId, bobId, 'purchase', -20);

    // System legs are parentless by design.
    leg(null, carolId, 'system', 50);

    const egyptId = Number(
        insertActivity.run('egypt', 'Egypt Booth', 'Find the hidden scarabs').lastInsertRowid,
    );
    const badgeId = Number(
        insertBadge.run('scarab', egyptId, 'Scarab Hunter', 'Found all scarabs at the Egypt booth')
            .lastInsertRowid,
    );
    awardBadge.run(badgeId, aliceId, now());

    database.exec('COMMIT');
} catch (error) {
    database.exec('ROLLBACK');
    throw error;
}

const balances = database
    .prepare(`SELECT username, balance_current, lifetime_earned FROM users ORDER BY id`)
    .all();
console.table(balances);
console.log('Seeded.');
