import { ClientContext } from '#src/client/context.js';
import { Page } from '#src/client/pages.js';
import { RunningGame } from '#src/db/gambling.js';
import { useContext } from 'preact/hooks';

type GamblingSessionPageProps = {
    type: 'confirm',
    id: number,
    game: RunningGame,
    message?: string,
} | {
    type: 'rejected',
    game: RunningGame,
} | {
    type: 'running',
    id: number,
    game: RunningGame,
    winner?: 'p1' | 'p2',
};

export const gamblingSessionPagie: Page<GamblingSessionPageProps> = {
    Component: GamblingSessionPage,
    title: (_, props) => {
        switch (props.type) {
            case 'confirm':
                return 'MWA | Challenge Request';
            case 'rejected':
                return 'MWA | Rejected';
            case 'running':
                return 'MWA | Coin Flip';
        }
    },
};

function GamblingSessionPage(props: GamblingSessionPageProps) {
    const { user } = useContext(ClientContext);

    switch (props.type) {
        case 'confirm': {
            const { game, id, message } = props;
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
            const { game } = props;
            return (
                <>
                    <h1>Rejected</h1>
                    <span>
                        {game.p2Name} has rejected this challenge
                    </span>
                </>
            )
        }
        case 'running': {
            const { id, game, winner } = props;
            return (
                <>
                    <h1>imagine coin flip here</h1>
                    <span>
                        {game.p1Name} vs {game.p2Name}
                    </span>
                    <span>Type: {game.type}</span>
                    {winner ? <h1>WINNER: {winner}</h1> : (
                        <form method="POST">
                            <button formaction={`/app/gambling/sessions/${id}/win`} type="submit">Win</button>
                        </form>
                    )}
                </>
            )
        }
    }
}
