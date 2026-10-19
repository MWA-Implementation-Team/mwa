import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import PageShell from './PageShell.js';

type CasinoPageProps = {};

export const casinoPage: Page<CasinoPageProps> = {
    Component: CasinoPage,
    title: (t) => t('titleCasino'),
};

function CasinoPage({}: CasinoPageProps) {
    return (
        <>
            <Header />
            <PageShell title="Casino" subtitle="Section overview.">
                <section class="mwa-panel">
                    <div class="mwa-panel-heading"><h2>Casino</h2><span class="mwa-badge">Placeholder</span></div>
                    <div class="mwa-panel-body"><div class="mwa-empty"><h3>TODO</h3><p>This section has not been implemented.</p></div></div>
                </section>
            </PageShell>
        </>
    );
}
