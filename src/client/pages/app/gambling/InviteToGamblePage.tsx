import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import { useState } from 'preact/hooks';
import Dialog from '#src/client/ui/Dialog.js';
import { GameType } from '#src/db/gambling.js';

export type InviteToGamblePageProps = {
    targetUsername: string;
    error?: {
        dialog: GameType,
        message: string,
    },
};

export const inviteToGamblePage: Page<InviteToGamblePageProps> = {
    Component: InviteToGamblePage,
    title: (_, { targetUsername }) => `MWA | ${targetUsername} gambling`,
};

function InviteToGamblePage({ targetUsername, error }: InviteToGamblePageProps) {
    const [openDialog, setOpenDialog] = useState<GameType | null>(error?.dialog ?? null);

    return (
        <>
            <Header />

            <h1>Gamble with {targetUsername}</h1>

            <section>
                <h2>Coin flip</h2>
                <span>Guess which side the coin will flip on</span>
                <button onClick={() => setOpenDialog('coin_flip')}>Challenge</button>
            </section>

            <Dialog isOpen={openDialog === 'coin_flip'} onClose={() => setOpenDialog(null)}>
                <form method="POST">
                    <h2>Coin flip</h2>
                    <input type="hidden" name="game_type" value="coin_flip" />
                    <input type="number" min="1" name="bet_amount" placeholder="Bet amount" />
                    <select name="cf_bet">
                        <option value="heads">Heads</option>
                        <option value="tails">Tails</option>
                    </select>
                    <button type="submit">Invite to flip the coin</button>
                    {error?.message && <span>{error?.message}</span>}
                </form>
            </Dialog>
        </>
    );
}
