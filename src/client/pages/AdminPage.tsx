import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import PageShell from './PageShell.js';

type AdminPageProps = {};

export const adminPage: Page<AdminPageProps> = {
    Component: AdminPage,
    title: (t) => t('titleAdmin'),
};

function AdminPage({}: AdminPageProps) {
    return (
        <>
            <Header />
            <PageShell title="Admin" subtitle="Event administration and tools.">
                <section class="mwa-panel">
                    <div class="mwa-panel-heading"><h2>Administration</h2><span class="mwa-badge">Not configured</span></div>
                    <div class="mwa-panel-body">
                        <div class="mwa-empty"><h3>Admin panel</h3><p>TODO: admin panel.</p></div>
                    </div>
                </section>
            </PageShell>
        </>
    );
}
