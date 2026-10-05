import { useContext } from 'preact/hooks';
import { ClientContext } from '../context.js';
import ThemeToggle from './ThemeToggle.js';
import LanguageToggle from './LanguageToggle.js';

export default function Header() {
    const { t, user } = useContext(ClientContext);

    return (
        <nav>
            <img src="/Logotipas.png" style={'width:200px;'} />
            <ul>
                <li>
                    <a href="/">{t('headerLanding')}</a>
                </li>
                <li>
                    {!user ? (
                        <a href="/login">{t('headerLogin')}</a>
                    ) : (
                        <a href="/app">
                            {t('headerHome')} ({user.username})
                        </a>
                    )}
                </li>
                {user && (
                    <>
                        <li>
                            <a href="/app/activities">{t('headerActivities')}</a>
                        </li>
                        <li>
                            <a href="/app/leaderboard">{t('headerLeaderboard')}</a>
                        </li>
                        <li>
                            <a href="/app/group">{t('headerGroup')}</a>
                        </li>
                        <li>
                            <a href="/app/account">{t('headerAccount')}</a>
                        </li>
                        {user.role === 'admin' && (
                            <li>
                                <a href="/admin">{t('headerAdmin')}</a>
                            </li>
                        )}
                    </>
                )}
            </ul>
            <ThemeToggle />
            <LanguageToggle />
        </nav>
    );
}
