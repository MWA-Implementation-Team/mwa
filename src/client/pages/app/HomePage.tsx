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
        <PageShell
            section="home"
            title={t('homeWelcome', { name: user!.username })}
            subtitle="your tiny corner of the MWA event universe ✦"
        >
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head"><h2>✦ event directory</h2></div>
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-intro">Welcome back! Jump into an event page below, or use the navigation up top. :D</p>
                    <div class="mwa-wiki-grid" style={{ marginTop: '14px' }}>
                        <a class="mwa-wiki-mini" href="/app/activities">
                            <span class="mwa-wiki-mini-title">☆ activities</span>
                            <span class="mwa-wiki-mini-text">browse the things happening in the event →</span>
                        </a>
                        <a class="mwa-wiki-mini" href="/app/leaderboard?type=team">
                            <span class="mwa-wiki-mini-title">♛ leaderboard</span>
                            <span class="mwa-wiki-mini-text">check the standings →</span>
                        </a>
                    </div>
                </div>
            </section>
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head"><h2>✧ account status</h2></div>
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-muted">Signed in as <strong>{user!.username}</strong>.</p>
                    <form class="mwa-wiki-actions" method="POST">
                        <button type="submit">{t('logout')}</button>
                    </form>
                </div>
            </section>
        </PageShell>
    );
}
