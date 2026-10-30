import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import { Page } from '#src/client/pages.js';
import { GameType, Invitation, SessionSummary } from '#src/db/gambling/index.js';
import PageShell from '../PageShell.js';
import { Language } from '#src/client/language.js';
import { displayActor } from '#src/client/display.js';

type GamblingPageProps = {
    sessions: SessionSummary[];
    invitations: Invitation[];
};

export const gamblingPage: Page<GamblingPageProps> = {
    Component: GamblingPage,
    title: (t) => t('titleGambling'),
};

function GamblingPage({ sessions, invitations }: GamblingPageProps) {
    const { t, user } = useContext(ClientContext);
    return (
        <PageShell section="gambling">
            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('gamblingInvitations')}</h2>
                </div>
                <div class="mwa-panel-body">
                    {invitations.length === 0 ? (
                        <p class="mwa-muted">{t('gamblingNoInvitations')}</p>
                    ) : (
                        <ul class="mwa-rows">
                            {invitations.map((invite) => (
                                <li key={invite.id} class="mwa-row">
                                    <a href={`/app/gambling/sessions/${invite.id}`}>
                                        {t('gamblingNotificationInvite', {
                                            player: displayActor(invite.p1Name, user, t),
                                        })}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('gamblingActiveGames')}</h2>
                </div>
                <div class="mwa-panel-body">
                    {sessions.length === 0 ? (
                        <p class="mwa-muted">{t('gamblingNoActiveGames')}</p>
                    ) : (
                        <ul class="mwa-rows">
                            {sessions.map((session) => (
                                <li key={session.id} class="mwa-row">
                                    <a href={`/app/gambling/sessions/${session.id}`}>
                                        <strong>
                                            {t('gamblingVersus', {
                                                p1: displayActor(session.p1Name, user, t),
                                                p2: displayActor(session.p2Name, user, t),
                                            })}
                                        </strong>
                                    </a>
                                    <small>{t(gameTrans(session.type))}</small>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </PageShell>
    );
}

function gameTrans(type: GameType): keyof Language {
    switch (type) {
        case 'coin_flip':
            return 'gamblingCoinFlip';
        case 'chess':
            return 'gamblingChess';
        case 'connect_4':
            return 'gamblingConnect4';
    }
}
