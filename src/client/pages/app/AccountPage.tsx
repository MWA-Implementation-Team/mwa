import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import PageShell from './PageShell.js';

type AccountPageProps = {};

export const accountPage: Page<AccountPageProps> = {
    Component: AccountPage,
    title: (t) => t('titleAccount'),
};

function AccountPage({}: AccountPageProps) {
    return (
        <>
            <Header />
            <PageShell title="Account" subtitle="Your profile and personal settings.">
                <section class="mwa-panel">
                    <div class="mwa-panel-heading"><h2>Profile settings</h2><span class="mwa-badge">Coming soon</span></div>
                    <div class="mwa-panel-body">
                        <div class="mwa-empty">
                            <h3>Account settings</h3>
                            <p>TODO: change username, avatar, and other account-related settings.</p>
                        </div>
                    </div>
                </section>
            </PageShell>
        </>
    );
}
