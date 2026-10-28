import { describe, it } from "node:test";
import assert from 'node:assert/strict';
import { Connect4Board } from "./connect4.js";

describe('connect 4', () => {
    it('encodes to string correctly', () => {
        const board = Connect4Board.fromString(`
        .......
        .o.oxoo
        ..x....
        x..xxx.
        x.x....
        .x.xxx.
        `);
        const str = board.asString();
        const parsedBoard = Connect4Board.fromString(str);
        const parsedStr = parsedBoard.asString();
        assert.equal(str, parsedStr);
    });

    it('wins', () => {
        const none = Connect4Board.fromString(`
        .......
        .o.oxoo
        ..x....
        x..xxx.
        x.x....
        .x.xxx.
        `);
        assert.equal(none.winner(), null);

        const horizontal = Connect4Board.fromString(`
        .......
        ...oooo
        .......
        ...xxx.
        ..x....
        .x.xxx.
        `);
        assert.equal(horizontal.winner(), 'o');

        const vertical = Connect4Board.fromString(`
        .......
        ....xo.
        ....x..
        ....xo.
        ....xo.
        .....o.
        `);
        assert.equal(vertical.winner(), 'x');

        const diag1 = Connect4Board.fromString(`
        .....o.
        ....x..
        ...x...
        ..x....
        .xo....
        .......
        `);
        assert.equal(diag1.winner(), 'x');

        const diag2 = Connect4Board.fromString(`
        ......x
        .....x.
        ....x..
        ...x...
        ..o....
        .......
        `);
        assert.equal(diag2.winner(), 'x');

        const diag3 = Connect4Board.fromString(`
        .......
        .......
        ..o....
        ...o...
        ....o..
        .....o.
        `);
        assert.equal(diag3.winner(), 'o');

        const diag4 = Connect4Board.fromString(`
        ...o...
        ....o..
        .....o.
        ......o
        .......
        .......
        `);
        assert.equal(diag4.winner(), 'o');
    });
});
