import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';

type AdminPageProps = {
    message?: string;
};

export const adminPage: Page<AdminPageProps> = {
    Component: AdminPage,
    title: (t) => t('titleAdmin'),
};

function AdminPage({ message }: AdminPageProps) {
    return (
        <>
            <Header />

            <h1>Admin</h1>
            <form method="POST" action="/admin/mint-coins">
                <h2>Mint coins</h2>
                <label>
                    Username
                    <input name="username" required />
                </label>
                <label>
                    Amount
                    <input type="number" name="amount" min="1" step="1" required />
                </label>
                <button type="submit">Mint coins</button>
            </form>
            {message && <p role="status">{message}</p>}
        </>
    );
}
