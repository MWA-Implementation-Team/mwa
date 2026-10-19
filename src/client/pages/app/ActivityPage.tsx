import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import { ActivitySlug, registeredActivities } from '#src/client/activities.js';
import PageShell from './PageShell.js';

type ActivityPageProps = {
    slug: ActivitySlug;
};

export const activityPage: Page<ActivityPageProps> = {
    Component: ActivityPage,
    title: (t, { slug }) => t('titleActivity', { name: registeredActivities[slug].name }),
};

function ActivityPage({ slug }: ActivityPageProps) {
    const { name, Detail } = registeredActivities[slug];

    return (
        <>
            <Header />
            <PageShell title={name} eyebrow="MWA / Activities" subtitle="Activity details">
                <div class="mwa-row"><a href="/app/activities">&larr; Back to activities</a></div>
                <section class="mwa-panel">
                    <div class="mwa-panel-heading"><h2>{name}</h2><span class="mwa-badge">Activity</span></div>
                    <div class="mwa-panel-body"><Detail slug={slug} /></div>
                </section>
            </PageShell>
        </>
    );
}
