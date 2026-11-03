import { useContext } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import { ActivitySlug } from '#src/client/activities.js';
import { ActivityDetail } from '#src/client/activities/Detail.js';
import PageShell from './app/PageShell.js';
import { LandingSide } from './LandingSide.js';

type ActivityPageProps = { slug: ActivitySlug; completed: boolean | null };

export const activityPage: Page<ActivityPageProps> = {
    Component: ActivityPage,
};

function ActivityPage({ slug, completed }: ActivityPageProps) {
    const { t } = useContext(ClientContext);
    return (
        <PageShell section="landing" side={<LandingSide />}>
            <ActivityDetail slug={slug} completed={completed} />
            <div>
                <a href="/">{t('activityBack')}</a>
            </div>
        </PageShell>
    );
}
