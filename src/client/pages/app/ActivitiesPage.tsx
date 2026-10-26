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
        <PageShell section="activities">
            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('activitiesDirectory')}</h2>
                </div>
                <div class="mwa-panel-body">
                    {activities.length === 0 ? (
                        <p class="mwa-muted">{t('activitiesEmpty')}</p>
                    ) : (
                        <ul class="mwa-directory">
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
