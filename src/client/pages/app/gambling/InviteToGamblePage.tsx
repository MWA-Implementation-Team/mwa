import { ClientContext } from '#src/client/context.js';
import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import { useContext, useState } from 'preact/hooks';
import Dialog from '#src/client/ui/Dialog.js';
import { GameType } from '#src/db/gambling.js';
import { Language } from '#src/client/language.js';

export type InviteToGamblePageProps = {
    targetUsername: string;
    error?: {
        dialog: GameType;
        message: keyof Language;
    };
};

export const inviteToGamblePage: Page<InviteToGamblePageProps> = {
    Component: InviteToGamblePage,
    title: (t, { targetUsername }) => t('titleGamblingInvite', { name: targetUsername }),
};

function InviteToGamblePage({ targetUsername, error }: InviteToGamblePageProps) {
    const { t } = useContext(ClientContext);
    const [openDialog, setOpenDialog] = useState<GameType | null>(error?.dialog ?? null);

    return (
        <>
            <Header />

            <h1>{t('gamblingWith', { name: targetUsername })}</h1>

            <section>
                <h2>{t('gamblingCoinFlip')}</h2>
                <span>{t('gamblingCoinFlipDescription')}</span>
                <button onClick={() => setOpenDialog('coin_flip')}>{t('gamblingChallenge')}</button>
            </section>

            <Dialog isOpen={openDialog === 'coin_flip'} onClose={() => setOpenDialog(null)}>
                <form method="POST">
                    <h2>{t('gamblingCoinFlip')}</h2>
                    <input type="hidden" name="game_type" value="coin_flip" />
                    <input
                        type="number"
                        min="1"
                        name="bet_amount"
                        placeholder={t('gamblingBetAmount')}
                        aria-label={t('gamblingBetAmount')}
                    />
                    <select name="cf_bet">
                        <option value="heads">{t('gamblingHeads')}</option>
                        <option value="tails">{t('gamblingTails')}</option>
                    </select>
                    <button type="submit">{t('gamblingSendInvite')}</button>
                    {error?.message && <span>{t(error.message)}</span>}
                </form>
            </Dialog>
        </>
    );
}
