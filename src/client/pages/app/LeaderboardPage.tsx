import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import PageShell from './PageShell.js';

export type LeaderboardType = 'team' | 'group';

type LeaderboardPageProps = {
    type: LeaderboardType;
};

export const leaderboardPage: Page<LeaderboardPageProps> = {
    Component: LeaderboardPage,
    title: (t) => t('titleLeaderboard'),
};

function LeaderboardPage({ type }: LeaderboardPageProps) {
    return (
        <>
            <Header />
            <PageShell title="Leaderboard" subtitle="Switch between team and group rankings.">
                <section class="mwa-panel">
                    <nav class="mwa-tabbar" aria-label="Leaderboard type">
                        <a class={type === 'team' ? 'is-active' : ''} href="/app/leaderboard?type=team" aria-current={type === 'team' ? 'page' : undefined}>Team</a>
                        <a class={type === 'group' ? 'is-active' : ''} href="/app/leaderboard?type=group" aria-current={type === 'group' ? 'page' : undefined}>Group</a>
                    </nav>
                    <div class="mwa-panel-body">
                        <div class="mwa-empty">
                            <h3>{type === 'team' ? 'Team leaderboard' : 'Group leaderboard'}</h3>
                            <p>TODO: {type} leaderboard.</p>
                        </div>
                    </div>
                </section>
            </PageShell>
        </>
    );
}
