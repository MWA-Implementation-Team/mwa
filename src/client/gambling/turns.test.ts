import { describe, it } from "node:test";
import assert from 'node:assert/strict';
import { calcPlayerTurnTime, MatchTurn } from "./turns.js";

describe('turns', () => {
    it('correctly calculates player turn time', () => {
        const turns: MatchTurn[] = [
            { player: 'p2', timeMs: 50 },
            { player: 'p1', timeMs: 75 },
            { player: 'p2', timeMs: 105 },
            { player: 'p1', timeMs: 145 },
        ];
        const p1 = calcPlayerTurnTime(turns, 'p1', 200);
        assert.equal(p1.baseTimeLeftMs, 200 - (25 + 40));
        assert.equal(p1.turnStartedTimeMs, undefined);

        const p2 = calcPlayerTurnTime(turns, 'p2', 200);
        assert.equal(p2.baseTimeLeftMs, 200 - 30);
        assert.equal(p2.turnStartedTimeMs, 145);
    });
});

