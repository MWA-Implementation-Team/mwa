import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createUser, findUserById, queryUserNotification } from './users.js';
import { giveCoins } from './transactions.js';
import {
    acceptGamblingSession,
    cancelGamblingSession,
    c4PlayerTurnTime,
    CoinSide,
    connect4TakeTurn,
    findGamblingSessionById,
    findPendingGamblingSession,
    initCoinFlip,
    initConnect4,
    queryPendingConnect4Matches,
    queryGamblingInvitations,
    winCoinFlip,
    winGamblingSession,
} from './gambling.js';
import { createTestMwaState } from '#src/state.js';
import { Connect4Board } from '#src/client/gambling/connect4.js';

const state = createTestMwaState({});

const balance = (userId: number) => findUserById(state, userId)!.currentBalance;

function fundedUser(email: string, username: string, coins: number) {
    const user = createUser(state, email, username);
    if (coins > 0) giveCoins(state, user.id, coins);
    return user;
}

function coinFlipRow(sessionId: number) {
    return state
        .prepare(`SELECT p1_bet, actual_result FROM coin_flip_games WHERE session = ?`)
        .get(sessionId)!;
}

describe('db/gambling', () => {
    it('initCoinFlip deducts the stake and stores a pending session', () => {
        const p1 = fundedUser('i1@example.com', 'i1_user', 100);
        const p2 = fundedUser('i2@example.com', 'i2_user', 0);

        const sessionId = initCoinFlip(state, 'heads', { p1: p1.id, p2: p2.id, betAmount: 30 });
        assert.ok(sessionId !== null);

        assert.equal(balance(p1.id), 70);
        assert.equal(balance(p2.id), 0);

        const game = findGamblingSessionById(state, sessionId);
        assert.equal(game?.gameType, 'coin_flip');
        assert.equal(game?.status.type, 'pending');
        assert.equal(game?.betAmount, 30);
        assert.equal(game?.p1Guess, 'heads');
        assert.match(coinFlipRow(sessionId).actual_result as string, /^(heads|tails)$/);
    });

    it('initCoinFlip returns null when the challenger cannot cover the bet', () => {
        const p1 = fundedUser('b1@example.com', 'b1_user', 10);
        const p2 = fundedUser('b2@example.com', 'b2_user', 0);

        assert.equal(initCoinFlip(state, 'tails', { p1: p1.id, p2: p2.id, betAmount: 30 }), null);
        assert.equal(balance(p1.id), 10);
    });

    it('creates and accepts a Connect 4 game with an empty board and an active timer', () => {
        const p1 = fundedUser('c4a1@example.com', 'c4a1', 100);
        const p2 = fundedUser('c4a2@example.com', 'c4a2', 100);
        const opts = { p1: p1.id, p2: p2.id, betAmount: 30 };
        assert.equal(initConnect4(state, { ...opts, betAmount: 101 }), null);
        assert.equal(balance(p1.id), 100);

        const id = initConnect4(state, opts)!;
        const pending = findGamblingSessionById(state, id);
        assert.equal(pending?.gameType, 'connect_4');
        assert.equal(pending.status.type, 'pending');
        assert.equal(pending.boardStr, new Connect4Board().asString());
        assert.equal(balance(p1.id), 70);
        assert.equal(balance(p2.id), 100);
        assert.ok(!queryPendingConnect4Matches(state).some((match) => match.sessionId === id));

        assert.equal(acceptGamblingSession(state, id, p2.id), 'success');
        const game = findGamblingSessionById(state, id);
        assert.equal(game?.gameType, 'connect_4');
        assert.equal(game.status.type, 'running');
        assert.equal(game.boardStr, pending.boardStr);
        assert.equal(balance(p2.id), 70);
        assert.ok(queryPendingConnect4Matches(state).some((match) => match.sessionId === id));
        const active = game.nextTurn === 'p1' ? game.p1TurnTime : game.p2TurnTime;
        const waiting = game.nextTurn === 'p1' ? game.p2TurnTime : game.p1TurnTime;
        assert.equal(active.baseTimeLeftMs, c4PlayerTurnTime);
        assert.equal(typeof active.turnStartedTimeMs, 'number');
        assert.deepEqual(waiting, {
            baseTimeLeftMs: c4PlayerTurnTime,
            turnStartedTimeMs: undefined,
        });
    });

    it('persists Connect 4 moves and rejects out-of-turn moves', () => {
        const p1 = fundedUser('c4t1@example.com', 'c4t1', 100);
        const p2 = fundedUser('c4t2@example.com', 'c4t2', 100);
        const id = initConnect4(state, { p1: p1.id, p2: p2.id, betAmount: 10 })!;
        acceptGamblingSession(state, id, p2.id);
        const game = findGamblingSessionById(state, id);
        assert.equal(game?.gameType, 'connect_4');
        const first = game.nextTurn;
        const second = first === 'p1' ? 'p2' : 'p1';
        const board = Connect4Board.fromString(game.boardStr);
        board.place(0, first === 'p1' ? 'x' : 'o');

        assert.equal(connect4TakeTurn(state, id, second, board), false);
        assert.deepEqual(findGamblingSessionById(state, id), game);
        assert.equal(connect4TakeTurn(state, id, first, board), true);
        const updated = findGamblingSessionById(state, id);
        assert.equal(updated?.gameType, 'connect_4');
        assert.equal(updated.boardStr, board.asString());
        assert.equal(updated.nextTurn, second);

        board.place(1, first === 'p1' ? 'x' : 'o');
        assert.equal(connect4TakeTurn(state, id, first, board), false);
        assert.deepEqual(findGamblingSessionById(state, id), updated);
    });

    it('refunds both Connect 4 stakes on a draw', () => {
        const p1 = fundedUser('c4d1@example.com', 'c4d1', 100);
        const p2 = fundedUser('c4d2@example.com', 'c4d2', 100);
        const id = initConnect4(state, { p1: p1.id, p2: p2.id, betAmount: 30 })!;
        acceptGamblingSession(state, id, p2.id);
        assert.equal(balance(p1.id), 70);
        assert.equal(balance(p2.id), 70);

        winGamblingSession(state, id, 'draw');
        const game = findGamblingSessionById(state, id);
        assert.equal(game?.gameType, 'connect_4');
        assert.deepEqual(game.status, { type: 'ended', winner: 'draw' });
        assert.equal(game.boardStr, new Connect4Board().asString());
        assert.ok(!queryPendingConnect4Matches(state).some((match) => match.sessionId === id));

        winGamblingSession(state, id, 'draw');
        winGamblingSession(state, id, 'p1');
        assert.equal(balance(p1.id), 100);
        assert.equal(balance(p2.id), 100);
        assert.deepEqual(findGamblingSessionById(state, id), game);
    });

    it('findPendingGamblingSession finds only an open invite between the pair', () => {
        const p1 = fundedUser('p1@example.com', 'p1_user', 100);
        const p2 = fundedUser('p2@example.com', 'p2_user', 50);
        const p3 = fundedUser('p3@example.com', 'p3_user', 0);

        assert.equal(findPendingGamblingSession(state, p1.id, p2.id), null);
        const sessionId = initCoinFlip(state, 'heads', {
            p1: p1.id,
            p2: p2.id,
            betAmount: 10,
        })!;
        assert.equal(findPendingGamblingSession(state, p1.id, p2.id), sessionId);
        // direction and pending status both matter
        assert.equal(findPendingGamblingSession(state, p2.id, p1.id), null);
        assert.equal(findPendingGamblingSession(state, p1.id, p3.id), null);
        acceptGamblingSession(state, sessionId, p2.id);
        assert.equal(findPendingGamblingSession(state, p1.id, p2.id), null);
    });

    it('queryGamblingInvitations lists the invite for the opponent only', () => {
        const p1 = fundedUser('q1@example.com', 'q1_user', 100);
        const p2 = fundedUser('q2@example.com', 'q2_user', 0);
        const other = fundedUser('q3@example.com', 'q3_user', 0);

        const sessionId = initCoinFlip(state, 'heads', {
            p1: p1.id,
            p2: p2.id,
            betAmount: 10,
        })!;

        const invites = queryGamblingInvitations(state, p2.id);
        assert.equal(invites.length, 1);
        assert.equal(invites[0].id, sessionId);
        assert.equal(invites[0].p1Name, 'q1_user');
        assert.equal(queryGamblingInvitations(state, p1.id).length, 0);
        assert.equal(queryGamblingInvitations(state, other.id).length, 0);
    });

    it('acceptGamblingSession deducts the opponent and runs the game', () => {
        const p1 = fundedUser('a1@example.com', 'a1_user', 100);
        const p2 = fundedUser('a2@example.com', 'a2_user', 50);
        const sessionId = initCoinFlip(state, 'heads', {
            p1: p1.id,
            p2: p2.id,
            betAmount: 40,
        })!;

        assert.equal(acceptGamblingSession(state, sessionId, p2.id), 'success');
        assert.equal(balance(p2.id), 10);
        assert.equal(findGamblingSessionById(state, sessionId)?.status.type, 'running');
    });

    it('acceptGamblingSession rejects anyone but the invited player', () => {
        const p1 = fundedUser('r1@example.com', 'r1_user', 100);
        const p2 = fundedUser('r2@example.com', 'r2_user', 100);
        const bystander = fundedUser('r3@example.com', 'r3_user', 100);
        const sessionId = initCoinFlip(state, 'heads', {
            p1: p1.id,
            p2: p2.id,
            betAmount: 10,
        })!;

        assert.equal(acceptGamblingSession(state, sessionId, p1.id), 'invalid_session');
        assert.equal(acceptGamblingSession(state, sessionId, bystander.id), 'invalid_session');
        assert.equal(balance(bystander.id), 100);
        assert.equal(findGamblingSessionById(state, sessionId)?.status.type, 'pending');
    });

    it('acceptGamblingSession returns too_broke and keeps the session pending', () => {
        const p1 = fundedUser('t1@example.com', 't1_user', 100);
        const p2 = fundedUser('t2@example.com', 't2_user', 10);
        const sessionId = initCoinFlip(state, 'heads', {
            p1: p1.id,
            p2: p2.id,
            betAmount: 40,
        })!;

        assert.equal(acceptGamblingSession(state, sessionId, p2.id), 'too_broke');
        assert.equal(balance(p2.id), 10);
        assert.equal(findGamblingSessionById(state, sessionId)?.status.type, 'pending');
    });

    it('rejection refunds the challenger and marks the session rejected', () => {
        const p1 = fundedUser('j1@example.com', 'j1_user', 100);
        const p2 = fundedUser('j2@example.com', 'j2_user', 0);
        const sessionId = initCoinFlip(state, 'heads', {
            p1: p1.id,
            p2: p2.id,
            betAmount: 30,
        })!;

        cancelGamblingSession(state, sessionId, 'rejected', p2.id);
        assert.equal(balance(p1.id), 100);
        assert.equal(findGamblingSessionById(state, sessionId)?.status.type, 'rejected');
    });

    it('rejection by anyone but the invited player is a no-op', () => {
        const p1 = fundedUser('n1@example.com', 'n1_user', 100);
        const p2 = fundedUser('n2@example.com', 'n2_user', 0);
        const sessionId = initCoinFlip(state, 'heads', {
            p1: p1.id,
            p2: p2.id,
            betAmount: 30,
        })!;

        cancelGamblingSession(state, sessionId, 'rejected', p1.id);
        assert.equal(balance(p1.id), 70); // stake still held
        assert.equal(findGamblingSessionById(state, sessionId)?.status.type, 'pending');
    });

    it('expiry refunds the challenger without needing a userId', () => {
        const p1 = fundedUser('e1@example.com', 'e1_user', 100);
        const p2 = fundedUser('e2@example.com', 'e2_user', 0);
        const sessionId = initCoinFlip(state, 'heads', {
            p1: p1.id,
            p2: p2.id,
            betAmount: 30,
        })!;

        cancelGamblingSession(state, sessionId, 'expired');
        assert.equal(balance(p1.id), 100);
        assert.equal(findGamblingSessionById(state, sessionId)?.status.type, 'expired');
    });

    it('winGamblingSession pays the winner twice the stake', () => {
        const p1 = fundedUser('w1@example.com', 'w1_user', 100);
        const p2 = fundedUser('w2@example.com', 'w2_user', 100);
        const sessionId = initCoinFlip(state, 'heads', {
            p1: p1.id,
            p2: p2.id,
            betAmount: 40,
        })!;
        acceptGamblingSession(state, sessionId, p2.id);

        winGamblingSession(state, sessionId, 'p2');

        const game = findGamblingSessionById(state, sessionId);
        assert.equal(game?.status.type, 'ended');
        assert.equal(balance(p1.id), 60);
        // paid 40, received the 80 pot
        assert.equal(balance(p2.id), 140);
    });

    it('settling an ended session a second time pays nothing', () => {
        const p1 = fundedUser('d1@example.com', 'd1_user', 100);
        const p2 = fundedUser('d2@example.com', 'd2_user', 100);
        const sessionId = initCoinFlip(state, 'heads', {
            p1: p1.id,
            p2: p2.id,
            betAmount: 40,
        })!;
        acceptGamblingSession(state, sessionId, p2.id);
        winGamblingSession(state, sessionId, 'p1');

        winGamblingSession(state, sessionId, 'p2'); // stale timer fires late

        assert.equal(balance(p1.id), 140);
        assert.equal(balance(p2.id), 60);
    });

    it('winCoinFlip settles according to the stored result', () => {
        const p1 = fundedUser('c1@example.com', 'c1_user', 100);
        const p2 = fundedUser('c2@example.com', 'c2_user', 100);
        const sessionId = initCoinFlip(state, 'heads', {
            p1: p1.id,
            p2: p2.id,
            betAmount: 25,
        })!;
        acceptGamblingSession(state, sessionId, p2.id);

        winCoinFlip(state, sessionId);

        const row = coinFlipRow(sessionId);
        const game = findGamblingSessionById(state, sessionId);
        assert.equal(game?.gameType, 'coin_flip');
        assert.equal(game?.status.type, 'ended');
        if (game?.status.type !== 'ended') return;

        const expectedWinner = row.p1_bet === row.actual_result ? 'p1' : 'p2';
        assert.equal(game.status.winner, expectedWinner);
        assert.equal(game.status.flipResult, row.actual_result as CoinSide);
        assert.equal(balance(expectedWinner === 'p1' ? p1.id : p2.id), 125);
        assert.equal(balance(expectedWinner === 'p1' ? p2.id : p1.id), 75);
    });

    it('notification follows the session lifecycle', () => {
        const p1 = fundedUser('f1@example.com', 'f1_user', 100);
        const p2 = fundedUser('f2@example.com', 'f2_user', 100);
        const sessionId = initCoinFlip(state, 'heads', {
            p1: p1.id,
            p2: p2.id,
            betAmount: 10,
        })!;

        assert.deepEqual(queryUserNotification(state, p2.id), {
            type: 'gambling_invite',
            inviterName: 'f1_user',
            sessionId,
        });
        assert.equal(queryUserNotification(state, p1.id), null);

        acceptGamblingSession(state, sessionId, p2.id);
        assert.deepEqual(queryUserNotification(state, p1.id), {
            type: 'return_to_gambling',
            opponentName: 'f2_user',
            sessionId,
        });
        assert.deepEqual(queryUserNotification(state, p2.id), {
            type: 'return_to_gambling',
            opponentName: 'f1_user',
            sessionId,
        });

        winCoinFlip(state, sessionId);
        assert.equal(queryUserNotification(state, p1.id), null);
        assert.equal(queryUserNotification(state, p2.id), null);
    });
});
