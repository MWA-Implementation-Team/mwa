import { createDefaultMwaState } from '#src/state.js';
import type { UserRole } from '#src/db/users/index.js';
import { runTransaction } from './db/transaction.js';
import { syncActivities } from './db/activities/index.js';
import { registeredActivities } from '#src/client/activities.js';
import { acceptGamblingSession, initCoinFlip, winCoinFlip } from './db/gambling/index.js';
import { callNextGroups, joinQueue } from './db/queue/index.js';
import { getOrCreateInteractToken } from './db/interactions/index.js';

// The hardcore seed — ~10x the demo data of `npm run seed` for stressing
// leaderboards, the host table and the queue. Run via `npm run seed:big`.
// Same guard as the small seed: refuses if users exist — delete db.sqlite
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

// Fixed-seed PRNG so the big dataset is the same on every machine.
function mulberry32(seed: number) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const rand = mulberry32(20261105);
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const int = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));

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

const firstNames = [
    'alice',
    'bob',
    'carol',
    'dave',
    'erin',
    'frank',
    'gintare',
    'tomas',
    'ugne',
    'matas',
    'ruta',
    'paulius',
    'ieva',
    'dominykas',
    'gabija',
    'martynas',
    'vilte',
    'nojus',
    'ernestas',
    'saule',
    'kestutis',
    'doroteja',
    'lukas',
    'emilija',
    'benas',
    'meda',
    'povilas',
    'rugile',
    'milda',
    'aurimas',
    'kornelija',
    'deivydas',
    'greta',
    'markas',
    'barbora',
    'tautvydas',
    'kamile',
    'vilius',
    'austeja',
    'rokas',
    'monika',
    'arnas',
    'sima',
    'kajus',
    'leja',
    'adomas',
    'gusta',
    'herkus',
    'daniel',
    'migle',
    'titas',
    'vakare',
    'joris',
    'liucija',
    'maksas',
    'neda',
    'vytas',
    'uosip',
    'terese',
    'airidas',
    'vitalija',
    'julius',
    'smilte',
    'domas',
    'katazyna',
    'henrikas',
    'sandra',
    'marijus',
    'klaudija',
    'rikis',
    'ugne2',
    'tadas',
];
const groupAdjectives = [
    'golden',
    'lucky',
    'midnight',
    'cosmic',
    'wild',
    'crimson',
    'silver',
    'electric',
    'sleepy',
    'mighty',
    'feral',
    'neon',
];
const groupNouns = [
    'ducks',
    'rollers',
    'foxes',
    'owls',
    'pirates',
    'vipers',
    'otters',
    'wolves',
    'comets',
    'lemurs',
    'badgers',
    'moles',
];

const USER_COUNT = 70;
const GROUP_COUNT = 18;
const QUEUED_GROUPS = 12;
const CALLED_PER_STATION = [2, 2, 1]; // groups sent to the first 3 stations
const FLIPS = 12;

// users, groups and stamped transaction legs in one shot — queue, gambling
// and tokens go through the real db functions below, which manage their own
// transactions and can't nest inside this one
const ids = runTransaction(state.db, () => {
    addUser('admin', 'admin@mwa.dev', 'admin');
    addUser('host', 'host@mwa.dev', 'host');
    addUser('host2', 'host2@mwa.dev', 'host');

    const userIds: number[] = [];
    for (let i = 0; i < USER_COUNT; i++) {
        const name = firstNames[i];
        userIds.push(addUser(name, `${name}@mwa.dev`, 'user'));
    }

    // groups of 2-5 members; whatever users are left over stay groupless
    const unassigned = [...userIds];
    const usedGroupNames = new Set<string>();
    const groupIds: number[] = [];
    const groupOf = new Map<number, number>();
    for (let g = 0; g < GROUP_COUNT && unassigned.length >= 2; g++) {
        let name = `${pick(groupAdjectives)} ${pick(groupNouns)}`;
        while (usedGroupNames.has(name)) name = `${name} ${int(2, 9)}`;
        usedGroupNames.add(name);

        const owner = unassigned.shift()!;
        const groupId = addGroup(name, owner, `555-0${100 + g}`);
        member(groupId, owner);
        groupOf.set(owner, groupId);
        for (let m = int(1, 4); m > 0 && unassigned.length > 0; m--) {
            const u = unassigned.shift()!;
            member(groupId, u);
            groupOf.set(u, groupId);
        }
        groupIds.push(groupId);
    }

    // a few legs per user so leaderboards get real spread — host grants keep
    // balances positive enough for the gambling rounds below
    const kinds = ['host_grant', 'system', 'purchase'] as const;
    for (const uid of userIds) {
        const gid = groupOf.get(uid) ?? null;
        leg(addParent('host_grant'), uid, int(40, 120), gid);
        for (let k = int(0, 3); k > 0; k--) {
            const kind = pick(kinds);
            const delta = kind === 'purchase' ? -int(5, 30) : int(5, 60);
            leg(addParent(kind), uid, delta, gid);
        }
    }

    // p2p transfers — paired legs like the runtime's insertTransaction
    for (let k = 0; k < 15; k++) {
        const a = pick(userIds);
        const b = pick(userIds.filter((u) => u !== a));
        const parentId = addParent('transfer');
        const amount = int(5, 40);
        leg(parentId, a, -amount, groupOf.get(a) ?? null);
        leg(parentId, b, amount, groupOf.get(b) ?? null);
    }

    for (let k = 0; k < 12; k++) {
        awardBadge.run('test_badge', pick(userIds));
    }

    return { userIds, groupIds };
});
const { userIds, groupIds } = ids;

syncActivities(state);

// most groups queue up; the front of the line gets spread over the first
// few stations so the host table has rows
for (const groupId of groupIds.slice(0, QUEUED_GROUPS)) {
    joinQueue(state, groupId);
}
const slugs = Object.keys(registeredActivities);
CALLED_PER_STATION.forEach((n, i) => callNextGroups(state, n, slugs[i]));

// a dozen coin flips — ~60% settled, the rest left as pending invites
for (let i = 0; i < FLIPS; i++) {
    const p1 = pick(userIds);
    const p2 = pick(userIds.filter((u) => u !== p1));
    const sessionId = initCoinFlip(state, pick(['heads', 'tails'] as const), {
        p1,
        p2,
        betAmount: int(5, 30),
    });
    if (sessionId && rand() < 0.6) {
        acceptGamblingSession(state, sessionId, p2);
        winCoinFlip(state, sessionId);
    }
}

for (let i = 0; i < 15; i++) {
    getOrCreateInteractToken(state, pick(userIds));
}

const balances = state.db
    .prepare(
        `SELECT COUNT(*) AS users,
                COALESCE(SUM(s.balance_current), 0) AS total_coins,
                COALESCE(MAX(s.balance_current), 0) AS richest
         FROM (SELECT users.id,
                      COALESCE(SUM(child_transactions.balance_delta), 0) AS balance_current
               FROM users
               LEFT JOIN child_transactions ON child_transactions.user_id = users.id
               GROUP BY users.id) s`,
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

const queue = state.db
    .prepare(
        `SELECT queue_entries.status, queue_entries.activity_slug, COUNT(*) AS groups
         FROM queue_entries
         GROUP BY queue_entries.status, queue_entries.activity_slug`,
    )
    .all();
console.table(queue);

const sessions = state.db
    .prepare(`SELECT status, COUNT(*) AS sessions FROM gambling_sessions GROUP BY status`)
    .all();
console.table(sessions);
console.log(`Seeded ${USER_COUNT} users, ${groupIds.length} groups.`);
