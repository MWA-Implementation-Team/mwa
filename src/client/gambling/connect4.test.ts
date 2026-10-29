import { describe, it } from "node:test";
import assert from 'node:assert/strict';
import { Connect4Board } from "./connect4.js";

describe('connect 4', () => {
    it('encodes to string correctly', () => {
        const board = Connect4Board.fromString(`
        .......
        .......
        .......
        .......
        .ox....
        xox....
        `);
        const str = board.asString();
        const parsedBoard = Connect4Board.fromString(str);
        const parsedStr = parsedBoard.asString();
        assert.equal(str, parsedStr);
    });

    it('wins', () => {
        const none = Connect4Board.fromString(`
        .......
        .......
        .......
        .......
        .ox....
        xox....
        `);
        assert.equal(none.winner(), null);

        const horizontal = Connect4Board.fromString(`
        .......
        .......
        .......
        ....x..
        ....xxx
        ...oooo
        `);
        assert.equal(horizontal.winner(), 'o');

        const vertical = Connect4Board.fromString(`
        .......
        .......
        ....x..
        ....xo.
        ....xo.
        ....xo.
        `);
        assert.equal(vertical.winner(), 'x');

        const diag1 = Connect4Board.fromString(`
        ....o..
        ....x..
        ...xxx.
        ..xoxoo
        .xxooxo
        oxoxoxo
        `);
        assert.equal(diag1.winner(), 'x');

        const diag2 = Connect4Board.fromString(`
        x...o.x
        o.o.oxo
        o.ooxxx
        x.xxoox
        o.oxxxo
        oxooxxx
        `);
        assert.equal(diag2.winner(), 'x');

        const diag3 = Connect4Board.fromString(`
        ......x
        ...x..x
        o.ox..o
        x.oo.ox
        xoxooxx
        xoxxooo
        `);
        assert.equal(diag3.winner(), 'o');

        const diag4 = Connect4Board.fromString(`
        x.xoo.o
        o.oxo.x
        xxxooox
        xooxxxo
        oxxooox
        xoxxxoo
        `);
        assert.equal(diag4.winner(), 'o');
    });
});
