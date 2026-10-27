import { useContext } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import type { GroupRow, LeaderboardBoard, PlayerRow } from '#src/db/leaderboard.js';
import PageShell from './PageShell.js';

type LeaderboardPageProps = { board: LeaderboardBoard } & (
    | { scope: 'players'; rows: PlayerRow[]; viewerGroupId: number | null }
    | { scope: 'groups'; groups: GroupRow[] }
);

export const leaderboardPage: Page<LeaderboardPageProps> = {
    Component: LeaderboardPage,
    title: (t) => t('titleLeaderboard'),
};

const boards = ['activity', 'gambling', 'combined'] as const;
const scopes = ['players', 'groups'] as const;

const boardLabelKey = {
    activity: 'leaderboardActivity',
    gambling: 'leaderboardGambling',
    combined: 'leaderboardCombined',
} as const;

const scopeLabelKey = {
    players: 'leaderboardPlayers',
    groups: 'leaderboardGroups',
} as const;

function LeaderboardPage(props: LeaderboardPageProps) {
    const { t, user } = useContext(ClientContext);
    const { board, scope } = props;
    return (
        <PageShell section="leaderboard">
            <nav class="mwa-tabbar" aria-label={t('leaderboardTypeLabel')}>
                {boards.map((b) => (
                    <a
                        key={b}
                        href={`/app/leaderboard?board=${b}&scope=${scope}`}
                        aria-current={b === board ? 'page' : undefined}
                    >
                        {t(boardLabelKey[b])}
                    </a>
                ))}
            </nav>
            <nav class="mwa-tabbar" aria-label={t('leaderboardScopeLabel')}>
                {scopes.map((s) => (
                    <a
                        key={s}
                        href={`/app/leaderboard?board=${board}&scope=${s}`}
                        aria-current={s === scope ? 'page' : undefined}
                    >
                        {t(scopeLabelKey[s])}
                    </a>
                ))}
            </nav>
            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('leaderboardRankings', { type: t(boardLabelKey[board]) })}</h2>
                </div>
                <div class="mwa-panel-body">
                    {props.scope === 'players' ? (
                        props.rows.length === 0 ? (
                            <p class="mwa-muted">{t('leaderboardNoPlayers')}</p>
                        ) : (
                            <ol class="mwa-rows mwa-rows--inset">
                                {props.rows.map((row, index) => {
                                    const isSelf = row.userId === user?.id;
                                    const isGroupmate =
                                        !isSelf &&
                                        props.viewerGroupId !== null &&
                                        row.groupId === props.viewerGroupId;
                                    return (
                                        <li
                                            key={row.userId}
                                            class={
                                                isSelf
                                                    ? 'mwa-row--self'
                                                    : isGroupmate
                                                      ? 'mwa-row--group'
                                                      : undefined
                                            }
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
                                                    {row.score} {t('currencyName')}
                                                    {board === 'gambling' && (
                                                        <small>
                                                            {' '}
                                                            ·{' '}
                                                            {t('leaderboardGames', {
                                                                n: String(row.gamesPlayed ?? 0),
                                                            })}
                                                        </small>
                                                    )}
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
                        <ol class="mwa-rows mwa-rows--inset">
                            {props.groups.map((group, index) => (
                                <li key={group.id}>
                                    <div class="mwa-row">
                                        <span>
                                            <strong>{index + 1}</strong>. {group.name}
                                            <small>
                                                {' '}
                                                {t('leaderboardMemberCount', {
                                                    n: String(group.memberCount),
                                                })}
                                            </small>
                                        </span>
                                        <strong>
                                            {group.score} {t('currencyName')}
                                        </strong>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </section>
        </PageShell>
    );
}
