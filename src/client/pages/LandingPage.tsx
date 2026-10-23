import { ClientContext } from '#src/client/context.js';
import { useState, useContext } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { fetchUsers, User } from '#src/client/api/users.js';
import { TestCard } from '../ui/TestCard.js';
import PageShell from './PageShell.js';

// SSR-provided users are kept as the initial client state for live refreshes.
type LandingPageProps = { users: User[] | null };

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
        <PageShell section="home" title="MWA Event" subtitle="home, updates and little test features ✦">
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head"><h2>☆ event counter</h2></div>
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-intro">MWA Event: <strong>{value}</strong></p>
                    <div class="mwa-wiki-actions">
                        <button type="button" class="btn-primary" onClick={() => setValue(value + 1)}>Increment</button>
                        <button type="button" onClick={() => setValue(value - 1)}>Decrement</button>
                    </div>
                </div>
            </section>
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head"><h2>✧ test card</h2></div>
                <div class="mwa-wiki-panel-body"><TestCard /></div>
            </section>
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head"><h2>☆ users</h2></div>
                <div class="mwa-wiki-panel-body">
                    {error && <p class="mwa-wiki-note mwa-wiki-note--error" role="alert">{error}</p>}
                    {users === null ? (
                        <p class="mwa-wiki-muted">{t('usersLoginRequired')}</p>
                    ) : (
                        <>
                            <ul class="mwa-wiki-rows">
                                {users.map((u) => (
                                    <li key={u.id}>
                                        <div class="mwa-wiki-row">
                                            <div><strong>{u.username}</strong><small>{u.role}</small></div>
                                            <span>{u.currentBalance} pts</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div class="mwa-wiki-actions"><button type="button" class="btn-primary" onClick={refreshUsers}>Refresh</button></div>
                        </>
                    )}
                </div>
            </section>
        </PageShell>
    );
}
