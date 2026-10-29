import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Connect4Board } from './connect4.js';

describe('connect 4', () => {
    it('encodes to string correctly', () => {
        const board = Connect4Board.fromString(`
        .......
        ...oxo.
        ...ooo.
        x.oxxx.
        x.xoxo.
        oxoxxx.
        `);
        const str = board.asString();
        const parsedBoard = Connect4Board.fromString(str);
        const parsedStr = parsedBoard.asString();
        assert.equal(str, parsedStr);
    });

    it('wins', () => {
        const none = Connect4Board.fromString(`
        .......
        ...oxo.
        ...ooo.
        x.oxxx.
        x.xoxo.
        oxoxxx.
        `);
        assert.equal(none.winner(), null);

        const horizontal = Connect4Board.fromString(
            `
        .......
        ...OOOO
        ...xoxo
        ...xxxo
        ..xooox
        .xoxxxo
        `.toLowerCase(),
        );
        checkWinner(horizontal);

        const vertical = Connect4Board.fromString(
            `
        .......
        .......
        ....X..
        ...oXo.
        ...oXo.
        ...oXoo
        `.toLowerCase(),
        );
        checkWinner(vertical);

        const diag1 = Connect4Board.fromString(
            `
        .......
        ....X..
        ...Xx..
        ..Xxo..
        .Xooo..
        .ooxo..
        `.toLowerCase(),
        );
        checkWinner(diag1);

        const diag2 = Connect4Board.fromString(
            `
        ......X
        .....Xo
        ....Xxx
        ...Xoxo
        ..ooxoo
        ..xxxoo
        `.toLowerCase(),
        );
        checkWinner(diag2);

        const diag3 = Connect4Board.fromString(
            `
        .......
        .......
        ..O....
        ..oO...
        ..xoO..
        ..xxxO.
        `.toLowerCase(),
        );
        checkWinner(diag3);

        const diag4 = Connect4Board.fromString(
            `
        ...O...
        ...xO..
        ...oxO.
        ...xxoO
        ...oxxo
        ...ooox
        `.toLowerCase(),
        );
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
