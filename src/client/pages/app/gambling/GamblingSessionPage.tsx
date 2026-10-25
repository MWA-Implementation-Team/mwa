import { gamblingPendingExpiryMinutes } from '#src/client/constants.js';
import { ClientContext } from '#src/client/context.js';
import { Page } from '#src/client/pages.js';
import Header from '#src/client/ui/Header.js';
import { Gambler, RunningGame } from '#src/db/gambling.js';
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
            case 'expired':
                return 'MWA | Expired';
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
                        <h1>Gambling request:</h1>
                        <p>{currentGame.p1Name} has challenged you in a game of coin flip</p>
                        <p>They are betting <strong>{game.betAmount}</strong> coins that the coin will land on <strong>{game.p1Guess}</strong></p>
                        <p>If they are right, you <strong>lose {game.betAmount} coins</strong>. If they're wrong, you <strong>win {game.betAmount} coins</strong></p>
                        <p>Do you wish to accept this bet?</p>
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
                        {isDisconnected ? (<span>Disconnected from server. <a href="">Refresh?</a></span>) : null}
                        <h1>Waiting for {game.p2Name}</h1>
                        <span>Tell them to open MWA and accept the notification</span>
                    </>
                )
            }
        }
        case 'expired': {
            return (
                <>
                    <Header />
                    <h1>Expired</h1>
                    <span>
                        This session expired after {currentGame.p2Name} didn't accept within {gamblingPendingExpiryMinutes} minutes.
                    </span>
                </>
            )
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
                    {isDisconnected ? (<span>Disconnected from server. <a href="">Refresh?</a></span>) : null}
                    <h1>Coin flip duel</h1>
                    <p>
                        {currentGame.p1Name} vs {currentGame.p2Name}
                    </p>
                    {currentGame.status.type === 'ended' ? (
                        <>
                            <h2>{currentGame.status.flipResult}</h2>
                            <h3>{side && side === currentGame.status.winner ? 'YOU WIN' : (`${currentGame.status.winner === 'p1' ? currentGame.p1Name : currentGame.p2Name} won`)} </h3>
                        </>
                    ) : (
                        <h2>imagine coin flipping here</h2>
                    )}
                </>
            )
        }
    }
}

