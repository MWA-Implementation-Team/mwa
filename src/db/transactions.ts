import { MwaState } from '#src/state.js';
import { runTransaction } from './transaction.js';

export type TransactionKind =
    'transfer' | 'purchase' | 'system' | 'gambling_deduction' | 'gambling_winnings';

export type Transaction = {
    // kept as the ISO string stored in sqlite so SSR and hydration
    // serialize identically (a Date would become a string in ssr-data)
    createdAt: string;
    kind: TransactionKind;
    balanceDelta: number;
};

export function listUserTransactions(state: MwaState, userId: number, limit = 10): Transaction[] {
    const listUserTransactionsQuery = state.prepare(`
    SELECT
        parent_transactions.created_at,
        parent_transactions.kind,
        child_transactions.balance_delta
    FROM child_transactions
    JOIN parent_transactions ON parent_transactions.id = child_transactions.parent_id
    WHERE child_transactions.user_id = ?
    ORDER BY child_transactions.id DESC
    LIMIT ?
    `);

    return listUserTransactionsQuery.all(userId, limit).map((row) => ({
        createdAt: row.created_at as string,
        kind: row.kind as TransactionKind,
        balanceDelta: row.balance_delta as number,
    }));
}

export function giveCoins(state: MwaState, userId: number, amount: number) {
    return runTransaction(state.db, () => {
        const insertParentTx = state.prepare(`
        INSERT INTO parent_transactions (kind) VALUES ('system')
        RETURNING id
        `);
        const { id: parentId } = insertParentTx.get()!;

        const insertChildTx = state.prepare(`
        INSERT INTO child_transactions (parent_id, user_id, balance_delta) VALUES (?, ?, ?)
        RETURNING id
        `);
        insertChildTx.run(parentId, userId, amount);
    });
}
