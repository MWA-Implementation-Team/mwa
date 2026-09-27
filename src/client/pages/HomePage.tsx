import { useState } from 'preact/hooks';
import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import { fetchUsers, User } from '#src/client/api/users.js';

// `users` comes from the route (SSR) — it exists in the initial HTML.
// useState(initial) keeps it live so fetchUsers() can refresh it client-side.
type HomePageProps = {
    users: User[] | null;
};

export const homePage: Page<HomePageProps> = {
    Component: HomePage,
    title: (t) => t('titleHome'),
};

function HomePage({ users: initialUsers }: HomePageProps) {
    const [value, setValue] = useState(0);
    const [users, setUsers] = useState(initialUsers);
    const [error, setError] = useState<string | null>(null);

    function refreshUsers() {
        fetchUsers().then(setUsers, (e) => setError(e.message));
    }

    return (
        <>
            <Header />

            <h1>MWA Event: {value}</h1>
            <button onClick={() => setValue(value + 1)}>Increment</button>
            <button onClick={() => setValue(value - 1)}>Decrement</button>

            <h2>Users</h2>
            {error && <p class="error-message">{error}</p>}
            {users === null ? (
                <p>Log in to see users.</p>
            ) : (
                <>
                    <ul>
                        {users.map((u) => (
                            <li key={u.id}>
                                {u.username} ({u.type}) — {u.balance_current} pts
                            </li>
                        ))}
                    </ul>
                    <button onClick={refreshUsers}>Refresh</button>
                </>
            )}
        </>
    );
}
