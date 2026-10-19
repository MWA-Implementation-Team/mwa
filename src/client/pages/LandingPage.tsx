import { ClientContext } from '#src/client/context.js';
import { useState, useContext } from 'preact/hooks';
import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import { fetchUsers, User } from '#src/client/api/users.js';
import { TestCard } from '../ui/TestCard.js';
import PageShell from './PageShell.js';

// `users` comes from the route (SSR), and stays up to date after client-side refreshes.
type LandingPageProps = {
    users: User[] | null;
};

export const landingPage: Page<LandingPageProps> = {
    Component: LandingPage,
    title: (t) => t('titleLanding'),
};

function LandingPage({ users: initialUsers }: LandingPageProps) {
    const { t } = useContext(ClientContext);
    const [value, setValue] = useState(0);
    const [users, setUsers] = useState(initialUsers);
    const [error, setError] = useState<string | null>(null);

    function refreshUsers() {
        setError(null);
        fetchUsers().then(setUsers, (e) => setError(e.message));
    }

    return (
        <>
            <Header />
            <PageShell title="MWA Event" subtitle="Welcome to the event portal.">
                <div class="mwa-columns">
                    <section class="mwa-panel">
                        <div class="mwa-panel-heading"><h2>Event dashboard</h2><span class="mwa-badge">Overview</span></div>
                        <div class="mwa-panel-body mwa-stack">
                            <div class="mwa-stat"><span class="mwa-uppercase mwa-muted">MWA Event counter</span><strong>{value}</strong></div>
                            <div class="mwa-row">
                                <button type="button" class="btn-primary" onClick={() => setValue(value + 1)}>Increment</button>
                                <button type="button" onClick={() => setValue(value - 1)}>Decrement</button>
                            </div>
                        </div>
                    </section>
                    <section class="mwa-panel">
                        <div class="mwa-panel-heading"><h2>Featured card</h2></div>
                        <div class="mwa-panel-body"><TestCard /></div>
                    </section>
                </div>

                <section class="mwa-panel">
                    <div class="mwa-panel-heading"><h2>Users</h2>{users !== null && <span class="mwa-badge">{users.length}</span>}</div>
                    <div class="mwa-panel-body mwa-stack">
                        {error && <p class="mwa-notice mwa-notice--error" role="alert">{error}</p>}
                        {users === null ? (
                            <p class="mwa-notice">{t('usersLoginRequired')}</p>
                        ) : (
                            <>
                                {users.length === 0 ? (
                                    <div class="mwa-empty"><h3>No users to display</h3></div>
                                ) : (
                                    <div class="mwa-table-wrap">
                                        <table class="mwa-table">
                                            <thead><tr><th>User</th><th>Role</th><th>Points</th></tr></thead>
                                            <tbody>
                                                {users.map((u) => (
                                                    <tr key={u.id}><td><strong>{u.username}</strong></td><td>{u.role}</td><td>{u.currentBalance} pts</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <div class="mwa-form-actions"><button type="button" onClick={refreshUsers}>Refresh</button></div>
                            </>
                        )}
                    </div>
                </section>
            </PageShell>
        </>
    );
}
