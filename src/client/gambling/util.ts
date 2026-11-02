import { CoinSide, Gambler, RunningGame } from '#src/db/gambling/index.js';

export function coinSideTrans(side: CoinSide) {
    return side === 'heads' ? 'gamblingHeads' : 'gamblingTails';
}

export function sideName(game: RunningGame, gambler: Gambler) {
    return gambler === 'p1' ? game.p1Name : game.p2Name;
}
