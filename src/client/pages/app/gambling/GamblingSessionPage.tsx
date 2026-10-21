import { Page } from '#src/client/pages.js';
import { RunningGame } from '#src/db/gambling.js';

type GamblingSessionPageProps = {
    type: 'confirm',
    game: RunningGame,
    message?: string,
} | {
    type: 'running',
    game: RunningGame,
};

export const gamblingSessionPagie: Page<GamblingSessionPageProps> = {
    Component: GamblingSessionPage,
    title: (_, props) => {
        switch (props.type) {
            case 'confirm':
                return 'MWA | Challenge Request';
            case 'running':
                return 'MWA | Coin Flip';
        }
    },
};

function GamblingSessionPage(props: GamblingSessionPageProps) {
    switch (props.type) {
        case 'confirm': {
            const { game, message } = props;
            return (
                <>
                    <h1>Challenge request:</h1>
                    <span>{game.p1Name} has challenged you in a game of coin flip</span>
                    <form method="POST">
                        <button type="submit">ACCEPT</button>
                    </form>
                    {message && <span>{message}</span>}
                </>
            )
        }
        case 'running': {
            const { game } = props;
            return (
                <>
                    <h1>imagine coin flip here</h1>
                    <span>
                        {game.p1Name} vs {game.p2Name}
                    </span>
                    <span>Type: {game.type}</span>
                </>
            )
        }
    }
}
