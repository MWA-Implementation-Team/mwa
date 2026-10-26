import { useContext } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import PageShell from './app/PageShell.js';

type AdminPageProps = {
    message?: string;
};

export const adminPage: Page<AdminPageProps> = {
    Component: AdminPage,
    title: (t) => t('titleAdmin'),
};

function AdminPage({ message }: AdminPageProps) {
    const { t } = useContext(ClientContext);
    return (
        <PageShell section="admin">
            {message && (
                <p class="mwa-note" role="status">
                    {message}
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
                            <button type="submit" class="btn-primary">
                                Mint coins
                            </button>
                        </div>
                    </form>
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
