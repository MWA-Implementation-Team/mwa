import { useContext } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import { ActivitySlug, registeredActivities } from '#src/client/activities.js';
import { ActivityDetail } from '#src/client/activities/Detail.js';
import PageShell from './app/PageShell.js';
import { LandingSide } from './LandingSide.js';

type ActivityPageProps = { slug: ActivitySlug };

export const activityPage: Page<ActivityPageProps> = {
    Component: ActivityPage,
    title: (t, { slug }) => t('titleActivity', { name: registeredActivities[slug].name }),
};

function ActivityPage({ slug }: ActivityPageProps) {
    const { t } = useContext(ClientContext);
    return (
        <PageShell section="landing" side={<LandingSide />}>
            <ActivityDetail slug={slug} />
            <div>
                <a href="/">{t('activityBack')}</a>
            </div>
        </PageShell>
    );
}
