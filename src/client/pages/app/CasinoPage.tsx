import { useContext } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import PageShell from './PageShell.js';

type CasinoPageProps = {};

export const casinoPage: Page<CasinoPageProps> = {
    Component: CasinoPage,
    title: (t) => t('titleCasino'),
};

function CasinoPage({}: CasinoPageProps) {
    const { t } = useContext(ClientContext);
    return (
        <PageShell section="casino">
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('casinoNoticeHead')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-muted">{t('casinoNotice')}</p>
                </div>
            </section>
        </PageShell>
    );
}
