import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';

type InviteToGamblePageProps = {
    targetUsername: string;
    errorMessage?: string;
};

export const inviteToGamblePage: Page<InviteToGamblePageProps> = {
    Component: InviteToGamblePage,
    title: (_, { targetUsername }) => `MWA | ${targetUsername} gambling`,
};

function InviteToGamblePage({ targetUsername, errorMessage }: InviteToGamblePageProps) {
    return (
        <>
            <Header />

            <h1>Invite to gamble with {targetUsername}</h1>

            <form method="POST">
                <h2>Coin flip</h2>
                <input type="hidden" name="game_type" value="coin_flip" />
                <input type="number" min="1" name="bet_amount" placeholder="Bet amount" />
                <select name="cf_bet">
                    <option value="heads">Heads</option>
                    <option value="tails">Tails</option>
                </select>
                <button type="submit">Invite to flip the coin</button>
            </form>

            {errorMessage && <span>{errorMessage}</span>}
        </>
    );
}
