import { ClientContext } from '#src/client/context.js';
import { Page } from '#src/client/pages.js';
import { useContext, useState } from 'preact/hooks';
import Dialog from '#src/client/ui/Dialog.js';
import { GameType } from '#src/db/gambling.js';
import { Language } from '#src/client/language.js';
import PageShell from '../PageShell.js';

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
        <PageShell section="gambling">
            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('gamblingWith', { name: targetUsername })}</h2>
                </div>
                <div class="mwa-panel-body">
                    <p class="mwa-intro">
                        <strong>{t('gamblingCoinFlip')}</strong>
                    </p>
                    <p class="mwa-muted">{t('gamblingCoinFlipDescription')}</p>
                    <div class="mwa-actions">
                        <button class="btn-primary" onClick={() => setOpenDialog('coin_flip')}>
                            {t('gamblingChallenge')}
                        </button>
                    </div>
                </div>
            </section>

            <Dialog isOpen={openDialog === 'coin_flip'} onClose={() => setOpenDialog(null)}>
                <form method="POST" class="mwa-form">
                    <h2>{t('gamblingCoinFlip')}</h2>
                    <input type="hidden" name="game_type" value="coin_flip" />
                    <div class="mwa-field">
                        <label for="mwa-cf-bet-amount">{t('gamblingBetAmount')}</label>
                        <input
                            id="mwa-cf-bet-amount"
                            type="number"
                            min="1"
                            name="bet_amount"
                            required
                        />
                    </div>
                    <div class="mwa-field">
                        <label for="mwa-cf-bet">{t('gamblingCoinFlip')}</label>
                        <select id="mwa-cf-bet" name="cf_bet">
                            <option value="heads">{t('gamblingHeads')}</option>
                            <option value="tails">{t('gamblingTails')}</option>
                        </select>
                    </div>
                    <div class="mwa-actions">
                        <button type="submit" class="btn-primary">
                            {t('gamblingSendInvite')}
                        </button>
                    </div>
                    {error?.message && (
                        <p class="mwa-note mwa-note--error" role="alert">
                            {t(error.message)}
                        </p>
                    )}
                </form>
            </Dialog>
        </PageShell>
    );
}
