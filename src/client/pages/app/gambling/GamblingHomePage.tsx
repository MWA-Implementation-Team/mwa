import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import { Page } from '#src/client/pages.js';
import { Invitation, SessionSummary } from '#src/db/gambling.js';
import PageShell from '../PageShell.js';

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
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('gamblingInvitations')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    {invitations.length === 0 ? (
                        <p class="mwa-wiki-muted">{t('gamblingNoInvitations')}</p>
                    ) : (
                        <ul class="mwa-wiki-rows">
                            {invitations.map((invite) => (
                                <li key={invite.id} class="mwa-wiki-row">
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

            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('gamblingActiveGames')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    {sessions.length === 0 ? (
                        <p class="mwa-wiki-muted">{t('gamblingNoActiveGames')}</p>
                    ) : (
                        <ul class="mwa-wiki-rows">
                            {sessions.map((session) => (
                                <li key={session.id} class="mwa-wiki-row">
                                    <a href={`/app/gambling/sessions/${session.id}`}>
                                        <strong>
                                            {t('gamblingVersus', {
                                                p1: session.p1Name,
                                                p2: session.p2Name,
                                            })}
                                        </strong>
                                    </a>
                                    <small>{t('gamblingCoinFlip')}</small>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </PageShell>
    );
}
