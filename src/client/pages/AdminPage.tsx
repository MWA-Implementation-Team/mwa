import { useContext } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import PageShell from './app/PageShell.js';

type AdminQrCode = {
    id: number;
    createdAt: string;
    secret: string;
    balanceDelta: number;
    maxUses: number;
    message: string | null;
    url: string;
    svg: string;
};

type AdminPageProps = {
    message?: string;
    qrCreated?: boolean;
    qrError?: boolean;
    qrCodes: AdminQrCode[];
};

export const adminPage: Page<AdminPageProps> = {
    Component: AdminPage,
    title: (t) => t('titleAdmin'),
};

function AdminPage({ message, qrCreated, qrError, qrCodes }: AdminPageProps) {
    const { t } = useContext(ClientContext);
    return (
        <PageShell section="admin">
            {message && (
                <p class="mwa-note" role="status">
                    {message}
                </p>
            )}
            {qrCreated && (
                <p class="mwa-note mwa-note--success" role="status">
                    QR code created
                </p>
            )}
            {qrError && (
                <p class="mwa-note mwa-note--error" role="status">
                    Enter a valid amount and max amount of uses
                </p>
            )}
            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>Mint coins</h2>
                </div>
                <div class="mwa-panel-body">
                    <form method="POST" action="/admin/mint-coins" class="mwa-form">
                        <div class="mwa-field">
                            <label for="mwa-mint-username">Username</label>
                            <input id="mwa-mint-username" name="username" required />
                        </div>
                        <div class="mwa-field">
                            <label for="mwa-mint-amount">Amount</label>
                            <input
                                id="mwa-mint-amount"
                                type="number"
                                name="amount"
                                min="1"
                                step="1"
                                required
                            />
                        </div>
                        <div class="mwa-actions">
                            <button type="submit">Mint coins</button>
                        </div>
                    </form>
                </div>
            </section>
            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>Create reward QR</h2>
                </div>
                <div class="mwa-panel-body">
                    <form method="POST" action="/admin/create-qr" class="mwa-form">
                        <div class="mwa-field">
                            <label for="mwa-qr-amount">Prize amount</label>
                            <input
                                id="mwa-qr-amount"
                                type="number"
                                name="amount"
                                min="1"
                                step="1"
                                required
                            />
                        </div>
                        <div class="mwa-field">
                            <label for="mwa-qr-max-uses">Max uses</label>
                            <input
                                id="mwa-qr-max-uses"
                                type="number"
                                name="max_uses"
                                min="1"
                                step="1"
                                required
                            />
                        </div>
                        <div class="mwa-field">
                            <label for="mwa-qr-message">Message (optional)</label>
                            <input
                                id="mwa-qr-message"
                                name="message"
                                maxLength={200}
                                placeholder="e.g. Congratulations! You found a reward."
                            />
                        </div>
                        <div class="mwa-actions">
                            <button type="submit">Create QR</button>
                        </div>
                    </form>
                </div>
            </section>
            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>Reward QRs</h2>
                </div>
                <div class="mwa-panel-body">
                    {qrCodes.length === 0 ? (
                        <p class="mwa-muted">No reward QRs yet</p>
                    ) : (
                        <ul class="mwa-rows">
                            {qrCodes.map((qr) => (
                                <li class="mwa-row" key={qr.id}>
                                    <div
                                        class="qr-code"
                                        dangerouslySetInnerHTML={{ __html: qr.svg }}
                                    />
                                    <div>
                                        <strong>
                                            {qr.balanceDelta} coins | {qr.maxUses} uses
                                        </strong>
                                        {qr.message && <div class="mwa-muted">{qr.message}</div>}{' '}
                                        <a class="mwa-muted" href={qr.url}>
                                            {qr.url}
                                        </a>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('adminPanelHead')}</h2>
                </div>
                <div class="mwa-panel-body">
                    <p class="mwa-muted">{t('adminPanelTodo')}</p>
                </div>
            </section>
        </PageShell>
    );
}
