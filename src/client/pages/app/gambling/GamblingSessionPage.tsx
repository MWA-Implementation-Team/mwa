import { Trans } from '#src/client/ui/Trans.js';
import { gamblingPendingExpiryMinutes } from '#src/client/constants.js';
import { ClientContext } from '#src/client/context.js';
import { Page } from '#src/client/pages.js';
import { CoinSide, Gambler, RunningGame } from '#src/db/gambling/index.js';
import { useContext, useEffect, useState } from 'preact/hooks';
import { Language, TranslateFn } from '#src/client/language.js';
import PageShell from '../PageShell.js';
import { displayActor } from '#src/client/display.js';

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

const titleKeys: Record<RunningGame['status']['type'], keyof Language> = {
    pending: 'titleGamblingRequest',
    expired: 'titleGamblingExpired',
    rejected: 'titleGamblingRejected',
    running: 'titleGamblingCoinFlip', // coin flip is the only game for now
    ended: 'titleGamblingCoinFlip',
};

function title(t: TranslateFn, game: RunningGame): string {
    return t(titleKeys[game.status.type]);
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
            if (currentGame.p2 === user?.id) {
                return (
                    <PageShell section="gambling" hideNotification={true}>
                        <section class="mwa-panel">
                            <div class="mwa-panel-head">
                                <h2>{t('gamblingRequest')}</h2>
                            </div>
                            <div class="mwa-panel-body">
                                <p class="mwa-intro">
                                    {t('gamblingCoinFlipChallenged', {
                                        player: displayActor(currentGame.p1Name, user, t),
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
                                <h2>
                                    {t('gamblingWaiting', {
                                        player: displayActor(currentGame.p2Name, user, t),
                                    })}
                                </h2>
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
                                    player: displayActor(currentGame.p2Name, user, t),
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
                                {t('gamblingRejectedDetails', {
                                    player: displayActor(currentGame.p2Name, user, t),
                                })}
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
                        <div class="mwa-panel-head">
                            <h2>{t('gamblingCoinFlip')}</h2>
                        </div>
                        <div class="mwa-panel-body">
                            <p class="mwa-intro">
                                {t('gamblingVersus', {
                                    p1: displayActor(currentGame.p1Name, user, t),
                                    p2: displayActor(currentGame.p2Name, user, t),
                                })}
                            </p>
                            {currentGame.status.type === 'ended' ? (
                                <>
                                    <h3>{t(coinSideTrans(currentGame.status.flipResult))}</h3>
                                    <p>
                                        {side && side === currentGame.status.winner
                                            ? t('gamblingYouWin')
                                            : t('gamblingWinner', {
                                                  player:
                                                      currentGame.status.winner === 'p1'
                                                          ? displayActor(
                                                                currentGame.p1Name,
                                                                user,
                                                                t,
                                                            )
                                                          : displayActor(
                                                                currentGame.p2Name,
                                                                user,
                                                                t,
                                                            ),
                                              })}
                                    </p>
                                </>
                            ) : (
                                <p class="mwa-muted">{t('gamblingCoinFlipping')}</p>
                            )}
                        </div>
                    </section>
                </PageShell>
            );
        }
    }
}

function coinSideTrans(side: CoinSide) {
    return side === 'heads' ? 'gamblingHeads' : 'gamblingTails';
}
