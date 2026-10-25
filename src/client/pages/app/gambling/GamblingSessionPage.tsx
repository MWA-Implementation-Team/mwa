import { Trans } from '#src/client/ui/Trans.js';
import { gamblingPendingExpiryMinutes } from '#src/client/constants.js';
import { ClientContext } from '#src/client/context.js';
import { Page } from '#src/client/pages.js';
import Header from '#src/client/ui/Header.js';
import { CoinSide, Gambler, RunningGame } from '#src/db/gambling.js';
import { useContext, useEffect, useState } from 'preact/hooks';

type GamblingSessionPageProps = {
    sessionId: number;
    game: RunningGame;
    message?: 'gamblingInsufficientCoins';
};

export const gamblingSessionPagie: Page<GamblingSessionPageProps> = {
    Component: GamblingSessionPage,
    title: (t, props) => {
        switch (props.game.status.type) {
            case 'pending':
                return t('titleGamblingRequest');
            case 'expired':
                return t('titleGamblingExpired');
            case 'rejected':
                return t('titleGamblingRejected');
            case 'running':
            case 'ended':
                switch (props.game.gameType) {
                    case 'coin_flip':
                        return t('titleGamblingCoinFlip');
                }
        }
    },
};

function GamblingSessionPage({ sessionId, game, message }: GamblingSessionPageProps) {
    const { user, t } = useContext(ClientContext);
    const [currentGame, setCurrentGame] = useState(game);
    const [isDisconnected, setIsDisconnected] = useState(false);

    let side: Gambler | null = null;
    if (user?.id === game.p1) side = 'p1';
    if (user?.id === game.p2) side = 'p2';

    useEffect(() => {
        const updates = new EventSource(`/app/gambling/sessions/${sessionId}/watch`);
        updates.onmessage = (msg) => {
            setCurrentGame(JSON.parse(msg.data as string));
        };
        updates.onopen = () => setIsDisconnected(false);
        updates.onerror = () => setIsDisconnected(true);
        return () => updates.close();
    }, [sessionId]);

    switch (currentGame.status.type) {
        case 'pending': {
            if (currentGame.p2 === user!.id) {
                return (
                    <>
                        <Header hideNotifications={true} />
                        <h1>{t('gamblingRequest')}</h1>
                        <p>{t('gamblingCoinFlipChallenged', { player: currentGame.p1Name })}</p>
                        <p>
                            <Trans
                                id="gamblingCoinFlipBetDetails"
                                values={{
                                    amount: <strong>{game.betAmount}</strong>,
                                    side: (
                                        <strong>{t(coinSideTrans(game.p1Guess))}</strong>
                                    ),
                                }}
                            />
                        </p>
                        <p>
                            <Trans
                                id="gamblingCoinFlipBetOutcome"
                                values={{ amount: <strong>{game.betAmount}</strong> }}
                            />
                        </p>
                        <p>{t('gamblingAcceptQuestion')}</p>
                        <form method="POST">
                            <button
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
                        {message && <span>{t(message)}</span>}
                    </>
                );
            } else {
                return (
                    <>
                        <Header hideNotifications={true} />
                        {isDisconnected ? (
                            <span>
                                {t('gamblingDisconnected')}.{' '}
                                <a href="">{t('gamblingRefreshQuestion')}</a>
                            </span>
                        ) : null}
                        <h1>{t('gamblingWaiting', { player: game.p2Name })}</h1>
                        <span>{t('gamblingWaitingHelp')}</span>
                    </>
                );
            }
        }
        case 'expired': {
            return (
                <>
                    <Header />
                    <h1>{t('gamblingExpired')}</h1>
                    <span>
                        {t('gamblingExpiryDetails', {
                            player: currentGame.p2Name,
                            minutes: String(gamblingPendingExpiryMinutes),
                        })}
                    </span>
                </>
            );
        }
        case 'rejected': {
            return (
                <>
                    <Header />
                    <h1>{t('gamblingRejected')}</h1>
                    <span>{t('gamblingRejectedDetails', { player: currentGame.p2Name })}</span>
                </>
            );
        }
        case 'running':
        case 'ended': {
            return (
                <>
                    <Header hideNotifications={currentGame.status.type === 'running'} />
                    {isDisconnected ? (
                        <span>
                            {t('gamblingDisconnected')}.{' '}
                            <a href="">{t('gamblingRefreshQuestion')}</a>
                        </span>
                    ) : null}
                    <h1>Coin flip duel</h1>
                    <p>{t('gamblingVersus', { p1: currentGame.p1Name, p2: currentGame.p2Name })}</p>
                    {currentGame.status.type === 'ended' ? (
                        <>
                            <h2>{t(coinSideTrans(currentGame.status.flipResult))}</h2>
                            <h3>
                                {side && side === currentGame.status.winner
                                    ? t('gamblingYouWin')
                                    : t('gamblingWinner', {
                                          player:
                                              currentGame.status.winner === 'p1'
                                                  ? currentGame.p1Name
                                                  : currentGame.p2Name,
                                      })}{' '}
                            </h3>
                        </>
                    ) : (
                        <h2>{t('gamblingCoinFlipping')}</h2>
                    )}
                </>
            );
        }
    }
}

function coinSideTrans(side: CoinSide) {
    return side === 'heads' ? 'gamblingHeads' : 'gamblingTails';
}
