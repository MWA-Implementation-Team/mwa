import { database } from '#src/state.js';

export type ParentTransaction = {
    id: number;
    created_by: number | null;
    kind: 'p2p' | 'purchase' | 'admin_grant' | 'system';
    issued_at: string;
};

export type ChildTransaction = {
    id: number;
    parent_id: number | null;
    user_id: number;
    type: 'sent' | 'received' | 'assignment' | 'purchase' | 'system';
    amount: number;
    balance_after: number;
    issued_at: string;
};

const listParentTransactionsQuery = database.prepare(
    `SELECT * FROM parent_transactions ORDER BY id`,
);
const listChildTransactionsQuery = database.prepare(`SELECT * FROM child_transactions ORDER BY id`);

export function listParentTransactions(): ParentTransaction[] {
    return listParentTransactionsQuery.all() as unknown as ParentTransaction[];
}

export function listChildTransactions(): ChildTransaction[] {
    return listChildTransactionsQuery.all() as unknown as ChildTransaction[];
}
