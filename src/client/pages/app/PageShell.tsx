import type { ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';
import { ClientContext, Notification } from '#src/client/context.js';
import Dialog from '#src/client/ui/Dialog.js';
import LanguageToggle from '#src/client/ui/LanguageToggle.js';
import QrPane from '#src/client/ui/QrPane.js';
import InteractCodePane from '#src/client/ui/InteractCodePane.js';
import { displayActor } from '#src/client/display.js';

export type Section =
    | 'home'
    | 'leaderboard'
    | 'host'
    | 'admin'
    | 'gambling'
    | 'interact'
    | 'landing'
    | 'login'
    | 'error';

type PageShellProps = {
    section: Section;
    nav?: boolean;
    // hides the live notification modal — gambling session pages suppress it
    // so an invite doesn't render inside its own session view
    hideNotification?: boolean;
    // replaces the default sidebar (logo + nav + qr + language panes)
    side?: ComponentChildren;
    children: ComponentChildren;
};

// App-frame presentation; the visual styles live in static/style/.
export default function PageShell({
    section,
    nav = true,
    hideNotification = false,
    side,
    children,
}: PageShellProps) {
    const { t, user, qr, notification } = useContext(ClientContext);

    const showAlert = notification !== null && !hideNotification;

    const navigation = [
        { section: 'home', label: t('headerHome'), href: '/app' },
        {
            section: 'leaderboard',
            label: t('headerLeaderboard'),
            href: '/app/leaderboard?scope=groups',
        },
        { section: 'gambling', label: t('headerGambling'), href: '/app/gambling' },
    ];
    if (user && (user.role === 'host' || user.role === 'admin')) {
        navigation.push({ section: 'host', label: t('headerHost'), href: '/app/host' });
    }
    // In dev the page lets any signed-in user in; the nav entry stays
    // admin-only so the real audience is the one that sees it.
    if (user && user.role === 'admin') {
        navigation.push({ section: 'admin', label: t('headerAdmin'), href: '/app/admin' });
    }

    const sidebar = side ?? (
        <>
            <section class="landing-section landing-pane-brand">
                <div class="landing-welcome">
                    <a href="/" class="mwa-logo" aria-label={t('shellLogoAlt')}>
                        <img src="/logo.webp" alt={t('shellLogoAlt')} />
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
                                        class="mwa-button"
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
                                        <button type="submit" class="mwa-button">
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
            {qr && <InteractCodePane />}
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
                        {children}
                    </main>
                </div>
            </div>
            {showAlert && (
                <Dialog
                    isOpen
                    closable={false}
                    title={t('shellAlert')}
                    class="mwa-dialog--half"
                    actions={<NotificationActions notification={notification} />}
                >
                    <div>
                        <NotificationBody notification={notification} />
                    </div>
                </Dialog>
            )}
        </div>
    );
}

// Live notification (gambling invite / running game) fed by /api/notifications
// through ClientContext — shown as a modal.
function NotificationBody({ notification }: { notification: Notification }) {
    const { t, user } = useContext(ClientContext);

    if (notification.type === 'group_invite') {
        return (
            <>
                <p class="mwa-intro">
                    {t('groupInviteNotice', {
                        player: displayActor(notification.inviterName, user, t),
                    })}
                </p>
                {notification.createsTeam && <p class="mwa-muted">{t('groupInviteCreates')}</p>}
            </>
        );
    }

    return (
        <p class="mwa-intro">
            {notification.type === 'gambling_invite'
                ? t('gamblingNotificationInvite', {
                      player: displayActor(notification.inviterName, user, t),
                  })
                : t('gamblingInProgress')}
        </p>
    );
}

function NotificationActions({ notification }: { notification: Notification }) {
    const { t } = useContext(ClientContext);

    if (notification.type === 'group_invite') {
        const inviteHref = `/app/groups/invites/${encodeURIComponent(notification.inviteId)}`;
        return (
            <>
                <form method="POST" action={`${inviteHref}/reject`}>
                    <button type="submit" class="mwa-button">
                        {t('gamblingReject')}
                    </button>
                </form>
                <form method="POST" action={`${inviteHref}/accept`}>
                    <button type="submit" class="mwa-button">
                        {t('groupInviteAccept')}
                    </button>
                </form>
            </>
        );
    }

    const sessionHref = `/app/gambling/sessions/${encodeURIComponent(notification.sessionId)}`;
    return notification.type === 'gambling_invite' ? (
        <>
            <form method="POST" action={`${sessionHref}/reject`}>
                <button type="submit" class="mwa-button">
                    {t('gamblingReject')}
                </button>
            </form>
            <a class="mwa-button" href={sessionHref}>
                {t('gamblingOpen')}
            </a>
        </>
    ) : (
        <a class="mwa-button" href={sessionHref}>
            {t('gamblingReturn')}
        </a>
    );
}
