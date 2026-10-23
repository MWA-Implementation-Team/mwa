import { Page } from '#src/client/pages.js';
import PageShell from './PageShell.js';

type AccountPageProps = {};

export const accountPage: Page<AccountPageProps> = {
    Component: AccountPage,
    title: (t) => t('titleAccount'),
};

function AccountPage({}: AccountPageProps) {
    return (
        <PageShell section="account" title="account" subtitle="your corner of the event ✧">
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head"><h2>☆ profile settings</h2></div>
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-muted">TODO: change username, avatar, and other account-related settings.</p>
                </div>
            </section>
        </PageShell>
    );
}
