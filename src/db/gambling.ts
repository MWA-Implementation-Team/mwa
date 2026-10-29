import { MwaState } from '#src/state.js';
import { randomInt } from 'node:crypto';
import { runTransaction } from './transaction.js';
import { insertTransaction } from './transactions.js';
import { findUserById } from './users.js';
import { Connect4Board } from '#src/client/gambling/connect4.js';
import { calcPlayerTurnTime, MatchTurn, PlayerTurnTime } from '#src/client/gambling/turns.js';

export type GameType = 'coin_flip' | 'connect_4';

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

export type Gambler = 'p1' | 'p2';

type RunningGameCommon = {
    p1: number;
    p2: number;
    p1Name: string;
    p2Name: string;
    betAmount: number;
};

export type CoinFlipGame = RunningGameCommon & {
    gameType: 'coin_flip';
    status:
    | { type: 'pending' }
    | { type: 'expired' }
    | { type: 'rejected' }
    | { type: 'running' }
    | {
        type: 'ended';
        winner: Gambler;
        flipResult: CoinSide;
    };
    p1Guess: CoinSide;
};

export type Connect4Game = RunningGameCommon & {
    gameType: 'connect_4';
    status:
    | { type: 'pending' }
    | { type: 'expired' }
    | { type: 'rejected' }
    | { type: 'running' }
    | {
        type: 'ended';
        winner: Gambler | 'draw';
    };
    boardStr: string;
    nextTurn: Gambler;
    p1TurnTime: PlayerTurnTime;
    p2TurnTime: PlayerTurnTime;
};

export type RunningGame = CoinFlipGame | Connect4Game;

export type Invitation = {
    id: number;
    type: GameType;
    p1Name: string;
};

export type ActiveSession = {
    id: number;
    opponentName: string;
};

export function queryGamblingInvitations(state: MwaState, userId: number): Invitation[] {
    const query = state.prepare(`
    SELECT gambling_sessions.id, game_type, p1u.username AS p1_name FROM gambling_sessions
    LEFT JOIN users AS p1u ON gambling_sessions.p1 = p1u.id
    WHERE p2 = ? AND status = 'pending'
    ORDER BY gambling_sessions.created_at ASC
    `);
    return query.all(userId).map((row) => ({
        id: row.id as number,
        type: row.game_type as GameType,
        p1Name: row.p1_name as string,
    }));
}

export function queryActiveGamblingSession(state: MwaState, userId: number): ActiveSession | null {
    const query = state.prepare(`
    SELECT gambling_sessions.id, p1, p1u.username AS p1_name, p2, p2u.username AS p2_name FROM gambling_sessions
    LEFT JOIN users AS p1u ON gambling_sessions.p1 = p1u.id
    LEFT JOIN users AS p2u ON gambling_sessions.p2 = p2u.id
    WHERE (p1 = ? OR p2 = ?) AND status = 'running'
    `);
    const row = query.get(userId, userId);
    if (!row) return null;

    return {
        id: row.id as number,
        opponentName: row.p1 === userId ? (row.p2_name as string) : (row.p1_name as string),
    };
}

export function queryGamblingSessions(state: MwaState): SessionSummary[] {
    const query = state.prepare(`
    SELECT gambling_sessions.id, game_type, p1u.username AS p1_name, p2u.username AS p2_name FROM gambling_sessions
    LEFT JOIN users AS p1u ON gambling_sessions.p1 = p1u.id
    LEFT JOIN users AS p2u ON gambling_sessions.p2 = p2u.id
    WHERE status = 'running'
    `);
    return query.all().map((row) => ({
        id: row.id as number,
        type: row.game_type as GameType,
        p1Name: row.p1_name as string,
        p2Name: row.p2_name as string,
    }));
}

export function findGamblingSessionById(state: MwaState, sessionId: number): RunningGame | null {
    const query = state.prepare(`
    SELECT
        game_type,
        status,
        p1_deposit_tx,
        p2_deposit_tx,
        winner,
        p1,
        p2,
        p1u.username AS p1_name,
        p2u.username AS p2_name,
        bet_amount,
        cf.p1_bet AS cf_p1_bet,
        cf.actual_result AS cf_actual_result
    FROM gambling_sessions
    LEFT JOIN users AS p1u ON gambling_sessions.p1 = p1u.id
    LEFT JOIN users AS p2u ON gambling_sessions.p2 = p2u.id
    LEFT JOIN coin_flip_games AS cf ON gambling_sessions.id = cf.session
    WHERE gambling_sessions.id = ?
    `);
    const row = query.get(sessionId);
    if (!row) return null;

    const gameType = row.game_type as GameType;

    const statusRow = row.status as string;

    const common = {
        p1: row.p1 as number,
        p2: row.p2 as number,
        p1Name: row.p1_name as string,
        p2Name: row.p2_name as string,
        betAmount: row.bet_amount as number,
    };

    switch (gameType) {
        case 'coin_flip': {
            const p1Guess = row.cf_p1_bet as CoinSide;

            let status: CoinFlipGame['status'];
            switch (statusRow) {
                case 'pending':
                case 'expired':
                case 'rejected':
                case 'running':
                    status = { type: statusRow };
                    break;
                case 'ended':
                    status = {
                        type: 'ended',
                        winner: row.winner as Gambler, // draw not possible in coin flip
                        flipResult: row.winner === 'p1' ? p1Guess : p1Guess === 'heads' ? 'tails' : 'heads',
                    };
                    break;
                default:
                    throw new Error(`Unknown session status ${row.status}`);
            }

            return {
                gameType: 'coin_flip',
                p1Guess,
                status,
                ...common
            };
        }
        case 'connect_4': {
            let status: Connect4Game['status'];
            switch (statusRow) {
                case 'pending':
                case 'expired':
                case 'rejected':
                case 'running':
                    status = { type: statusRow };
                    break;
                case 'ended':
                    status = {
                        type: 'ended',
                        winner: row.winner as Gambler | 'draw',
                    };
                    break;
                default:
                    throw new Error(`Unknown session status ${row.status}`);
            }

            const turnRows = state.prepare(`
            SELECT created_at, player, new_board from connect_4_turns
            WHERE session = ?
            ORDER BY created_at ASC
            `).all(sessionId);

            const turns: MatchTurn[] = turnRows.map(row => {
                return {
                    player: row.player as Gambler,
                    timeMs: new Date(row.created_at as string).getTime(),
                };
            })

            const lastTurn = turnRows[turnRows.length - 1];

            return {
                gameType: 'connect_4',
                boardStr: lastTurn?.new_board as string ?? new Connect4Board().asString(),
                nextTurn: lastTurn?.player === 'p1' ? 'p2' : 'p1',
                status,
                p1TurnTime: calcPlayerTurnTime(turns, 'p1', c4PlayerTurnTime),
                p2TurnTime: calcPlayerTurnTime(turns, 'p2', c4PlayerTurnTime),
                ...common
            };
        }
    }
}

// An open invitation from p1 to p2, if one exists — used to avoid stacking
// duplicate invites on the same pair.
export function findPendingGamblingSession(state: MwaState, p1: number, p2: number): number | null {
    const query = state.prepare(`
    SELECT id FROM gambling_sessions
    WHERE p1 = ? AND p2 = ? AND status = 'pending'
    ORDER BY created_at ASC
    `);
    const row = query.get(p1, p2);
    return row ? (row.id as number) : null;
}

export type AcceptGamblingSessionResult = 'success' | 'too_broke' | 'invalid_session';

export function acceptGamblingSession(
    state: MwaState,
    sessionId: number,
    userId: number,
): AcceptGamblingSessionResult {
    return runTransaction(state.db, () => {
        const sessionQuery = state.prepare(`
        SELECT game_type, bet_amount FROM gambling_sessions
        WHERE id = ? AND p2 = ? AND status = 'pending'
        `);
        const row = sessionQuery.get(sessionId, userId);
        if (!row) {
            return 'invalid_session';
        }
        const gameType = row.game_type as GameType;
        const betAmount = row.bet_amount as number;

        const deductResult = deductCoinsForGambling(state, userId, betAmount);
        if (deductResult.type === 'too_broke') {
            return 'too_broke';
        }

        const update = state.prepare(`
        UPDATE gambling_sessions SET status = 'running', p2_deposit_tx = ? WHERE id = ?
        `);
        update.run(deductResult.parentId, sessionId);

        switch (gameType) {
            case 'connect_4': {
                const secondTurn: Gambler = randomInt(2) === 0 ? 'p1' : 'p2';
                const initialBoard = new Connect4Board().asString();

                state.prepare(`
                INSERT INTO connect_4_turns (session, player, new_board) VALUES (?, ?, ?)
                `).run(sessionId, secondTurn, initialBoard);
                break;
            }
        }

        return 'success';
    });
}

export function cancelGamblingSession(
    state: MwaState,
    sessionId: number,
    reason: 'expired' | 'rejected',
    userId?: number,
) {
    runTransaction(state.db, () => {
        const row = state.prepare(`
        SELECT p1_deposit_tx FROM gambling_sessions
        WHERE id = ? AND (? IS NULL OR p2 = ?) AND status = 'pending'
        `).get(sessionId, userId ?? null, userId ?? null);
        if (!row) return;

        state.prepare(`
        UPDATE gambling_sessions SET status = ?, p1_deposit_tx = NULL
        WHERE id = ?
        `).run(reason, sessionId);

        // Delete p1 deposit transaction to return money to p1.
        // The balance delta is supposed to be negative so this should be fine.
        // At the same time, p1_deposit_tx is cascaded to null and that marks the session as rejected.
        state.prepare(`
        DELETE FROM parent_transactions WHERE id = ?
        `).run(row.p1_deposit_tx);
    });
}

export function winGamblingSession(state: MwaState, sessionId: number, winner: Gambler | 'draw') {
    runTransaction(state.db, () => {
        const sessionQuery = state.prepare(`
        SELECT p1, p2, bet_amount FROM gambling_sessions
        WHERE id = ? AND status = 'running'
        `);
        const row = sessionQuery.get(sessionId);
        if (!row) {
            return;
        }
        const betAmount = row.bet_amount as number;

        switch (winner) {
            case 'p1':
            case 'p2': {
                const userId = winner === 'p1' ? row.p1 : row.p2;
                const parentId = insertTransaction(
                    state,
                    'gambling_winnings',
                    userId as number,
                    betAmount * 2,
                );

                state.prepare(`
                UPDATE gambling_sessions SET status = 'ended', winner = ?, winner_tx = ? WHERE id = ?
                `).run(winner, parentId, sessionId);
                break;
            }
            case 'draw': {
                const row = state.prepare(`
                SELECT p1_deposit_tx, p2_deposit_tx FROM gambling_sessions
                WHERE id = ? AND status = 'running'
                `).get(sessionId);
                if (!row) return;

                state.prepare(`
                UPDATE gambling_sessions SET status = ?, winner = 'draw', p1_deposit_tx = NULL, p2_deposit_tx = NULL
                WHERE id = ?
                `).run('ended', sessionId);

                state.prepare(`
                DELETE FROM parent_transactions WHERE id = ? OR id = ?;
                `).run(row.p1_deposit_tx, row.p2_deposit_tx);
                break;
            }
        }
    });
}

export type ExpiringGamblingSession = {
    id: number;
    creationTime: Date;
};

export function queryExpiringGamblingSessions(state: MwaState): ExpiringGamblingSession[] {
    const select = state.prepare(`
    SELECT id, created_at FROM gambling_sessions
    WHERE status = 'pending'
    `);
    return select.all().map((row) => ({
        id: row.id as number,
        creationTime: new Date(row.created_at as string),
    }));
}

function initGamblingSession(state: MwaState, type: GameType, opts: CommonGameOpts): number | null {
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
}

export type DeductCoinsResult =
    | {
        type: 'success';
        parentId: number;
    }
    | {
        type: 'too_broke';
    };

// this is expected to run in a transaction
function deductCoinsForGambling(
    state: MwaState,
    userId: number,
    betAmount: number,
): DeductCoinsResult {
    const user = findUserById(state, userId);
    if (!user) {
        throw new Error(`User ${userId} doesn't exist`);
    }

    if (user.currentBalance < betAmount) {
        return { type: 'too_broke' };
    }

    const parentId = insertTransaction(state, 'gambling_deduction', userId, -betAmount);
    return { type: 'success', parentId };
}

// --- COIN FLIP GAME ---

export type CoinSide = 'heads' | 'tails';

export function initCoinFlip(
    state: MwaState,
    p1Bet: CoinSide,
    opts: CommonGameOpts,
): number | null {
    return runTransaction(state.db, () => {
        const sessionId = initGamblingSession(state, 'coin_flip', opts);
        if (sessionId === null) return null;

        const insert = state.prepare(`
        INSERT INTO coin_flip_games (session, p1_bet, actual_result) VALUES (?, ?, ?)
        `);

        const actualResult: CoinSide = randomInt(2) === 0 ? 'heads' : 'tails';
        insert.run(sessionId, p1Bet, actualResult);

        return sessionId;
    });
}

export function winCoinFlip(state: MwaState, sessionId: number) {
    const select = state.prepare(`
    SELECT p1_bet, actual_result FROM coin_flip_games WHERE session = ?
    `);

    const row = select.get(sessionId);
    if (!row) {
        console.warn(`[gambling] no coin flip row for session ${sessionId}`);
        return;
    }
    const winner: Gambler = row.p1_bet === row.actual_result ? 'p1' : 'p2';

    winGamblingSession(state, sessionId, winner);
}

export type PendingCoinFlip = {
    sessionId: number;
    acceptedTime: Date;
};

export function queryPendingCoinFlips(state: MwaState): PendingCoinFlip[] {
    const select = state.prepare(`
    SELECT sessions.id AS session_id, tx.created_at AS accepted_at FROM coin_flip_games
    LEFT JOIN gambling_sessions AS sessions ON sessions.id = coin_flip_games.session
    LEFT JOIN parent_transactions AS tx ON tx.id = sessions.p2_deposit_tx
    WHERE status = 'running'
    `);
    return select.all().map((row) => ({
        sessionId: row.session_id as number,
        acceptedTime: new Date(row.accepted_at as string),
    }));
}

// --- CONNECT 4 GAME ---

//export const c4PlayerTurnTime = 2 * 60 * 1000;
export const c4PlayerTurnTime = 30 * 1000; // lower for testing for now

export function initConnect4(
    state: MwaState,
    opts: CommonGameOpts,
): number | null {
    return runTransaction(state.db, () => {
        return initGamblingSession(state, 'connect_4', opts);
    });
}

export function connect4TakeTurn(state: MwaState, sessionId: number, player: Gambler, newBoard: Connect4Board): boolean {
    return runTransaction(state.db, () => {
        const row = state.prepare(`
        SELECT player from connect_4_turns
        WHERE session = ?
        ORDER BY created_at DESC LIMIT 1
        `).get(sessionId);
        if (!row) return false;
        const nextPlayer: Gambler = row.player === 'p1' ? 'p2' : 'p1';
        if (player !== nextPlayer) return false;

        state.prepare(`
        INSERT INTO connect_4_turns (session, player, new_board) VALUES (?, ?, ?)
        `).run(sessionId, player, newBoard.asString());
        return true;
    });
}

export type PendingConnect4Match = {
    sessionId: number;
};

export function queryPendingConnect4Matches(state: MwaState): PendingConnect4Match[] {
    const select = state.prepare(`
    SELECT id FROM gambling_sessions
    WHERE game_type = 'connect_4' AND status = 'running'
    `);
    return select.all().map((row) => ({
        sessionId: row.id as number,
    }));
}
