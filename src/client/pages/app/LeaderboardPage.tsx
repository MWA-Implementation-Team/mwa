import { useContext } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import type { LeaderboardRow } from '#src/db/leaderboard.js';
import PageShell from './PageShell.js';

export type LeaderboardType = 'team' | 'group';

// rows yra null kai team tab'as neturi grupes rankinimui
type LeaderboardPageProps = { type: LeaderboardType; rows: LeaderboardRow[] | null };

export const leaderboardPage: Page<LeaderboardPageProps> = {
    Component: LeaderboardPage,
    title: (t) => t('titleLeaderboard'),
};

const typeLabelKey = {
    team: 'leaderboardTeam',
    group: 'leaderboardGroup',
} as const;

function LeaderboardPage({ type, rows }: LeaderboardPageProps) {
    const { t, user } = useContext(ClientContext);
    return (
        <PageShell section="leaderboard">
            <nav class="mwa-tabbar" aria-label={t('leaderboardTypeLabel')}>
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
            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('leaderboardRankings', { type: t(typeLabelKey[type]) })}</h2>
                </div>
                <div class="mwa-panel-body">
                    {type === 'team' ? (
                        rows === null ? (
                            <p class="mwa-muted">{t('leaderboardNoGroup')}</p>
                        ) : (
                            <ol class="mwa-rows">
                                {rows.map((row, index) => {
                                    const isSelf = row.userId === user?.id;
                                    return (
                                        <li
                                            key={row.userId}
                                            class={isSelf ? 'mwa-row--self' : undefined}
                                        >
                                            <div class="mwa-row">
                                                <span>
                                                    <strong>{index + 1}</strong>.{row.username}
                                                    {isSelf && <small>{t('leaderboardYou')}</small>}
                                                </span>
                                                <strong>
                                                    {row.points} {t('currencyName')}
                                                </strong>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        )
                    ) : (
                        <p class="mwa-muted">
                            {t('leaderboardTodo', { type: t(typeLabelKey[type]) })}
                        </p>
                    )}
                </div>
            </section>
        </PageShell>
    );
}
