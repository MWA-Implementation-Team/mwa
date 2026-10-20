import { MwaState } from '#src/state.js';

export type GameType = 'coin_flip';

export type RunningGame = {
    type: GameType;
    p1Name: string;
    p2Name: string;
};

export type CommonGameOpts = {
    p1: number;
    p2: number;
    betAmount: number;
};

export function queryGames(state: MwaState): RunningGame[] {
    const query = state.prepare(`
    SELECT game_type, p1u.username AS p1, p2u.username AS p2 FROM gambling_sessions
    LEFT JOIN users AS p1u ON gambling_sessions.p1 = p1u.id
    LEFT JOIN users AS p2u ON gambling_sessions.p2 = p2u.id
    WHERE winner_tx IS NULL
    `);
    return query.all().map((row) => {
        return {
            type: row.game_type as GameType,
            p1Name: row.p1 as string,
            p2Name: row.p2 as string,
        };
    });
}

export function initGame(state: MwaState, type: GameType, opts: CommonGameOpts): number {
    const insert = state.prepare(`
    INSERT INTO gambling_sessions (p1, p2, bet_amount, game_type)
    VALUES (?, ?, ?, ?)
    RETURNING id
    `);
    const row = insert.get(opts.p1, opts.p2, opts.betAmount, type);
    return row!.id as number;
}

export type CoinSide = 'heads' | 'tails';

//export function initCoinFlip(state: MwaState, bet: CoinSide, opts: CommonGameOpts) {
//    state.db.exec('BEGIN');
//    initGame(state, 'coin_flip', opts);
//    state.db.exec('COMMIT');
//}
