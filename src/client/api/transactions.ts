import type { Transaction, TransactionKind } from '#src/db/transactions.js';
// ^ type-only import: erased at compile time, so the browser never
// loads src/db/transactions.ts (it opens the database on import).

export type { Transaction, TransactionKind };
