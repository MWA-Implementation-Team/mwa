import { Gambler } from '#src/db/gambling.js';

export type PlayerTurnTime = {
    // base how much time the player has remaining
    baseTimeLeftMs: number;
    // if its currently their turn, this is the unix time when their turn started
    turnStartedTimeMs?: number;
};

export function calcTurnTimeLeftMs(time: PlayerTurnTime): number {
    if (time.turnStartedTimeMs === undefined) {
        return time.baseTimeLeftMs;
    }

    return Math.max(0, time.baseTimeLeftMs - (Date.now() - time.turnStartedTimeMs));
}

export type MatchTurn = {
    player: Gambler;
    timeMs: number;
};

export function calcPlayerTurnTime(
    turns: MatchTurn[],
    player: Gambler,
    totalTimeMs: number,
): PlayerTurnTime {
    let baseTimeLeftMs = totalTimeMs;
    let turnStartedTimeMs: number | undefined;

    for (let i = 0; i < turns.length; i++) {
        if (turns[i].player === player) continue;

        if (turns[i + 1]) {
            baseTimeLeftMs -= turns[i + 1].timeMs - turns[i].timeMs;
            continue;
        } else {
            turnStartedTimeMs = turns[i].timeMs;
        }
    }

    return { baseTimeLeftMs: Math.max(0, baseTimeLeftMs), turnStartedTimeMs };
}
