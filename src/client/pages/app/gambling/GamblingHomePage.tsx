import { Page } from '#src/client/pages.js';
import { Invitation, SessionSummary } from '#src/db/gambling.js';

type GamblingPageProps = {
    sessions: SessionSummary[];
    invitations: Invitation[],
    message?: string;
};

export const gamblingPage: Page<GamblingPageProps> = {
    Component: GamblingPage,
    title: (t) => t('titleGambling'),
};

function GamblingPage({ sessions, invitations, message }: GamblingPageProps) {
    return (
        <>
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

            {message && <span>{message}</span>}

            <form action="/app/gambling" method="POST">
                <input type="text" name="opponent" placeholder="Opponent username" />
                <button type="submit">Invite</button>
            </form>
        </>
    );
}
