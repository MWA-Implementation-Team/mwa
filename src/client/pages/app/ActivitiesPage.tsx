import { useContext } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
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
        <PageShell section="activities" title={t('headerActivities')} subtitle="all the event stuff, in one place ✦">
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head"><h2>☆ activity directory</h2></div>
                <div class="mwa-wiki-panel-body">
                    {activities.length === 0 ? (
                        <p class="mwa-wiki-muted">No activities listed yet.</p>
                    ) : (
                        <ul class="mwa-wiki-directory">
                            {activities.map(([slug, { Card }]) => (
                                <li key={slug}>
                                    <a href={`/app/activities/${slug}`}>
                                        <Card slug={slug} />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </PageShell>
    );
}
