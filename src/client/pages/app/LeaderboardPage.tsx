import { useContext } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import type { LeaderboardGroup, LeaderboardRow } from '#src/db/leaderboard.js';
import PageShell from './PageShell.js';

type LeaderboardPageProps =
    // rows is null when the viewer has no group
    { type: 'team'; rows: LeaderboardRow[] | null } | { type: 'group'; groups: LeaderboardGroup[] };

export const leaderboardPage: Page<LeaderboardPageProps> = {
    Component: LeaderboardPage,
    title: (t) => t('titleLeaderboard'),
};

const typeLabelKey = {
    team: 'leaderboardTeam',
    group: 'leaderboardGroup',
} as const;

function LeaderboardPage(props: LeaderboardPageProps) {
    const { t, user } = useContext(ClientContext);
    const { type } = props;
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
                    {props.type === 'team' ? (
                        props.rows === null ? (
                            <p class="mwa-muted">{t('leaderboardNoGroup')}</p>
                        ) : (
                            <ol class="mwa-rows mwa-rows--inset">
                                {props.rows.map((row, index) => {
                                    const isSelf = row.userId === user?.id;
                                    return (
                                        <li
                                            key={row.userId}
                                            class={isSelf ? 'mwa-row--self' : undefined}
                                        >
                                            <div class="mwa-row">
                                                <span>
                                                    <strong>{index + 1}</strong>. {row.username}
                                                    {isSelf && (
                                                        <span class="mwa-row-tag">
                                                            {t('leaderboardYou')}
                                                        </span>
                                                    )}
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
                    ) : props.groups.length === 0 ? (
                        <p class="mwa-muted">{t('leaderboardNoGroups')}</p>
                    ) : (
                        <ul class="mwa-rows mwa-rows--inset">
                            {props.groups.map((group) => (
                                <li key={group.id}>
                                    <div class="mwa-row">
                                        <strong>{group.name}</strong>
                                        <small>
                                            {t('leaderboardMemberCount', {
                                                n: String(group.memberCount),
                                            })}
                                        </small>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </PageShell>
    );
}
