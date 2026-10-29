import { Trans } from '#src/client/ui/Trans.js';
import { gamblingPendingExpiryMinutes } from '#src/client/constants.js';
import { ClientContext } from '#src/client/context.js';
import { Page } from '#src/client/pages.js';
import { CoinFlipGame, CoinSide, Connect4Game, Gambler, RunningGame } from '#src/db/gambling.js';
import { useContext, useEffect, useState } from 'preact/hooks';
import { Language, TranslateFn } from '#src/client/language.js';
import PageShell from '../PageShell.js';
import { C4Cell, c4Height, c4Width, Connect4Board } from '#src/client/gambling/connect4.js';
import { ComponentChildren } from 'preact';

type GamblingSessionPageProps = {
    sessionId: number;
    game: RunningGame;
    message?: keyof Language;
};

export const gamblingSessionPage: Page<GamblingSessionPageProps> = {
    Component: GamblingSessionPage,
    title: (t, props) => title(t, props.game),
    customTitle: true,
};

function title(t: TranslateFn, game: RunningGame): string {
    switch (game.status.type) {
        case 'pending':
            return t('titleGamblingRequest');
        case 'expired':
            return t('titleGamblingExpired');
        case 'rejected':
            return t('titleGamblingRejected');
        case 'running':
        case 'ended':
            switch (game.gameType) {
                case 'coin_flip':
                    return t('titleGamblingCoinFlip');
                case 'connect_4':
                    return t('titleGamblingCoinFlip');
            }
    }
}

function GamblingSessionPage({ sessionId, game, message }: GamblingSessionPageProps) {
    const { user, t } = useContext(ClientContext);
    const [currentGame, setCurrentGame] = useState(game);
    const [isDisconnected, setIsDisconnected] = useState(false);

    let side: Gambler | null = null;
    if (user?.id === currentGame.p1) side = 'p1';
    if (user?.id === currentGame.p2) side = 'p2';

    useEffect(() => {
        const updates = new EventSource(`/app/gambling/sessions/${sessionId}/watch`);
        updates.onmessage = (msg) => {
            setCurrentGame(JSON.parse(msg.data as string));
        };
        updates.onopen = () => setIsDisconnected(false);
        updates.onerror = () => setIsDisconnected(true);
        return () => updates.close();
    }, [sessionId]);

    useEffect(() => {
        document.title = title(t, currentGame);
    }, [currentGame, t]);

    const disconnected = isDisconnected ? (
        <p class="mwa-note mwa-note--error" role="alert">
            {t('gamblingDisconnected')}. <a href="">{t('gamblingRefreshQuestion')}</a>
        </p>
    ) : null;

    switch (currentGame.status.type) {
        case 'pending': {
            if (currentGame.p2 == user?.id) {
                return (
                    <PageShell section="gambling" hideNotification={true}>
                        <section class="mwa-panel">
                            <div class="mwa-panel-head">
                                <h2>{t('gamblingRequest')}</h2>
                            </div>
                            <div class="mwa-panel-body">
                                <PendingProposal t={t} currentGame={currentGame} />
                                <p>{t('gamblingAcceptQuestion')}</p>
                                <form method="POST" class="mwa-actions">
                                    <button
                                        class="btn-primary"
                                        formaction={`/app/gambling/sessions/${sessionId}/accept`}
                                        type="submit"
                                    >
                                        {t('gamblingAccept')}
                                    </button>
                                    <button
                                        formaction={`/app/gambling/sessions/${sessionId}/reject?goto=${encodeURIComponent('/app')}`}
                                        type="submit"
                                    >
                                        {t('gamblingReject')}
                                    </button>
                                </form>
                                {message && (
                                    <p class="mwa-note mwa-note--error" role="alert">
                                        {t(message)}
                                    </p>
                                )}
                            </div>
                        </section>
                    </PageShell>
                );
            } else {
                return (
                    <PageShell section="gambling" hideNotification={true}>
                        {disconnected}
                        <section class="mwa-panel">
                            <div class="mwa-panel-head">
                                <h2>{t('gamblingWaiting', { player: currentGame.p2Name })}</h2>
                            </div>
                            <div class="mwa-panel-body">
                                <p class="mwa-muted">{t('gamblingWaitingHelp')}</p>
                            </div>
                        </section>
                    </PageShell>
                );
            }
        }
        case 'expired': {
            return (
                <PageShell section="gambling">
                    <section class="mwa-panel">
                        <div class="mwa-panel-head">
                            <h2>{t('gamblingExpired')}</h2>
                        </div>
                        <div class="mwa-panel-body">
                            <p class="mwa-muted">
                                {t('gamblingExpiryDetails', {
                                    player: currentGame.p2Name,
                                    minutes: String(gamblingPendingExpiryMinutes),
                                })}
                            </p>
                        </div>
                    </section>
                </PageShell>
            );
        }
        case 'rejected': {
            return (
                <PageShell section="gambling">
                    <section class="mwa-panel">
                        <div class="mwa-panel-head">
                            <h2>{t('gamblingRejected')}</h2>
                        </div>
                        <div class="mwa-panel-body">
                            <p class="mwa-muted">
                                {t('gamblingRejectedDetails', { player: currentGame.p2Name })}
                            </p>
                        </div>
                    </section>
                </PageShell>
            );
        }
        case 'running':
        case 'ended': {
            return (
                <PageShell
                    section="gambling"
                    hideNotification={currentGame.status.type === 'running'}
                >
                    {disconnected}
                    <section class="mwa-panel">
                        {currentGame.gameType === 'coin_flip' && <CoinFlipping t={t} currentGame={currentGame} side={side} />}
                        {currentGame.gameType === 'connect_4' && <Connect4View sessionId={sessionId} t={t} currentGame={currentGame} side={side} />}
                    </section>
                </PageShell>
            );
        }
    }
}

function PendingProposal({ t, currentGame }: { t: TranslateFn, currentGame: RunningGame }) {
    switch (currentGame.gameType) {
        case 'coin_flip':
            return (
                <>
                    <p class="mwa-intro">
                        {t('gamblingCoinFlipChallenged', {
                            player: currentGame.p1Name,
                        })}
                    </p>
                    <p>
                        <Trans
                            id="gamblingCoinFlipBetDetails"
                            values={{
                                amount: <strong>{currentGame.betAmount}</strong>,
                                side: (
                                    <strong>
                                        {t(coinSideTrans(currentGame.p1Guess))}
                                    </strong>
                                ),
                            }}
                        />
                    </p>
                    <p>
                        <Trans
                            id="gamblingCoinFlipBetOutcome"
                            values={{
                                amount: <strong>{currentGame.betAmount}</strong>,
                            }}
                        />
                    </p>
                </>
            );
        case 'connect_4':
            return (
                <>
                    <p class="mwa-intro">
                        {currentGame.p1Name} invites you to a Connect 4 duel.
                    </p>
                </>
            );
    }
}

function CoinFlipping({ t, currentGame, side }: { t: TranslateFn, currentGame: CoinFlipGame, side: Gambler | null }) {
    return (
        <>
            <div class="mwa-panel-head">
                <h2>{t('gamblingCoinFlip')}</h2>
            </div>
            <div class="mwa-panel-body">
                <p class="mwa-intro">
                    {t('gamblingVersus', {
                        p1: currentGame.p1Name,
                        p2: currentGame.p2Name,
                    })}
                </p>
                {currentGame.status.type === 'ended' ? (
                    <>
                        {<h3>{t(coinSideTrans(currentGame.status.flipResult))}</h3>}
                        <p>
                            {side === currentGame.status.winner
                                ? t('gamblingYouWin')
                                : t('gamblingWinner', {
                                    player:
                                        sideName(currentGame, currentGame.status.winner),
                                })}
                        </p>
                    </>
                ) : (
                    <p class="mwa-muted">{t('gamblingCoinFlipping')}</p>
                )}
            </div>
        </>
    )
}

function Connect4View({ sessionId, t, currentGame, side }: { sessionId: number, t: TranslateFn, currentGame: Connect4Game, side: Gambler | null }) {
    const board = Connect4Board.fromString(currentGame.boardStr);

    function color(side: Gambler | C4Cell) {
        switch (side) {
            case 'p1':
            case 'x':
                return '#ff0000';
            case 'p2':
            case 'o':
                return '#00ff00'
            default:
                return null;
        }
    }

    const isYourTurn = currentGame.nextTurn === side && currentGame.status.type === 'running';

    let status: ComponentChildren;
    if (currentGame.status.type === 'ended') {
        if (side === currentGame.status.winner) {
            status = <h1>{t('gamblingYouWin')}</h1>;
        } else if (currentGame.status.winner === 'draw') {
            status = <h1>{t('gamblingDraw')}</h1>;
        } else {
            status = <h1>{t('gamblingWinner', {
                player:
                    sideName(currentGame, currentGame.status.winner),
            })}</h1>
        }
    } else {
        if (currentGame.nextTurn === side) {
            status = <h1 style={{ color: color(side) }}>YOUR TURN</h1>;
        } else {
            status = <h1 style={{ color: color(currentGame.nextTurn) }}>{sideName(currentGame, currentGame.nextTurn)}'s turn</h1>;
        }
    }

    const winCells = board.winner()?.cells ?? [];

    function isWinCell(x: number, y: number): boolean {
        return winCells.some(p => p.x === x && p.y === y);
    }

    return (
        <>
            <form method="POST" action={`/app/gambling/sessions/${sessionId}/c4-place`}>
                <table>
                    <tbody>
                        {Array.from({ length: c4Height }, (_, y) => (
                            <tr key={y}>
                                {Array.from({ length: c4Width }, (_, x) => (

                                    <td
                                        key={x}
                                    >
                                        <button
                                            type="submit"
                                            name="x"
                                            value={x}
                                            disabled={!isYourTurn}
                                            style={{ backgroundColor: color(board.get(x, c4Height - 1 - y)), display: 'flex', width: '2.5rem', height: '2.5rem', padding: 0 }}
                                        >
                                            {isWinCell(x, c4Height - 1 - y) && 'x'}
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h2>{status}</h2>
            </form>
        </>
    );
}

function coinSideTrans(side: CoinSide) {
    return side === 'heads' ? 'gamblingHeads' : 'gamblingTails';
}

function sideName(game: RunningGame, gambler: Gambler) {
    return gambler === 'p1' ? game.p1Name : game.p2Name;
}
