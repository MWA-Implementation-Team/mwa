import { useContext } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import { ActivitySlug, Activity, registeredActivities } from '#src/client/activities.js';
import {
    FacebookIcon,
    FormsIcon,
    InstagramIcon,
    LinkedinIcon,
    TwitterIcon,
} from '#src/client/ui/icons.js';
import PageShell from './app/PageShell.js';

type LandingPageProps = {};

export const landingPage: Page<LandingPageProps> = {
    Component: LandingPage,
    title: (t) => t('titleLanding'),
};

const activities = Object.entries(registeredActivities) as [ActivitySlug, Activity][];

const socials = [
    { Icon: FacebookIcon, name: 'Facebook' },
    { Icon: TwitterIcon, name: 'Twitter' },
    { Icon: LinkedinIcon, name: 'LinkedIn' },
    { Icon: InstagramIcon, name: 'Instagram' },
];

function LandingPage({}: LandingPageProps) {
    const { t, user } = useContext(ClientContext);

    return (
        <PageShell
            section="landing"
            nav={false}
            path={t('landingPath')}
            title={t('landingHeroTitle')}
            subtitle={t('landingHeroBody')}
            cta={
                user && (
                    <a href="/app" class="mwa-wiki-button mwa-wiki-button--primary">
                        {t('landingGoApp')}
                    </a>
                )
            }
        >
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-body">
                    <div class="landing-register">
                        <FormsIcon class="landing-register-icon" aria-hidden="true" />
                        <div class="landing-register-body">
                            <p class="landing-register-text">{t('landingFormTitle')}</p>
                            <a href="#">{t('landingFormLink')}</a>
                        </div>
                    </div>
                </div>
            </section>

            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('landingSocialTitle')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <ul class="landing-socials">
                        {socials.map(({ Icon, name }) => (
                            <li key={name}>
                                <a href="#">
                                    <Icon /> {name.toLowerCase()}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('landingFeedTitle')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <ul class="mwa-wiki-directory">
                        {activities.map(([slug, { Card }]) => (
                            <li key={slug}>
                                <a href={`/app/activities/${slug}`}>
                                    <Card slug={slug} />
                                </a>
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
