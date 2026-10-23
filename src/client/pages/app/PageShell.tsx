import type { ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import LanguageToggle from '#src/client/ui/LanguageToggle.js';

export type Section =
    | 'home'
    | 'activities'
    | 'group'
    | 'leaderboard'
    | 'account'
    | 'host'
    | 'admin'
    | 'casino'
    | 'interact'
    | 'landing'
    | 'login';

type PageShellProps = {
    title: string;
    section: Section;
    subtitle?: string;
    nav?: boolean;
    children: ComponentChildren;
};

// Wiki-inspired presentation; the visual styles live in wiki.css.
export default function PageShell({
    title,
    section,
    subtitle,
    nav = true,
    children,
}: PageShellProps) {
    const { t, user } = useContext(ClientContext);

    const navigation = [
        { section: 'home', label: t('headerHome'), href: '/app' },
        { section: 'activities', label: t('headerActivities'), href: '/app/activities' },
        { section: 'group', label: t('headerGroup'), href: '/app/group' },
        {
            section: 'leaderboard',
            label: t('headerLeaderboard'),
            href: '/app/leaderboard?type=team',
        },
        { section: 'account', label: t('headerAccount'), href: '/app/account' },
        ...(user && (user.role === 'host' || user.role === 'admin')
            ? [{ section: 'host', label: t('headerHost'), href: '/app/host' }]
            : []),
    ];

    return (
        <div class="mwa-wiki">
            <a class="mwa-wiki-skip" href="#mwa-wiki-main">
                {t('wikiSkip')}
            </a>
            <div class="mwa-wiki-frame">
                <div class="mwa-wiki-topline">
                    <span>{t('wikiTopline')}</span>
                    <span class="mwa-wiki-topline-right">{t('wikiTaglineRight')}</span>
                </div>

                <header class="mwa-wiki-brand">
                    <a href="/" class="mwa-wiki-logo" aria-label={t('wikiLogoAlt')}>
                        <img src="/3Logotipas.png" alt={t('wikiLogoAlt')} />
                    </a>
                    <p>{t('wikiTagline')}</p>
                </header>

                {nav && (
                    <nav class="mwa-wiki-nav" aria-label={t('wikiNavLabel')}>
                        {navigation.map((item) => (
                            <a
                                key={item.section}
                                href={item.href}
                                aria-current={item.section === section ? 'page' : undefined}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                )}

                <main id="mwa-wiki-main" class="mwa-wiki-main">
                    <div class="mwa-wiki-heading">
                        <p class="mwa-wiki-path">/mwa/{section}/</p>
                        <h1>{title}</h1>
                        {subtitle && <p class="mwa-wiki-subtitle">{subtitle}</p>}
                    </div>
                    <div class="mwa-wiki-stack">{children}</div>
                </main>

                <footer class="mwa-wiki-footer">
                    <span>{t('wikiFooter')}</span>
                    <LanguageToggle />
                    <a href="#mwa-wiki-main">{t('wikiBackTop')}</a>
                </footer>
            </div>
        </div>
    );
}
