import { Page } from '#src/client/pages.js';
import PageShell from './PageShell.js';

type AdminPageProps = {};

export const adminPage: Page<AdminPageProps> = {
    Component: AdminPage,
    title: (t) => t('titleAdmin'),
};

function AdminPage({}: AdminPageProps) {
    return (
        <PageShell section="admin" title="admin panel" subtitle="control panel · under construction">
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head"><h2>☆ administration</h2></div>
                <div class="mwa-wiki-panel-body"><p class="mwa-wiki-muted">TODO: admin panel.</p></div>
            </section>
        </PageShell>
    );
}
