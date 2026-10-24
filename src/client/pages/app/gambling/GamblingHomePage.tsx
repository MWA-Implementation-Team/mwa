import { Page } from '#src/client/pages.js';
import Header from '#src/client/ui/Header.js';
import { Invitation, SessionSummary } from '#src/db/gambling.js';

type GamblingPageProps = {
    sessions: SessionSummary[];
    invitations: Invitation[],
};

export const gamblingPage: Page<GamblingPageProps> = {
    Component: GamblingPage,
    title: (t) => t('titleGambling'),
};

function GamblingPage({ sessions, invitations }: GamblingPageProps) {
    return (
        <>
            <Header />

            <h1>Invitations</h1>
            {invitations.map((invite) => (
                <div>
                    <a href={`/app/gambling/sessions/${invite.id}`}>
                        [!] {invite.p1Name} has invited you to a game of {invite.type}
                    </a>
                </div>
            ))}

            <h1>Public games</h1>

            {sessions.map((session) => (
                <div>
                    <a href={`/app/gambling/sessions/${session.id}`}>
                        {session.p1Name} vs {session.p2Name}
                    </a>
                    <span>Type: {session.type}</span>
                </div>
            ))}
        </>
    );
}
