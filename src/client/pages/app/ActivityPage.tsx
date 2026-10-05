import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';

type ActivityPageProps = {
    id: string;
};

export const activityPage: Page<ActivityPageProps> = {
    Component: ActivityPage,
    title: (t, { id }) => t('titleActivity', { id }),
};

function ActivityPage({ id }: ActivityPageProps) {
    return (
        <>
            <Header />

            <h1>Activity {id}</h1>
            <p>
                TODO: teams that already completed this activity + current queue so users can
                predict the wait.
            </p>
        </>
    );
}
