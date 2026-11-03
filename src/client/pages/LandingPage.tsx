import { useContext, useEffect, useState } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import { ActivitySlug, Activity, registeredActivities } from '#src/client/activities.js';
import PageShell from './app/PageShell.js';
import { LandingSide } from './LandingSide.js';

type LandingPageProps = {};

export const landingPage: Page<LandingPageProps> = {
    Component: LandingPage,
};

const activities = Object.entries(registeredActivities) as [ActivitySlug, Activity][];

function nextEventDate() {
    const now = new Date();
    let target = new Date(now.getFullYear(), 10, 5, 18);
    if (target.getTime() <= now.getTime()) {
        target = new Date(now.getFullYear() + 1, 10, 5, 18);
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

function LandingPage({}: LandingPageProps) {
    const { t } = useContext(ClientContext);

    return (
        <PageShell section="landing" side={<LandingSide />}>
            <section class="landing-section landing-pane-countdown">
                <h2>{t('landingCountdownTitle')}</h2>
                <Countdown />
            </section>

            <section class="landing-section landing-pane-activities">
                <h2>{t('landingFeedTitle')}</h2>
                <ul class="mwa-directory">
                    {activities.map(([slug, { Card }]) => (
                        <li key={slug}>
                            <a href={`/activities/${slug}`}>
                                <Card slug={slug} />
                            </a>
                        </li>
                    ))}
                </ul>
            </section>
        </PageShell>
    );
}
