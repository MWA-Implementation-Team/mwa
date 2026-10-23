import { useContext } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import { FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from '#src/client/ui/icons.js';
import PageShell from './app/PageShell.js';

type LandingPageProps = {};

export const landingPage: Page<LandingPageProps> = {
    Component: LandingPage,
    title: (t) => t('titleLanding'),
};

function LandingPage({}: LandingPageProps) {
    const { t, user } = useContext(ClientContext);

    const socials = [
        { Icon: FacebookIcon, name: 'Facebook' },
        { Icon: TwitterIcon, name: 'Twitter' },
        { Icon: LinkedinIcon, name: 'LinkedIn' },
        { Icon: InstagramIcon, name: 'Instagram' },
    ];

    const news = [
        { title: t('landingNews1Title'), body: t('landingNews1Body') },
        { title: t('landingNews2Title'), body: t('landingNews2Body') },
    ];

    return (
        <PageShell section="landing" title={t('landingHeroTitle')} subtitle={t('landingHeroBody')}>
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-intro">{t('landingHeroBody')}</p>
                    <div class="mwa-wiki-actions">
                        {user ? (
                            <a href="/app" class="mwa-wiki-button mwa-wiki-button--primary">
                                {t('headerHome')}
                            </a>
                        ) : (
                            <a href="/login" class="mwa-wiki-button mwa-wiki-button--primary">
                                {t('landingRegister')}
                            </a>
                        )}
                    </div>
                </div>
            </section>

            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('landingSocialTitle')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <div class="social-row">
                        {socials.map(({ Icon, name }) => (
                            <a key={name} href="#" class="social-button" aria-label={name}>
                                <Icon />
                            </a>
                        ))}
                    </div>

                    <ul class="mwa-wiki-rows">
                        {news.map((item) => (
                            <li key={item.title}>
                                <strong>{item.title}</strong>
                                <p class="mwa-wiki-muted">{item.body}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('landingMapTitle')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <div class="wireframe-box map-box">{t('mapPlaceholder')}</div>
                </div>
            </section>

            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('landingFeedTitle')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-muted">{t('landingFeedActive')}</p>
                    <div class="activity-list">
                        {[1, 2].map((n) => (
                            <div key={n} class="activity-card">
                                <div class="activity-badge">{n}</div>
                                <div class="wireframe-box activity-image">IMG</div>
                                <div class="activity-body">
                                    <div class="activity-head">
                                        <h4 class="activity-name">
                                            {t('activitySlot', { n: String(n) })}
                                        </h4>
                                        <span
                                            class={`status-pill ${n === 1 ? 'status-open' : 'status-busy'}`}
                                        >
                                            {n === 1 ? t('statusOpen') : t('statusBusy')}
                                        </span>
                                    </div>
                                    <p class="muted activity-desc">{t('activityDesc')}</p>
                                    <div class="activity-actions">
                                        <button class="btn btn-primary btn-sm">
                                            {t('getInLine')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('sponsorsTitle')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-muted">{t('sponsorsSubtitle')}</p>
                    <div class="sponsor-grid cols-4">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} class="sponsor">
                                LOGO
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PageShell>
    );
}
