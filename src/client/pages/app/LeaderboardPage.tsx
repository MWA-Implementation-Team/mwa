import { useContext } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import PageShell from './PageShell.js';

export type LeaderboardType = 'team' | 'group';

type LeaderboardPageProps = { type: LeaderboardType };

export const leaderboardPage: Page<LeaderboardPageProps> = {
    Component: LeaderboardPage,
    title: (t) => t('titleLeaderboard'),
};

const typeLabelKey = {
    team: 'leaderboardTeam',
    group: 'leaderboardGroup',
} as const;

function LeaderboardPage({ type }: LeaderboardPageProps) {
    const { t } = useContext(ClientContext);
    return (
        <PageShell section="leaderboard">
            <nav class="mwa-wiki-tabbar" aria-label={t('leaderboardTypeLabel')}>
                <a
                    href="/app/leaderboard?type=team"
                    aria-current={type === 'team' ? 'page' : undefined}
                >
                    {t('leaderboardTeam')}
                </a>
                <a
                    href="/app/leaderboard?type=group"
                    aria-current={type === 'group' ? 'page' : undefined}
                >
                    {t('leaderboardGroup')}
                </a>
            </nav>
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('leaderboardRankings', { type: t(typeLabelKey[type]) })}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-muted">
                        {t('leaderboardTodo', { type: t(typeLabelKey[type]) })}
                    </p>
                </div>
            </section>
        </PageShell>
    );
}
