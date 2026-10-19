import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import PageShell from './PageShell.js';

type HomePageProps = {};

export const homePage: Page<HomePageProps> = {
    Component: HomePage,
    title: (t) => t('titleHome'),
};

function HomePage({}: HomePageProps) {
    const { t, user } = useContext(ClientContext);

    return (
        <>
            <Header />
            <PageShell title={t('homeWelcome', { name: user!.username })} subtitle="Your event dashboard and quick links.">
                <div class="mwa-columns">
                    <section class="mwa-panel">
                        <div class="mwa-panel-heading"><h2>Welcome back</h2><span class="mwa-badge">Dashboard</span></div>
                        <div class="mwa-panel-body mwa-stack">
                            <p class="mwa-muted">Everything you need to access your event activities is here.</p>
                            <div class="mwa-row">
                                <a class="mwa-btn mwa-btn--primary" href="/app/activities">View activities</a>
                                <a class="mwa-btn" href="/app/casino">Casino</a>
                            </div>
                        </div>
                    </section>
                    <section class="mwa-panel">
                        <div class="mwa-panel-heading"><h2>Account session</h2></div>
                        <div class="mwa-panel-body mwa-stack">
                            <div><span class="mwa-uppercase mwa-muted">Signed in as</span><div class="mwa-list-title">{user!.username}</div></div>
                            <form method="POST"><button type="submit">{t('logout')}</button></form>
                        </div>
                    </section>
                </div>
            </PageShell>
        </>
    );
}
