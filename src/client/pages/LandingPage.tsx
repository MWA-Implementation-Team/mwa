import { useContext, useEffect, useState } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import { ActivitySlug, Activity, registeredActivities } from '#src/client/activities.js';
import { FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from '#src/client/ui/icons.js';
import PageShell from './app/PageShell.js';
import LanguageToggle from '#src/client/ui/LanguageToggle.js';

type LandingPageProps = {};

export const landingPage: Page<LandingPageProps> = {
    Component: LandingPage,
    title: (t) => t('titleLanding'),
};

const activities = Object.entries(registeredActivities) as [ActivitySlug, Activity][];

function nextEventDate() {
    const now = new Date();
    let target = new Date(now.getFullYear(), 10, 4);
    if (target.getTime() <= now.getTime()) {
        target = new Date(now.getFullYear() + 1, 10, 4);
    }
    return target;
}

function Countdown() {
    const { t } = useContext(ClientContext);
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    const diff = Math.max(0, nextEventDate().getTime() - now);
    const parts = [
        { value: Math.floor(diff / 86_400_000), label: t('countdownDays') },
        { value: Math.floor(diff / 3_600_000) % 24, label: t('countdownHours') },
        { value: Math.floor(diff / 60_000) % 60, label: t('countdownMinutes') },
        { value: Math.floor(diff / 1_000) % 60, label: t('countdownSeconds') },
    ];

    return (
        <div class="landing-countdown">
            {parts.map(({ value, label }) => (
                <div key={label} class="landing-countdown-part">
                    <span class="landing-countdown-value">{String(value).padStart(2, '0')}</span>
                    <span class="landing-countdown-label">{label}</span>
                </div>
            ))}
        </div>
    );
}

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
            side={
                <>
                    <section class="landing-section landing-pane-welcome">
                        <div class="landing-welcome">
                            <img src="/3Logotipas.png" alt={t('wikiLogoAlt')} />
                        </div>
                    </section>

                    <section class="landing-section landing-pane-login">
                        <h2>{t('landingLoginTitle')}</h2>
                        <div class="landing-footer">
                            {user ? (
                                <>
                                    <a href="/app" class="landing-login">
                                        {t('landingGoApp')}
                                    </a>
                                    <form method="POST" action="/app" class="landing-login-form">
                                        <button type="submit" class="landing-login">
                                            {t('logOut')}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <a href="/login" class="landing-login">
                                    {t('landingLogin')}
                                </a>
                            )}
                        </div>
                    </section>

                    <section class="landing-section landing-pane-socials">
                        <h2>{t('landingSocialTitle')}</h2>
                        <ul class="landing-socials">
                            {socials.map(({ Icon, name }) => (
                                <li key={name}>
                                    <a href="#">
                                        <Icon /> <span>{name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section class="landing-section landing-pane-sponsors">
                        <h2>{t('sponsorsTitle')}</h2>
                        <ul class="landing-sponsors">
                            {[1, 2, 3, 4].map((n) => (
                                <li key={n} class="mwa-wiki-mini">
                                    <span class="mwa-wiki-mini-title">LOGO</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section class="landing-section landing-pane-lang">
                        <h2>{t('landingLangTitle')}</h2>
                        <div class="landing-footer">
                            <LanguageToggle />
                        </div>
                    </section>
                </>
            }
        >
            <section class="landing-section landing-pane-countdown">
                <h2>{t('landingCountdownTitle')}</h2>
                <Countdown />
            </section>

            <section class="landing-section landing-pane-activities">
                <h2>{t('landingFeedTitle')}</h2>
                <ul class="mwa-wiki-directory">
                    {activities.map(([slug, { Card }]) => (
                        <li key={slug}>
                            <a href={`/app/activities/${slug}`}>
                                <Card slug={slug} />
                            </a>
                        </li>
                    ))}
                </ul>
            </section>
        </PageShell>
    );
}
