import { Page } from '#src/client/pages.js';
import { ComponentChildren } from 'preact';
import { useContext, useState } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import PageShell from './PageShell.js';
import Dialog from '#src/client/ui/Dialog.js';
import { Toast } from '#src/client/ui/Toast.js';
import { displayUsername } from '#src/client/display.js';
import { Language } from '#src/client/language.js';
import type { GameType } from '#src/db/gambling/index.js';
import type { ViewerStanding } from '#src/db/leaderboard/index.js';
import { boardHintKey, boardLabelKey } from '#src/client/boards.js';

type InteractPageProps = {
    token: string;
    self: boolean;
    target: { username: string };
    // the scanned user's team, if they have one — the shared-info panel shows
    // it with a per-group emoji
    group: { name: string; memberCount: number } | null;
    // the scanned user's team emoji — a stable placeholder the route picks
    // off the group id
    groupEmoji: string;
    // the target's personal + team position on each board — the same three
    // rows the home standings table shows
    standings: ViewerStanding[];
    canPlay: boolean;
    // true for host/admin scanners — they get the award-shaped send panel
    // (posts to /award, optional note, no balance clamp) instead of play
    canAward: boolean;
    interactError?: keyof Language;
    interactNotice?: keyof Language;
    // send-money feedback, rendered inside the Send money panel
    sendError?: keyof Language;
    sentAmount?: number | null;
    // a failed challenge reopens its game's dialog with the message
    gamblingError?: { dialog: GameType; message?: keyof Language };
};

export const interactPage: Page<InteractPageProps> = {
    Component: InteractPage,
};

// What the personal QR opens — /app/interact/<token>.
function InteractPage({
    token,
    self,
    target,
    group,
    groupEmoji,
    standings,
    canPlay,
    canAward,
    interactError,
    interactNotice,
    sendError,
    sentAmount,
    gamblingError,
}: InteractPageProps) {
    const { t, user } = useContext(ClientContext);
    const [openDialog, setOpenDialog] = useState<GameType | null>(gamblingError?.dialog ?? null);

    if (self) {
        return (
            <PageShell section="interact">
                <section class="mwa-panel">
                    <div class="mwa-panel-body">
                        <p class="mwa-muted">{t('interactSelfJoke')}</p>
                    </div>
                </section>
            </PageShell>
        );
    }

    const post = (action: string) => `/app/interact/${encodeURIComponent(token)}/${action}`;
    const challengeDialog = (
        game: GameType,
        title: keyof Language,
        formId: string,
        children: ComponentChildren,
    ) => (
        <Dialog
            isOpen={openDialog === game}
            onClose={() => setOpenDialog(null)}
            title={t(title)}
            class="mwa-dialog--half"
            submit={{ form: formId, label: t('gamblingSendInvite') }}
        >
            <form id={formId} method="POST" action={post('gamble')} class="mwa-form">
                <input type="hidden" name="game_type" value={game} />
                {children}
                {gamblingError?.dialog === game && gamblingError.message && (
                    <Toast kind="error">{t(gamblingError.message)}</Toast>
                )}
            </form>
        </Dialog>
    );

    const betField = (id: string) => (
        <div class="mwa-field">
            <label for={id}>{t('gamblingBetAmount')}</label>
            <input id={id} type="number" min="1" name="bet_amount" required />
        </div>
    );

    const games: { type: GameType; name: keyof Language; desc: keyof Language }[] = [
        {
            type: 'coin_flip',
            name: 'gamblingCoinFlip',
            desc: 'gamblingCoinFlipDescription',
        },
        {
            type: 'connect_4',
            name: 'gamblingConnect4',
            desc: 'gamblingConnect4Description',
        },
        { type: 'chess', name: 'gamblingChess', desc: 'gamblingChessDescription' },
    ];

    return (
        <PageShell section="interact">
            {interactError &&
                interactError !== 'interactAwardInvalid' &&
                interactError !== 'interactAwardNoGroup' && (
                    <Toast kind="error">{t(interactError)}</Toast>
                )}
            {interactNotice && interactNotice !== 'interactAwarded' && (
                <Toast kind="success">{t(interactNotice)}</Toast>
            )}

            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('interactGeneralTitle')}</h2>
                </div>
                <div class="mwa-panel-body mwa-queue-grid">
                    <div>
                        <p class="mwa-queue-name">{displayUsername(target.username)}</p>
                        <div class="mwa-queue-art" aria-hidden="true">
                            {groupEmoji}
                        </div>
                        {group ? (
                            <p class="mwa-queue-members">
                                {t('queueGroupSize', { n: String(group.memberCount) })}
                            </p>
                        ) : (
                            <p class="mwa-muted mwa-queue-cta">{t('interactGroupNone')}</p>
                        )}
                        {canPlay && (
                            <form
                                method="POST"
                                action={post('group-request')}
                                class="mwa-queue-cta"
                            >
                                <button type="submit" class="lang-link">
                                    {t('groupRequestJoin')}
                                </button>
                            </form>
                        )}
                    </div>

                    <div>
                        <div class="table mwa-tx">
                            <table>
                                <thead>
                                    <tr>
                                        <th colSpan={2}>{t('dashStandings')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {standings.map((s) => [
                                        <tr key={s.board}>
                                            <td>{t(boardLabelKey[s.board])}</td>
                                            <td class="mwa-tx-amount">
                                                <span class="mwa-standing-hint">
                                                    *{t(boardHintKey[s.board])}
                                                </span>
                                            </td>
                                        </tr>,
                                        <tr key={s.board + '-you'} class="mwa-standing-sub">
                                            <td>{displayUsername(target.username)}</td>
                                            <td class="mwa-tx-amount">
                                                {s.you ? `#${s.you.rank}` : '—'}
                                            </td>
                                        </tr>,
                                        <tr key={s.board + '-grp'} class="mwa-standing-sub">
                                            <td>{group?.name ?? '—'}</td>
                                            <td class="mwa-tx-amount">
                                                {s.group ? `#${s.group.rank}` : '—'}
                                            </td>
                                        </tr>,
                                    ])}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {user?.role === 'user' && (
                <SendPanel
                    action={post('send-money')}
                    max={user!.currentBalance}
                    error={sendError}
                    notice={
                        sentAmount !== null && sentAmount !== undefined
                            ? t('interactMoneySent', { amount: String(sentAmount) })
                            : undefined
                    }
                />
            )}

            {canAward && (
                <SendPanel
                    action={post('award')}
                    max={null}
                    withNote
                    error={
                        interactError === 'interactAwardInvalid' ||
                        interactError === 'interactAwardNoGroup'
                            ? interactError
                            : undefined
                    }
                    notice={
                        interactNotice === 'interactAwarded' ||
                        interactNotice === 'interactAwardedGroup'
                            ? t(interactNotice)
                            : undefined
                    }
                    extraSubmit={
                        group
                            ? {
                                  formaction: post('award-group'),
                                  label: t('interactAwardGroup', {
                                      n: String(group.memberCount),
                                  }),
                              }
                            : undefined
                    }
                />
            )}

            {canPlay && (
                <section class="mwa-panel">
                    <div class="mwa-panel-head">
                        <h2>{t('headerGambling')}</h2>
                    </div>
                    <div class="mwa-panel-body">
                        <div class="table mwa-tx">
                            <table>
                                <thead>
                                    <tr>
                                        <th colSpan={2}>{t('headerGambling')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {games.map((game) => (
                                        <tr key={game.type}>
                                            <td>
                                                {t(game.name)}
                                                <div class="mwa-muted">{t(game.desc)}</div>
                                            </td>
                                            <td class="mwa-tx-amount">
                                                <button
                                                    type="button"
                                                    class="lang-link"
                                                    onClick={() => setOpenDialog(game.type)}
                                                >
                                                    {t('gamblingChallenge')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            )}

            {canPlay &&
                challengeDialog(
                    'coin_flip',
                    'gamblingCoinFlip',
                    'mwa-cf-form',
                    <>
                        {betField('mwa-cf-bet-amount')}
                        <div class="mwa-field">
                            <label for="mwa-cf-bet">{t('gamblingCoinFlip')}</label>
                            <select id="mwa-cf-bet" name="cf_bet">
                                <option value="heads">{t('gamblingHeads')}</option>
                                <option value="tails">{t('gamblingTails')}</option>
                            </select>
                        </div>
                    </>,
                )}
            {canPlay &&
                challengeDialog(
                    'connect_4',
                    'gamblingConnect4',
                    'mwa-c4-form',
                    betField('mwa-c4-bet-amount'),
                )}
            {canPlay &&
                challengeDialog(
                    'chess',
                    'gamblingChess',
                    'mwa-chess-form',
                    betField('mwa-chess-bet-amount'),
                )}
        </PageShell>
    );
}

// The send-money panel in both its shapes: players pay out of their own
// balance (clamped stepper, "All" chip); staff get the same widget posting to
// the award route — unclamped, an optional note, no balance line.
function SendPanel({
    action,
    max,
    withNote,
    error,
    notice,
    extraSubmit,
}: {
    action: string;
    max: number | null;
    withNote?: boolean;
    error?: keyof Language;
    notice?: string;
    // second submit posting the same form elsewhere — the host's award-group
    // button; submit buttons may override the form's action via formaction
    extraSubmit?: { formaction: string; label: string };
}) {
    const { t } = useContext(ClientContext);
    const [sendAmount, setSendAmount] = useState(0);
    const cap = max ?? Number.MAX_SAFE_INTEGER;

    return (
        <section class="mwa-panel">
            <div class="mwa-panel-head">
                <h2>{t('interactSendMoneyTitle')}</h2>
            </div>
            <div class="mwa-panel-body">
                {error && <Toast kind="error">{t(error)}</Toast>}
                {notice && <Toast kind="success">{notice}</Toast>}
                <form method="POST" action={action} class="mwa-send">
                    <input type="hidden" name="amount" value={sendAmount} />
                    <div class="mwa-send-stepper">
                        <button
                            type="button"
                            class="mwa-send-step"
                            onClick={() => setSendAmount((a) => Math.max(0, a - 1))}
                            disabled={sendAmount <= 0}
                        >
                            −
                        </button>
                        <output class="mwa-send-amount">{sendAmount}</output>
                        <button
                            type="button"
                            class="mwa-send-step"
                            onClick={() => setSendAmount((a) => Math.min(cap, a + 1))}
                            disabled={sendAmount >= cap}
                        >
                            +
                        </button>
                    </div>
                    {max !== null && (
                        <p class="mwa-send-available">
                            {t('interactSendAvailable', { amount: String(max) })}
                        </p>
                    )}
                    <div class="mwa-send-chips">
                        {[5, 10, 50, 100].map((n) => (
                            <button
                                key={n}
                                type="button"
                                class="mwa-send-chip"
                                onClick={() => setSendAmount((a) => Math.min(cap, a + n))}
                            >
                                +{n}
                            </button>
                        ))}
                        {max !== null && (
                            <button
                                type="button"
                                class="mwa-send-chip"
                                onClick={() => setSendAmount(max)}
                            >
                                {t('interactSendAll')}
                            </button>
                        )}
                    </div>
                    {withNote && (
                        <div class="mwa-field">
                            <label for="mwa-send-note">{t('interactAwardNote')}</label>
                            <input id="mwa-send-note" name="note" maxLength={200} />
                        </div>
                    )}
                    <button
                        type="submit"
                        class="mwa-button"
                        disabled={sendAmount < 1 || sendAmount > cap}
                    >
                        {t('interactSendSubmit')}
                    </button>
                    {extraSubmit && (
                        <button
                            type="submit"
                            class="mwa-button"
                            formaction={extraSubmit.formaction}
                            disabled={sendAmount < 1 || sendAmount > cap}
                        >
                            {extraSubmit.label}
                        </button>
                    )}
                </form>
            </div>
        </section>
    );
}
