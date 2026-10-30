import { useContext, useEffect, useState } from 'preact/hooks';
import { Square, PieceSymbol, SQUARES } from 'chess.js';
import { ChessGame, Gambler } from '#src/db/gambling/index.js';
import { restoreChess } from '#src/client/gambling/chess.js';
import { ClientContext } from '#src/client/context.js';
import { displayActor } from '#src/client/display.js';
import { ChessPieceIcon } from '#src/client/ui/icons.js';
import { TurnTimeLeftDisplay } from '#src/client/ui/TurnTimeLeftDisplay.js';
import { Language } from '#src/client/language.js';

export function ChessView({
    sessionId,
    game,
    side,
}: {
    sessionId: number;
    game: ChessGame;
    side: Gambler | null;
}) {
    const { t, user } = useContext(ClientContext);
    const [selected, setSelected] = useState<Square | null>(null);
    const [promotion, setPromotion] = useState<PieceSymbol>('q');
    const chess = restoreChess(game.moves);
    const isYourTurn = game.status.type === 'running' && game.nextTurn === side;

    useEffect(() => setSelected(null), [game.moves.length, game.status.type]);

    let destinations: Square[] = [];
    let canPromote = false;
    if (selected && isYourTurn) {
        const moves = chess.moves({ square: selected, verbose: true });
        destinations = moves.map((move) => move.to);
        canPromote = moves.some((move) => move.promotion !== undefined);
    }

    let squares = SQUARES;
    if (side !== null && side !== game.whitePlayer) {
        squares = [...SQUARES].reverse();
    }

    let status: string;
    if (game.status.type === 'ended') {
        if (game.status.winner === 'draw') {
            status = t('gamblingDraw');
        } else if (game.status.winner === side) {
            status = t('gamblingYouWin');
        } else {
            const winnerName = game.status.winner === 'p1' ? game.p1Name : game.p2Name;
            status = t('gamblingWinner', {
                player: displayActor(winnerName, user, t),
            });
        }
    } else {
        const playerName = game.nextTurn === 'p1' ? game.p1Name : game.p2Name;
        status = t('gamblingChessTurn', {
            player: displayActor(playerName, user, t),
        });
        if (chess.isCheck()) {
            status += ` - ${t('gamblingChessCheck')}`;
        }
    }

    return (
        <>
            <div class="mwa-panel-head">
                <h2>{t('gamblingChess')}</h2>
            </div>
            <div class="mwa-panel-body">
                <form method="POST" action={`/app/gambling/sessions/${sessionId}/chess-move`}>
                    <input type="hidden" name="from" value={selected ?? ''} />
                    <input type="hidden" name="move_count" value={game.moves.length} />
                    <input type="hidden" name="promotion" value={promotion} />

                    <table class="mwa-chess-board">
                        <tbody>
                            {Array.from({ length: 8 }, (_, row) => (
                                <tr key={row}>
                                    {squares.slice(row * 8, row * 8 + 8).map((square, col) => {
                                        const piece = chess.get(square);
                                        const canMoveTo = destinations.includes(square);
                                        const canSelect =
                                            isYourTurn && piece?.color === chess.turn();

                                        return (
                                            <td key={square}>
                                                <button
                                                    type={canMoveTo ? 'submit' : 'button'}
                                                    name={canMoveTo ? 'to' : undefined}
                                                    value={square}
                                                    class="mwa-chess-square"
                                                    data-dark={(row + col) % 2 !== 0}
                                                    data-legal={canMoveTo}
                                                    disabled={!canMoveTo && !canSelect}
                                                    onClick={() => {
                                                        if (!canMoveTo) {
                                                            setSelected(
                                                                selected === square ? null : square,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {piece && (
                                                        <ChessPieceIcon
                                                            type={piece.type}
                                                            color={piece.color}
                                                        />
                                                    )}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div class="mwa-actions">
                        <div>
                            {t(game.whitePlayer === 'p1' ? 'gamblingChessWhite' : 'gamblingChessBlack')}
                            : {displayActor(game.p1Name, user, t)}
                            <TurnTimeLeftDisplay turn={game.p1TurnTime} />
                        </div>
                        <div>
                            {t(game.whitePlayer === 'p2' ? 'gamblingChessWhite' : 'gamblingChessBlack')}
                            : {displayActor(game.p2Name, user, t)}
                            <TurnTimeLeftDisplay turn={game.p2TurnTime} />
                        </div>
                    </div>

                    <p role="status">{status}</p>

                    {canPromote && (
                        <>
                            <label for="chess-promotion">{t('gamblingChessPromotion')}</label>
                            <select
                                id="chess-promotion"
                                value={promotion}
                                onChange={(event) =>
                                    setPromotion(event.currentTarget.value as PieceSymbol)
                                }
                            >
                                {(['q', 'r', 'b', 'n'] as const).map((piece) => (
                                    <option key={piece} value={piece}>
                                        {t(pieceTrans(piece))}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}
                </form>
            </div>
        </>
    );
}

function pieceTrans(symbol: PieceSymbol): keyof Language {
    switch (symbol) {
        case 'p':
            return 'gamblingChessPawn';
        case 'n':
            return 'gamblingChessKnight';
        case 'b':
            return 'gamblingChessBishop';
        case 'r':
            return 'gamblingChessRook';
        case 'q':
            return 'gamblingChessQueen';
        case 'k':
            return 'gamblingChessKing';
    }
}
