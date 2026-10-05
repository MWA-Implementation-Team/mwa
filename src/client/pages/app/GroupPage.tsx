import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';

type GroupPageProps = {};

export const groupPage: Page<GroupPageProps> = {
    Component: GroupPage,
    title: (t) => t('titleGroup'),
};

function GroupPage({}: GroupPageProps) {
    return (
        <>
            <Header />

            <h1>Group</h1>
            <p>TODO: all functionality related to groups.</p>
        </>
    );
}
