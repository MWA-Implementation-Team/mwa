import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Connect4Board } from './connect4.js';

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
        checkWinner(horizontal);

        const vertical = Connect4Board.fromString(`
        .......
        .......
        ....x..
        ....xo.
        ....xo.
        ....xo.
        `);
        checkWinner(vertical);

        const diag1 = Connect4Board.fromString(`
        ....o..
        ....x..
        ...xxx.
        ..xoxoo
        .xxooxo
        oxoxoxo
        `);
        checkWinner(diag1);

        const diag2 = Connect4Board.fromString(`
        x...o.x
        o.o.oxo
        o.ooxxx
        x.xxoox
        o.oxxxo
        oxooxxx
        `);
        checkWinner(diag2);

        const diag3 = Connect4Board.fromString(`
        ......x
        ...x..x
        o.ox..o
        x.oo.ox
        xoxooxx
        xoxxooo
        `);
        checkWinner(diag3);

        const diag4 = Connect4Board.fromString(`
        x.xoo.o
        o.oxo.x
        xxxooox
        xooxxxo
        oxxooox
        xoxxxoo
        `);
        checkWinner(diag4);
    });
});

function checkWinner(board: Connect4Board) {
    const win = board.winner();
    assert.ok(win);

    assert.equal(win.cells.length, 4);
    for (const point of win.cells) {
        assert.equal(board.get(point.x, point.y), win.player);
    }
}
