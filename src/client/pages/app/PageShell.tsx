import type { ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';
import { ClientContext, Notification } from '#src/client/context.js';
import LanguageToggle from '#src/client/ui/LanguageToggle.js';
import QrPane from '#src/client/ui/QrPane.js';

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

// Wiki-inspired presentation; the visual styles live in wiki.css.
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
        { section: 'group', label: t('headerGroup'), href: '/app/group' },
        {
            section: 'leaderboard',
            label: t('headerLeaderboard'),
            href: '/app/leaderboard?type=team',
        },
        { section: 'gambling', label: t('headerGambling'), href: '/app/gambling' },
        { section: 'account', label: t('headerAccount'), href: '/app/account' },
        ...(user && (user.role === 'host' || user.role === 'admin')
            ? [{ section: 'host', label: t('headerHost'), href: '/app/host' }]
            : []),
    ];

    const sidebar = side ?? (
        <>
            <section class="landing-section landing-pane-brand">
                <div class="landing-welcome">
                    <a href="/" class="mwa-wiki-logo" aria-label={t('wikiLogoAlt')}>
                        <img src="/3Logotipas.png" alt={t('wikiLogoAlt')} />
                    </a>
                </div>
            </section>
            {nav && (
                <section class="landing-section landing-pane-nav">
                    <h2>{t('navTitle')}</h2>
                    <nav aria-label={t('wikiNavLabel')}>
                        <ul class="landing-menu">
                            {navigation.map((item) => (
                                <li key={item.section}>
                                    <a
                                        href={item.href}
                                        aria-current={item.section === section ? 'page' : undefined}
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    {user && (
                        <form method="POST" action="/app" class="landing-menu-logout">
                            <button type="submit" class="mwa-wiki-danger">
                                {t('logOut')}
                            </button>
                        </form>
                    )}
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
        <div class="mwa-wiki">
            <a class="mwa-wiki-skip" href="#mwa-wiki-main">
                {t('wikiSkip')}
            </a>
            <div class={`mwa-wiki-frame mwa-wiki-frame--${section}`}>
                <div class="landing-grid">
                    <div class="landing-col landing-col--side">{sidebar}</div>
                    <main id="mwa-wiki-main" class="landing-col landing-col--main">
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
    const { t } = useContext(ClientContext);
    const sessionHref = `/app/gambling/sessions/${encodeURIComponent(notification.sessionId)}`;

    return (
        <section class="mwa-wiki-panel">
            <div class="mwa-wiki-panel-body">
                {notification.type === 'gambling_invite' ? (
                    <>
                        <p class="mwa-wiki-intro">
                            {t('gamblingNotificationInvite', {
                                player: notification.inviterName,
                            })}
                        </p>
                        <div class="mwa-wiki-actions">
                            <a class="btn-primary" href={sessionHref}>
                                {t('gamblingOpen')}
                            </a>
                            <form method="POST" action={`${sessionHref}/reject`}>
                                <button type="submit">{t('gamblingReject')}</button>
                            </form>
                        </div>
                    </>
                ) : (
                    <>
                        <p class="mwa-wiki-intro">{t('gamblingInProgress')}</p>
                        <div class="mwa-wiki-actions">
                            <a class="btn-primary" href={sessionHref}>
                                {t('gamblingReturn')}
                            </a>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
