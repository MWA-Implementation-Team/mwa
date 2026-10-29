import type { Transaction, TransactionKind } from '#src/db/transactions/index.js';
// ^ type-only import: erased at compile time, so the browser never
// loads src/db/transactions/index.ts (it opens the database on import).

export type { Transaction, TransactionKind };
