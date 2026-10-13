import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import { ActivitySlug, registeredActivities } from '#src/client/activities.js';

type ActivityPageProps = {
    slug: ActivitySlug;
};

export const activityPage: Page<ActivityPageProps> = {
    Component: ActivityPage,
    title: (t, { slug }) => t('titleActivity', { name: registeredActivities[slug].name }),
};

function ActivityPage({ slug }: ActivityPageProps) {
    const Detail = registeredActivities[slug].Detail;

    return (
        <>
            <Header />

            <Detail slug={slug} />
        </>
    );
}
