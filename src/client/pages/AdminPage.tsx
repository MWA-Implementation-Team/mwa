import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';

type AdminPageProps = {};

export const adminPage: Page<AdminPageProps> = {
    Component: AdminPage,
    title: (t) => t('titleAdmin'),
};

function AdminPage({}: AdminPageProps) {
    return (
        <>
            <Header />

            <h1>Admin</h1>
            <p>TODO: admin panel.</p>
        </>
    );
}
