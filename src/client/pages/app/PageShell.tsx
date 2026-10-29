import type { ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';
import { ClientContext, Notification } from '#src/client/context.js';
import LanguageToggle from '#src/client/ui/LanguageToggle.js';
import QrPane from '#src/client/ui/QrPane.js';
import { displayActor } from '#src/client/display.js';

export type Section =
    | 'home'
    | 'activities'
    | 'group'
    | 'leaderboard'
    | 'account'
    | 'host'
    | 'admin'
    | 'gambling'
    | 'interact'
    | 'landing'
    | 'login';

type PageShellProps = {
    section: Section;
    nav?: boolean;
    // hides the live notification banner — gambling session pages suppress it
    // so an invite doesn't render inside its own session view
    hideNotification?: boolean;
    // replaces the default sidebar (logo + nav + qr + language panes)
    side?: ComponentChildren;
    children: ComponentChildren;
};

// App-frame presentation; the visual styles live in shell.css.
export default function PageShell({
    section,
    nav = true,
    hideNotification = false,
    side,
    children,
}: PageShellProps) {
    const { t, user, qr, notification } = useContext(ClientContext);

    const navigation = [
        { section: 'home', label: t('headerHome'), href: '/app' },
        { section: 'activities', label: t('headerActivities'), href: '/app/activities' },
        {
            section: 'leaderboard',
            label: t('headerLeaderboard'),
            href: '/app/leaderboard?type=team',
        },
        { section: 'gambling', label: t('headerGambling'), href: '/app/gambling' },
        { section: 'account', label: t('headerAccount'), href: '/app/account' },
    ];
    if (user && (user.role === 'host' || user.role === 'admin')) {
        navigation.push({ section: 'host', label: t('headerHost'), href: '/app/host' });
    }

    const sidebar = side ?? (
        <>
            <section class="landing-section landing-pane-brand">
                <div class="landing-welcome">
                    <a href="/" class="mwa-logo" aria-label={t('shellLogoAlt')}>
                        <img src="/3Logotipas.png" alt={t('shellLogoAlt')} />
                    </a>
                </div>
            </section>
            {nav && (
                <section class="landing-section landing-pane-nav">
                    <h2>{t('navTitle')}</h2>
                    <nav aria-label={t('shellNavLabel')}>
                        <ul class="landing-menu">
                            {navigation.map((item) => (
                                <li key={item.section}>
                                    <a
                                        class="mwa-navbar-menu"
                                        href={item.href}
                                        aria-current={item.section === section ? 'page' : undefined}
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                            {user && (
                                <li>
                                    <form method="POST" action="/app" class="landing-menu-logout">
                                        <button type="submit" class="mwa-navbar-menu">
                                            {t('logOut')}
                                        </button>
                                    </form>
                                </li>
                            )}
                        </ul>
                    </nav>
                </section>
            )}
            {qr && <QrPane />}
            <section class="landing-section landing-pane-lang">
                <h2>{t('landingLangTitle')}</h2>
                <div class="landing-footer">
                    <LanguageToggle />
                </div>
            </section>
        </>
    );

    return (
        <div class="mwa">
            <a class="mwa-skip" href="#mwa-main">
                {t('shellSkip')}
            </a>
            <div class={`mwa-frame mwa-frame--${section}`}>
                <div class="landing-grid">
                    <div class="landing-col landing-col--side">{sidebar}</div>
                    <main id="mwa-main" class="landing-col landing-col--main">
                        {notification && !hideNotification && (
                            <NotificationBanner notification={notification} />
                        )}
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

// Live notification (gambling invite / running game) pinned to the top of the
// main column — fed by /api/notifications through ClientContext.
function NotificationBanner({ notification }: { notification: Notification }) {
    const { t, user } = useContext(ClientContext);
    const sessionHref = `/app/gambling/sessions/${encodeURIComponent(notification.sessionId)}`;

    return (
        <section class="mwa-panel">
            <div class="mwa-panel-body">
                {notification.type === 'gambling_invite' ? (
                    <>
                        <p class="mwa-intro">
                            {t('gamblingNotificationInvite', {
                                player: displayActor(notification.inviterName, user, t),
                            })}
                        </p>
                        <div class="mwa-actions">
                            <a class="button" href={sessionHref}>
                                {t('gamblingOpen')}
                            </a>
                            <form method="POST" action={`${sessionHref}/reject`}>
                                <button type="submit">{t('gamblingReject')}</button>
                            </form>
                        </div>
                    </>
                ) : (
                    <>
                        <p class="mwa-intro">{t('gamblingInProgress')}</p>
                        <div class="mwa-actions">
                            <a class="button" href={sessionHref}>
                                {t('gamblingReturn')}
                            </a>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
