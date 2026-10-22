import { MwaState } from '#src/state.js';
import { runTransaction } from './transaction.js';
import { findUserById } from './users.js';

export type GameType = 'coin_flip';

export type SessionSummary = {
    id: number;
    type: GameType;
    p1Name: string;
    p2Name: string;
};

export type CommonGameOpts = {
    p1: number;
    p2: number;
    betAmount: number;
};

export type RunningGame = {
    type: GameType;
    status: { type: 'pending' } | { type: 'rejected' } | { type: 'running' } | {
        type: 'ended',
        winner: 'p1' | 'p2',
    }

    p1: number;
    p2: number;
    p1Name: string;
    p2Name: string;
};

export type Invitation = {
    id: number;
    type: GameType,
    p1Name: string;
};

export function queryGamblingInvitations(state: MwaState, userId: number): Invitation[] {
    const query = state.prepare(`
    SELECT gambling_sessions.id, game_type, p1u.username AS p1_name FROM gambling_sessions
    LEFT JOIN users AS p1u ON gambling_sessions.p1 = p1u.id
    WHERE p2 = ? AND p1_deposit_tx IS NOT NULL AND p2_deposit_tx IS NULL
    `);
    return query.all(userId).map(row => {
        return {
            id: row.id as number,
            type: row.game_type as GameType,
            p1Name: row.p1_name as string,
        };
    });
}

export function queryGamblingSessions(state: MwaState): SessionSummary[] {
    const query = state.prepare(`
    SELECT gambling_sessions.id, game_type, p1u.username AS p1_name, p2u.username AS p2_name FROM gambling_sessions
    LEFT JOIN users AS p1u ON gambling_sessions.p1 = p1u.id
    LEFT JOIN users AS p2u ON gambling_sessions.p2 = p2u.id
    WHERE p1_deposit_tx IS NOT NULL AND p2_deposit_tx IS NOT NULL AND winner_tx IS NULL
    `);
    return query.all().map((row) => {
        return {
            id: row.id as number,
            type: row.game_type as GameType,
            p1Name: row.p1_name as string,
            p2Name: row.p2_name as string,
        };
    });
}

export function findGamblingSessionById(state: MwaState, sessionId: number): RunningGame | null {
    const query = state.prepare(`
    SELECT
        game_type, p1_deposit_tx, p2_deposit_tx, trans.user_id AS winner_user, p1, p2, p1u.username AS p1_name, p2u.username AS p2_name
    FROM gambling_sessions
    LEFT JOIN users AS p1u ON gambling_sessions.p1 = p1u.id
    LEFT JOIN users AS p2u ON gambling_sessions.p2 = p2u.id
    LEFT JOIN child_transactions AS trans ON gambling_sessions.winner_tx = trans.parent_id
    WHERE gambling_sessions.id = ?
    `);
    const row = query.get(sessionId);
    if (!row) return null;

    let status: RunningGame['status'];
    if (!row.p1_deposit_tx) {
        status = { type: 'rejected' };
    } else if (!row.p2_deposit_tx) {
        status = { type: 'pending' };
    } else if (!row.winner_user) {
        status = { type: 'running' };
    } else {
        status = {
            type: 'ended',
            winner: row.winner_user === row.p1 ? 'p1' : 'p2',
        };
    }

    return {
        type: row.game_type as GameType,
        status,
        p1: row.p1 as number,
        p2: row.p2 as number,
        p1Name: row.p1_name as string,
        p2Name: row.p2_name as string,
    };
}

export type AcceptGamblingSessionResult = 'success' | 'too_broke' | 'invalid_session';

export function acceptGamblingSession(state: MwaState, sessionId: number, userId: number): AcceptGamblingSessionResult {
    return runTransaction(state.db, () => {
        const sessionQuery = state.prepare(`
        SELECT bet_amount FROM gambling_sessions
        WHERE id = ? AND p2 = ? AND p1_deposit_tx IS NOT NULL AND winner_tx IS NULL
        `);
        const row = sessionQuery.get(sessionId, userId);
        if (!row) {
            return 'invalid_session';
        }
        const betAmount = row.bet_amount as number;

        const deductResult = deductCoinsForGambling(state, userId, betAmount);
        if (deductResult.type === 'too_broke') {
            return 'too_broke';
        }

        const update = state.prepare(`
        UPDATE gambling_sessions SET p2_deposit_tx = ? WHERE id = ?
        `);
        update.run(deductResult.parentId, sessionId);

        return 'success';
    });
}

export function rejectGamblingSession(state: MwaState, sessionId: number, userId: number) {
    // Delete p1 deposit transaction to return money to p1.
    // The balance delta should be negative so this should be fine.
    // At the same time, p1_deposit_tx is cascaded to null and that marks the session as rejected.
    const del = state.prepare(`
    DELETE FROM parent_transactions
    WHERE id IN (
      SELECT p1_deposit_tx
      FROM gambling_sessions
      WHERE id = ? AND p2 = ?
    );
    `);
    del.run(sessionId, userId);
}

export function winGamblingSession(state: MwaState, sessionId: number, userId: number) {
    runTransaction(state.db, () => {
        const sessionQuery = state.prepare(`
        SELECT bet_amount FROM gambling_sessions
        WHERE id = ? AND (p1 = ? OR p2 = ?) AND p2_deposit_tx IS NOT NULL AND winner_tx IS NULL
        `);
        const row = sessionQuery.get(sessionId, userId, userId);
        if (!row) {
            throw new Error(`Unknown gambling session ${sessionId}`);
        }
        const betAmount = row.bet_amount as number;

        const insertParentTx = state.prepare(`
        INSERT INTO parent_transactions (kind) VALUES ('gambling_winnings')
        RETURNING id
        `);
        const { id: parentId } = insertParentTx.get()!;

        const insertChildTx = state.prepare(`
        INSERT INTO child_transactions (parent_id, user_id, balance_delta) VALUES (?, ?, ?)
        RETURNING id
        `);
        insertChildTx.run(parentId, userId, betAmount * 2);

        const update = state.prepare(`
        UPDATE gambling_sessions SET winner_tx = ? WHERE id = ?
        `);
        update.run(parentId, sessionId);
    });
}

export function initGamblingSession(state: MwaState, type: GameType, opts: CommonGameOpts): number | null {
    return runTransaction(state.db, () => {
        const deductResult = deductCoinsForGambling(state, opts.p1, opts.betAmount);
        if (deductResult.type === 'too_broke') {
            return null;
        }

        const insert = state.prepare(`
        INSERT INTO gambling_sessions (p1, p2, bet_amount, game_type, p1_deposit_tx)
        VALUES (?, ?, ?, ?, ?)
        RETURNING id
        `);
        const row = insert.get(opts.p1, opts.p2, opts.betAmount, type, deductResult.parentId);
        return row!.id as number;
    });
}

// TEMPORARY
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

export type DeductCoinsResult = {
    type: 'success',
    parentId: number,
} | {
    type: 'too_broke',
};

// this is expected to run in a transaction
function deductCoinsForGambling(state: MwaState, userId: number, betAmount: number): DeductCoinsResult {
    const user = findUserById(state, userId);
    if (!user) {
        throw new Error(`User ${userId} doesn't exist`);
    }

    if (user.currentBalance < betAmount) {
        return { type: 'too_broke' };
    }

    const insertParentTx = state.prepare(`
    INSERT INTO parent_transactions (kind) VALUES ('gambling_deduction')
    RETURNING id
    `);
    const { id: parentId } = insertParentTx.get()!;

    const insertChildTx = state.prepare(`
    INSERT INTO child_transactions (parent_id, user_id, balance_delta) VALUES (?, ?, ?)
    RETURNING id
    `);
    insertChildTx.run(parentId, userId, -betAmount);

    return {
        type: 'success',
        parentId: parentId as number,
    };
}

export type CoinSide = 'heads' | 'tails';

//export function initCoinFlip(state: MwaState, bet: CoinSide, opts: CommonGameOpts) {
//    state.db.exec('BEGIN');
//    initGame(state, 'coin_flip', opts);
//    state.db.exec('COMMIT');
//}
