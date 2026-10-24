import { ClientContext } from '#src/client/context.js';
import { Page } from '#src/client/pages.js';
import Header from '#src/client/ui/Header.js';
import { RunningGame } from '#src/db/gambling.js';
import { useContext, useEffect, useState } from 'preact/hooks';

type GamblingSessionPageProps = {
    sessionId: number,
    game: RunningGame,
    message?: string,
};

export const gamblingSessionPagie: Page<GamblingSessionPageProps> = {
    Component: GamblingSessionPage,
    title: (_, props) => {
        switch (props.game.status.type) {
            case 'pending':
                return 'MWA | Challenge Request';
            case 'rejected':
                return 'MWA | Rejected';
            case 'running':
            case 'ended':
                switch (props.game.gameType) {
                    case 'coin_flip':
                        return 'MWA | Coin Flip';
                }
        }
    },
};

function GamblingSessionPage({ sessionId, game, message }: GamblingSessionPageProps) {
    const { user } = useContext(ClientContext);
    const [currentGame, setCurrentGame] = useState(game);

    useEffect(() => {
        const updates = new EventSource(`/app/gambling/sessions/${sessionId}/watch`);
        updates.onerror = (err) => console.error(err); // TODO
        updates.onmessage = (msg) => {
            setCurrentGame(JSON.parse(msg.data as string));
        };
    }, [sessionId])

    switch (currentGame.status.type) {
        case 'pending': {
            if (currentGame.p2 === user!.id) {
                return (
                    <>
                        <Header hideNotifications={true} />
                        <h1>Challenge request:</h1>
                        <span>{currentGame.p1Name} has challenged you in a game of coin flip</span>
                        <form method="POST">
                            <button formaction={`/app/gambling/sessions/${sessionId}/accept`} type="submit">ACCEPT</button>
                            <button formaction={`/app/gambling/sessions/${sessionId}/reject?goto=${encodeURIComponent('/app')}`} type="submit">REJECT</button>
                        </form>
                        {message && <span>{message}</span>}
                    </>
                )
            } else {
                return (
                    <>
                        <Header hideNotifications={true} />
                        <h1>Waiting for confirmation</h1>
                        <span>Waiting for {currentGame.p2Name} to accept the request</span>
                    </>
                )
            }
        }
        case 'rejected': {
            return (
                <>
                    <Header />
                    <h1>Rejected</h1>
                    <span>
                        {currentGame.p2Name} has rejected this challenge
                    </span>
                </>
            )
        }
        case 'running':
        case 'ended': {
            return (
                <>
                    <Header hideNotifications={currentGame.status.type === 'running'} />
                    <h1>imagine coin flip here</h1>
                    <span>
                        {currentGame.p1Name} vs {currentGame.p2Name}
                    </span>
                    <span>Type: {currentGame.gameType}</span>
                    {currentGame.status.type === 'ended' ? (
                        <h1>WINNER: {currentGame.status.winner}</h1>
                    ) : (
                        <h1>FLIPPING COIN</h1>
                    )}
                </>
            )
        }
    }
}

