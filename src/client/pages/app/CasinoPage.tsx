import { Page } from '#src/client/pages.js';
import PageShell from './PageShell.js';

type CasinoPageProps = {};

export const casinoPage: Page<CasinoPageProps> = {
    Component: CasinoPage,
    title: (t) => t('titleCasino'),
};

function CasinoPage({}: CasinoPageProps) {
    return (
        <PageShell section="casino" title="page unavailable" subtitle="this section isn't available">
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head"><h2>✧ notice</h2></div>
                <div class="mwa-wiki-panel-body"><p class="mwa-wiki-muted">This page is not available.</p></div>
            </section>
        </PageShell>
    );
}
