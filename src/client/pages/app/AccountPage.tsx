import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';

type AccountPageProps = {};

export const accountPage: Page<AccountPageProps> = {
    Component: AccountPage,
    title: (t) => t('titleAccount'),
};

function AccountPage({}: AccountPageProps) {
    return (
        <>
            <Header />

            <h1>Account</h1>
            <p>TODO: change username, avatar, and other account-related settings.</p>
        </>
    );
}
