import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import { Page } from '#src/client/pages.js';
import Header from '#src/client/ui/Header.js';
import { Invitation, SessionSummary } from '#src/db/gambling.js';

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
        <>
            <Header />

            <h1>Invitations</h1>
            {invitations.map((invite) => (
                <div>
                    <a href={`/app/gambling/sessions/${invite.id}`}>
                        [!]{' '}
                        {t('gamblingNotificationInvite', {
                            player: invite.p1Name,
                        })}
                    </a>
                </div>
            ))}

            <h1>{t('gamblingActiveGames')}</h1>

            {sessions.map((session) => (
                <div>
                    <a href={`/app/gambling/sessions/${session.id}`}>
                        {t('gamblingVersus', { p1: session.p1Name, p2: session.p2Name })}
                    </a>
                    <span>{t('gamblingCoinFlip')}</span>
                </div>
            ))}
        </>
    );
}
