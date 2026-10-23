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
                    <div class="mwa-wiki-actions">
                        {socials.map(({ Icon, name }) => (
                            <a key={name} href="#" class="mwa-wiki-button" aria-label={name}>
                                <Icon /> {name}
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
                    <div class="mwa-wiki-note">{t('mapPlaceholder')}</div>
                </div>
            </section>

            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('landingFeedTitle')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-muted">{t('landingFeedActive')}</p>
                    <ul class="mwa-wiki-rows">
                        {[1, 2].map((n) => (
                            <li key={n}>
                                <div class="mwa-wiki-row">
                                    <span>
                                        <strong>{t('activitySlot', { n: String(n) })}</strong>
                                        <small>{n === 1 ? t('statusOpen') : t('statusBusy')}</small>
                                    </span>
                                    <button class="btn-primary">{t('getInLine')}</button>
                                </div>
                                <p class="mwa-wiki-muted">{t('activityDesc')}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('sponsorsTitle')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-muted">{t('sponsorsSubtitle')}</p>
                    <div class="mwa-wiki-grid">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} class="mwa-wiki-mini">
                                <span class="mwa-wiki-mini-title">LOGO</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PageShell>
    );
}
