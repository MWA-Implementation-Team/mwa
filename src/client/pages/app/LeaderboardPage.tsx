import { Page } from '#src/client/pages.js';
import PageShell from './PageShell.js';

export type LeaderboardType = 'team' | 'group';

type LeaderboardPageProps = { type: LeaderboardType };

export const leaderboardPage: Page<LeaderboardPageProps> = {
    Component: LeaderboardPage,
    title: (t) => t('titleLeaderboard'),
};

function LeaderboardPage({ type }: LeaderboardPageProps) {
    return (
        <PageShell section="leaderboard" title="leaderboard" subtitle="standingz & rankings ✦">
            <nav class="mwa-wiki-tabbar" aria-label="Leaderboard type">
                <a href="/app/leaderboard?type=team" aria-current={type === 'team' ? 'page' : undefined}>team</a>
                <a href="/app/leaderboard?type=group" aria-current={type === 'group' ? 'page' : undefined}>group</a>
            </nav>
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head"><h2>☆ {type} rankings</h2></div>
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-muted">TODO: {type} leaderboard.</p>
                </div>
            </section>
        </PageShell>
    );
}
