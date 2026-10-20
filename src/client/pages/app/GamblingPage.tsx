import { Page } from '#src/client/pages.js';
import { RunningGame } from '#src/db/gambling.js';

type GamblingPageProps = {
    games: RunningGame[];
    message?: string;
};

export const gamblingPage: Page<GamblingPageProps> = {
    Component: GamblingPage,
    title: (t) => t('titleGambling'),
};

function GamblingPage({ games, message }: GamblingPageProps) {
    return (
        <>
            <div>
                {games.map((game) => (
                    <div>
                        <span>
                            {game.p1Name} vs {game.p2Name}
                        </span>
                        <span>Type: {game.type}</span>
                    </div>
                ))}
            </div>

            {message && <span>{message}</span>}

            <form action="/app/gambling" method="POST">
                <input type="text" name="opponent" placeholder="Opponent username" />
                <button type="submit">Invite</button>
            </form>
        </>
    );
}
