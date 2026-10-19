import { useContext } from 'preact/hooks';
import Header from '#src/client/ui/Header.js';
import Footer from '#src/client/ui/Footer.js';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import { FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from '#src/client/ui/icons.js';

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
        <>
            <Header />

            <main class="page">
                <section class="card hero">
                    <div>
                        <h1>{t('landingHeroTitle')}</h1>
                        <p class="muted">{t('landingHeroBody')}</p>
                        {user ? (
                            <a href="/app" class="btn btn-primary btn-lg">
                                {t('headerHome')}
                            </a>
                        ) : (
                            <a href="/login" class="btn btn-primary btn-lg">
                                {t('landingRegister')}
                            </a>
                        )}
                    </div>
                </section>

                <section class="card">
                    <h2 class="section-title">{t('landingSocialTitle')}</h2>

                    <div class="social-row divider-bottom">
                        {socials.map(({ Icon, name }) => (
                            <a key={name} href="#" class="social-button" aria-label={name}>
                                <Icon />
                            </a>
                        ))}
                    </div>

                    <div class="news-list">
                        {news.map((item) => (
                            <article key={item.title} class="news-item">
                                <h3>{item.title}</h3>
                                <p class="muted">{item.body}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section class="card">
                    <h2 class="section-title">{t('landingMapTitle')}</h2>
                    <div class="wireframe-box map-box">{t('mapPlaceholder')}</div>
                </section>

                <section class="card">
                    <div class="feed-header divider-bottom">
                        <span class="feed-title">{t('landingFeedTitle')}</span>
                        <span class="muted">{t('landingFeedActive')}</span>
                    </div>

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
                </section>

                <section class="card">
                    <h2 class="section-title">{t('sponsorsTitle')}</h2>
                    <p class="muted sponsor-subtitle">{t('sponsorsSubtitle')}</p>
                    <div class="sponsor-grid cols-4">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} class="sponsor">
                                LOGO
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
