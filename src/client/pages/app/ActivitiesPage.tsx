import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import { useContext } from 'preact/hooks';
import { Activity, ActivitySlug, registeredActivities } from '#src/client/activities.js';
import PageShell from './PageShell.js';

type ActivitiesPageProps = {};

export const activitiesPage: Page<ActivitiesPageProps> = {
    Component: ActivitiesPage,
    title: (t) => t('titleActivities'),
};

const activities = Object.entries(registeredActivities) as [ActivitySlug, Activity][];

function ActivitiesPage({}: ActivitiesPageProps) {
    const { t } = useContext(ClientContext);

    return (
        <>
            <Header />
            <PageShell title={t('headerActivities')} subtitle="Explore the activities available for this event.">
                <section class="mwa-panel">
                    <div class="mwa-panel-heading">
                        <h2>{t('headerActivities')}</h2>
                        <span class="mwa-badge">{activities.length}</span>
                    </div>
                    <div class="mwa-panel-body">
                        {activities.length === 0 ? (
                            <div class="mwa-empty"><h3>No activities yet</h3><p>Check this page later for updates.</p></div>
                        ) : (
                            <ul class="mwa-grid mwa-list">
                                {activities.map(([slug, { Card }]) => (
                                    <li key={slug}>
                                        <a class="mwa-tile" href={`/app/activities/${slug}`}>
                                            <span class="mwa-tile-kicker">Activity</span>
                                            <Card slug={slug} />
                                            <span class="mwa-tile-footer">View activity &rarr;</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            </PageShell>
        </>
    );
}
