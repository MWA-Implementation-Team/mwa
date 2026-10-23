import type { ComponentChildren } from 'preact';
import Header from '#src/client/ui/Header.js';

type Section =
    | 'home'
    | 'activities'
    | 'groups'
    | 'leaderboard'
    | 'account'
    | 'admin'
    | 'casino'
    | 'login';

type PageShellProps = {
    title: string;
    section: Section;
    subtitle?: string;
    children: ComponentChildren;
};

// Wiki-inspired presentation, while the existing Header retains the original app controls.
// The visual styles live in wiki.css, imported by the project's main.css.
const navigation = [
    { section: 'home', label: 'home', href: '/app' },
    { section: 'activities', label: 'activities', href: '/app/activities' },
    { section: 'groups', label: 'groupz', href: '/app/groups' },
    { section: 'leaderboard', label: 'rankings', href: '/app/leaderboard?type=team' },
    { section: 'account', label: 'account', href: '/app/account' },
] as const;

export default function PageShell({ title, section, subtitle, children }: PageShellProps) {
    return (
        <div class="mwa-wiki">
            <a class="mwa-wiki-skip" href="#mwa-wiki-main">Skip to content</a>
            <div class="mwa-wiki-frame">
                <div class="mwa-wiki-topline">
                    <span>✦ MWA EVENT ✦</span>
                    <span class="mwa-wiki-topline-right">~ connected to the mifverse ~</span>
                </div>

                <header class="mwa-wiki-brand">
                    <a href="/app" class="mwa-wiki-logo" aria-label="MWA Event home">
                        <img src="/3Logotipas.png" alt="MWA Event" />
                    </a>
                    <p>the event corner of the internet ☆</p>
                </header>

                <nav class="mwa-wiki-nav" aria-label="Main navigation">
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

                <details class="mwa-wiki-existing-menu">
                    <summary>site controls +</summary>
                    <div class="mwa-wiki-existing-menu-content"><Header /></div>
                </details>

                <main id="mwa-wiki-main" class="mwa-wiki-main">
                    <div class="mwa-wiki-heading">
                        <p class="mwa-wiki-path">/mwa/{section}/</p>
                        <h1>{title}</h1>
                        {subtitle && <p class="mwa-wiki-subtitle">{subtitle}</p>}
                    </div>
                    <div class="mwa-wiki-stack">{children}</div>
                </main>

                <footer class="mwa-wiki-footer">
                    <span>✦ made for the MWA event ✦</span>
                    <a href="#mwa-wiki-main">back to top ↑</a>
                </footer>
            </div>
        </div>
    );
}
