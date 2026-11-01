import { useContext, useState } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import Dialog from '#src/client/ui/Dialog.js';
import { displayUsername } from '#src/client/display.js';

// Extra target fields shown only to elevated roles — the route populates
// this solely for host/admin scanners, so `detail` being non-null is the gate.
export type InteractProfileDetail = {
    email: string;
    currentBalance: number;
    joinedAt: string; // ISO timestamp
};

export type InteractProfile = {
    token: string;
    self: boolean;
    username: string;
    detail: InteractProfileDetail | null;
};

// What the personal QR opens: /app?interact=<token> renders this over home.
export default function InteractDialog({ interact }: { interact: InteractProfile }) {
    const { t } = useContext(ClientContext);
    const [open, setOpen] = useState(true);

    // Drop the param on close so a refresh doesn't reopen the dialog.
    const close = () => {
        window.history.replaceState(null, '', '/app');
        setOpen(false);
    };

    const title = t('interactHeading', { name: displayUsername(interact.username) });

    if (interact.self) {
        return (
            <Dialog
                isOpen={open}
                onClose={close}
                title={title}
                class="mwa-dialog--half"
                actions={null}
            >
                <p class="mwa-muted">{t('interactSelfJoke')}</p>
            </Dialog>
        );
    }

    const { token, detail } = interact;
    return (
        <Dialog
            isOpen={open}
            onClose={close}
            title={title}
            class="mwa-dialog--half"
            actions={
                <div class="mwa-actions mwa-actions--col">
                    {/* Stub — real transfers land with the pending/confirm flow. */}
                    <button type="button" class="mwa-button" disabled>
                        {t('interactSendMoneyTitle')}
                    </button>
                    <a
                        class="mwa-button"
                        href={`/app/interact/${encodeURIComponent(token)}/gamble`}
                    >
                        {t('gamblingAction')}
                    </a>
                    <form
                        method="POST"
                        action={`/app/interact/${encodeURIComponent(token)}/group-request`}
                    >
                        <button type="submit" class="mwa-button">
                            {t('groupRequestJoin')}
                        </button>
                    </form>
                </div>
            }
        >
            {detail && (
                <>
                    <h3>{t('interactProfileDetailTitle')}</h3>
                    <ul class="mwa-rows">
                        <li class="mwa-row">
                            <span>{t('interactDetailEmail')}</span>
                            <strong>{detail.email}</strong>
                        </li>
                        <li class="mwa-row">
                            <span>{t('interactDetailBalance')}</span>
                            <strong>{detail.currentBalance}</strong>
                        </li>
                        <li class="mwa-row">
                            <span>{t('interactDetailJoined')}</span>
                            <strong>{detail.joinedAt.slice(0, 10)}</strong>
                        </li>
                    </ul>
                    <h3>{t('interactAwardTitle')}</h3>
                    <form
                        method="POST"
                        action={`/app/interact/${encodeURIComponent(token)}/award`}
                        class="mwa-form"
                    >
                        <div class="mwa-field">
                            <label for="mwa-award-amount">{t('interactAwardAmount')}</label>
                            <input
                                id="mwa-award-amount"
                                type="number"
                                name="amount"
                                min="1"
                                step="1"
                                required
                            />
                        </div>
                        <div class="mwa-field">
                            <label for="mwa-award-note">{t('interactAwardNote')}</label>
                            <input id="mwa-award-note" name="note" maxLength={200} />
                        </div>
                        <div class="mwa-actions">
                            <button type="submit">{t('interactAwardSubmit')}</button>
                        </div>
                    </form>
                </>
            )}
        </Dialog>
    );
}
