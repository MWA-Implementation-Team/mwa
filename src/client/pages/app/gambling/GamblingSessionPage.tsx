import { ClientContext } from '#src/client/context.js';
import { Page } from '#src/client/pages.js';
import { RunningGame } from '#src/db/gambling.js';
import { useContext } from 'preact/hooks';

type GamblingSessionPageProps = {
    id: number,
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

function GamblingSessionPage({ id, game, message }: GamblingSessionPageProps) {
    const { user } = useContext(ClientContext);

    switch (game.status.type) {
        case 'pending': {
            if (game.p2 === user!.id) {
                return (
                    <>
                        <h1>Challenge request:</h1>
                        <span>{game.p1Name} has challenged you in a game of coin flip</span>
                        <form method="POST">
                            <button formaction={`/app/gambling/sessions/${id}/accept`} type="submit">ACCEPT</button>
                            <button formaction={`/app/gambling/sessions/${id}/reject`} type="submit">REJECT</button>
                        </form>
                        {message && <span>{message}</span>}
                    </>
                )
            } else {
                return (
                    <>
                        <h1>Waiting for confirmation</h1>
                        <span>Waiting for {game.p2Name} to accept the request</span>
                    </>
                )
            }
        }
        case 'rejected': {
            return (
                <>
                    <h1>Rejected</h1>
                    <span>
                        {game.p2Name} has rejected this challenge
                    </span>
                </>
            )
        }
        case 'running':
        case 'ended': {
            return (
                <>
                    <h1>imagine coin flip here</h1>
                    <span>
                        {game.p1Name} vs {game.p2Name}
                    </span>
                    <span>Type: {game.gameType}</span>
                    {game.status.type === 'ended' ? (
                        <h1>WINNER: {game.status.winner}</h1>
                    ) : (
                        <h1>FLIPPING COIN</h1>
                    )}
                </>
            )
        }
    }
}
