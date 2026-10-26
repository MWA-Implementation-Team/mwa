import { useContext } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import { ActivitySlug, registeredActivities } from '#src/client/activities.js';
import PageShell from './PageShell.js';

type ActivityPageProps = { slug: ActivitySlug };

export const activityPage: Page<ActivityPageProps> = {
    Component: ActivityPage,
    title: (t, { slug }) => t('titleActivity', { name: registeredActivities[slug].name }),
};

function ActivityPage({ slug }: ActivityPageProps) {
    const { t } = useContext(ClientContext);
    const Detail = registeredActivities[slug].Detail;
    return (
        <PageShell section="activities">
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('activityInfoTitle')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <Detail slug={slug} />
                </div>
            </section>
            <div>
                <a href="/app/activities">{t('activityBack')}</a>
            </div>
        </PageShell>
    );
}
