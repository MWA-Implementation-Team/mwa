import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import { useContext } from 'preact/hooks';
import { Activity, ActivitySlug, registeredActivities } from '#src/client/activities.js';

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

            <h1>{t('headerActivities')}</h1>
            <ul>
                {activities.map(([slug, { Card }]) => (
                    <li key={slug}>
                        <a href={`/app/activities/${slug}`}>
                            <Card slug={slug} />
                        </a>
                    </li>
                ))}
            </ul>
        </>
    );
}
