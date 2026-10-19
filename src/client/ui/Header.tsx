import { useContext, useEffect, useState } from 'preact/hooks';
import { ClientContext } from '../context.js';
import ThemeToggle from './ThemeToggle.js';
import LanguageToggle from './LanguageToggle.js';
import { CloseIcon, MenuIcon } from './icons.js';

export default function Header() {
    const { t, user } = useContext(ClientContext);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        if (!drawerOpen) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [drawerOpen]);

    const closeDrawer = () => setDrawerOpen(false);

    return (
        <>
            <header class="site-header">
                <div class="nav-effect" aria-hidden="true" />
                <div class="header-inner">
                    <button
                        class="menu-button"
                        aria-label={t('menuTitle')}
                        aria-expanded={drawerOpen}
                        onClick={() => setDrawerOpen(true)}
                    >
                        <MenuIcon />
                    </button>

                    <a href="/" class="site-logo">
                        <span class="logo-box">M</span>
                        <span class="logo-text">MWA</span>
                    </a>

                    {user ? (
                        <a href="/app" class="btn btn-outline btn-sm">
                            {user.username}
                        </a>
                    ) : (
                        <a href="/login" class="btn btn-outline btn-sm">
                            {t('headerLogin')}
                        </a>
                    )}
                </div>
            </header>

            <div class={drawerOpen ? 'nav-drawer open' : 'nav-drawer'}>
                <div class="drawer-overlay" onClick={closeDrawer} />

                <div class="drawer">
                    <div>
                        <div class="drawer-header">
                            <span class="drawer-title">{t('menuTitle')}</span>
                            <button
                                class="menu-button"
                                aria-label={t('menuClose')}
                                onClick={closeDrawer}
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <nav class="drawer-nav" onClick={closeDrawer}>
                            <a class="drawer-link" href="/">
                                {t('headerLanding')}
                            </a>
                            {user ? (
                                <>
                                    <a class="drawer-link" href="/app">
                                        {t('headerHome')}
                                    </a>
                                    <a class="drawer-link" href="/app/activities">
                                        {t('headerActivities')}
                                    </a>
                                    <a class="drawer-link" href="/app/leaderboard">
                                        {t('headerLeaderboard')}
                                    </a>
                                    <a class="drawer-link" href="/app/group">
                                        {t('headerGroup')}
                                    </a>
                                    <a class="drawer-link" href="/app/casino">
                                        {t('headerCasino')}
                                    </a>
                                    <a class="drawer-link" href="/app/account">
                                        {t('headerAccount')}
                                    </a>
                                    {user.role === 'admin' && (
                                        <a class="drawer-link" href="/admin">
                                            {t('headerAdmin')}
                                        </a>
                                    )}
                                </>
                            ) : (
                                <a class="drawer-link" href="/login">
                                    {t('headerLogin')}
                                </a>
                            )}
                        </nav>
                    </div>

                    <div class="drawer-footer">
                        <div class="drawer-toggles">
                            <ThemeToggle />
                            <LanguageToggle />
                        </div>

                        {user ? (
                            <form method="POST" action="/app">
                                <button type="submit" class="btn btn-primary btn-block">
                                    {t('logOut')}
                                </button>
                            </form>
                        ) : (
                            <a href="/login" class="btn btn-primary btn-block">
                                {t('logInSignUp')}
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
