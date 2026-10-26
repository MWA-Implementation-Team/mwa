import { useContext } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import PageShell from './app/PageShell.js';

type AdminPageProps = {};

export const adminPage: Page<AdminPageProps> = {
    Component: AdminPage,
    title: (t) => t('titleAdmin'),
};

function AdminPage({}: AdminPageProps) {
    const { t } = useContext(ClientContext);
    return (
        <PageShell section="admin">
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('adminPanelHead')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-muted">{t('adminPanelTodo')}</p>
                </div>
            </section>
        </PageShell>
    );
}
