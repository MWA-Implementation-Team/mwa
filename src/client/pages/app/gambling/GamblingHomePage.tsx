import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import { Page } from '#src/client/pages.js';
import { GameType, Invitation, SessionSummary } from '#src/db/gambling.js';
import PageShell from '../PageShell.js';
import { Language } from '#src/client/language.js';

type GamblingPageProps = {
    sessions: SessionSummary[];
    invitations: Invitation[];
};

export const gamblingPage: Page<GamblingPageProps> = {
    Component: GamblingPage,
    title: (t) => t('titleGambling'),
};

function GamblingPage({ sessions, invitations }: GamblingPageProps) {
    const { t } = useContext(ClientContext);
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
                                            player: invite.p1Name,
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
                                                p1: session.p1Name,
                                                p2: session.p2Name,
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
        case 'connect_4':
            return 'gamblingConnect4';
    }
}
