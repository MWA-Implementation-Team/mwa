import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';

type ActivitiesPageProps = {};

export const activitiesPage: Page<ActivitiesPageProps> = {
    Component: ActivitiesPage,
    title: (t) => t('titleActivities'),
};

function ActivitiesPage({}: ActivitiesPageProps) {
    return (
        <>
            <Header />

            <h1>Activities</h1>
            <p>TODO: list activities, each with a button to register into the queue.</p>
        </>
    );
}
