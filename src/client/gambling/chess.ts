import { Chess } from 'chess.js';

export function restoreChess(moves: readonly string[]): Chess {
    const chess = new Chess();
    for (const move of moves) {
        chess.move(move);
    }
    return chess;
}
