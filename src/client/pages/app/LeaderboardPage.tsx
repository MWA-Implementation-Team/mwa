import { Fragment } from 'preact';
import { useContext } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import type { GroupRow, LeaderboardBoard, PlayerRow } from '#src/db/leaderboard/index.js';
import { displayActor } from '#src/client/display.js';
import PageShell from './PageShell.js';

type LeaderboardPageProps = {
    board: LeaderboardBoard;
    viewerGroupId: number | null;
} & ({ scope: 'players'; rows: PlayerRow[] } | { scope: 'groups'; groups: GroupRow[] });

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
    const { t } = useContext(ClientContext);
    const { board, scope } = props;
    return (
        <PageShell section="leaderboard">
            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('leaderboardRankings', { type: t(boardLabelKey[board]) })}</h2>
                </div>
                <div class="mwa-panel-body">
                    <div class="mwa-lb-toolbar">
                        <nav
                            class="mwa-tabbar mwa-tabbar--compact"
                            aria-label={t('leaderboardTypeLabel')}
                        >
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
                        <nav class="mwa-scope" aria-label={t('leaderboardScopeLabel')}>
                            {scopes.map((s, i) => (
                                <Fragment key={s}>
                                    {i > 0 && <span class="lang-links-sep">·</span>}
                                    {s === scope ? (
                                        <strong aria-current="page">{t(scopeLabelKey[s])}</strong>
                                    ) : (
                                        <a href={`/app/leaderboard?board=${board}&scope=${s}`}>
                                            {t(scopeLabelKey[s])}
                                        </a>
                                    )}
                                </Fragment>
                            ))}
                        </nav>
                    </div>
                    {props.scope === 'players' ? (
                        <PlayersTable
                            board={board}
                            rows={props.rows}
                            viewerGroupId={props.viewerGroupId}
                        />
                    ) : (
                        <GroupsTable groups={props.groups} viewerGroupId={props.viewerGroupId} />
                    )}
                </div>
            </section>
        </PageShell>
    );
}

function PlayersTable({
    board,
    rows,
    viewerGroupId,
}: {
    board: LeaderboardBoard;
    rows: PlayerRow[];
    viewerGroupId: number | null;
}) {
    const { t, user } = useContext(ClientContext);
    if (rows.length === 0) return <p class="mwa-muted">{t('leaderboardNoPlayers')}</p>;

    const viewerIndex = rows.findIndex((row) => row.userId === user?.id);
    const viewerRow = viewerIndex >= 0 ? rows[viewerIndex] : null;
    const games = board === 'gambling';
    const pinned = rows.length > 20;

    return (
        <div class="table mwa-tx mwa-lb">
            <table>
                <thead>
                    <tr>
                        <th class="mwa-lb-rank">#</th>
                        <th>{t('leaderboardPlayers')}</th>
                        {games && <th class="mwa-tx-amount">{t('leaderboardColGames')}</th>}
                        <th class="mwa-tx-amount">{t('currencyName')}</th>
                    </tr>
                </thead>
                <tbody>
                    {pinned && (
                        <tr class="mwa-lb-you">
                            <td class="mwa-lb-rank">{viewerIndex >= 0 ? viewerIndex + 1 : '—'}</td>
                            <td>{t('leaderboardYou')}</td>
                            {games && (
                                <td class="mwa-tx-amount">{viewerRow?.gamesPlayed ?? '—'}</td>
                            )}
                            <td class="mwa-tx-amount">
                                {viewerRow ? viewerRow.score.toFixed(2) : '—'}
                            </td>
                        </tr>
                    )}
                    {rows.map((row, index) => {
                        const isSelf = row.userId === user?.id;
                        const isGroupmate =
                            !isSelf && viewerGroupId !== null && row.groupId === viewerGroupId;
                        return (
                            <tr
                                key={row.userId}
                                class={
                                    isSelf
                                        ? 'mwa-lb--self'
                                        : isGroupmate
                                          ? 'mwa-lb--group'
                                          : undefined
                                }
                            >
                                <td class="mwa-lb-rank">{index + 1}</td>
                                <td>{displayActor(row.username, user, t)}</td>
                                {games && <td class="mwa-tx-amount">{row.gamesPlayed ?? 0}</td>}
                                <td class="mwa-tx-amount">{row.score.toFixed(2)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function GroupsTable({
    groups,
    viewerGroupId,
}: {
    groups: GroupRow[];
    viewerGroupId: number | null;
}) {
    const { t } = useContext(ClientContext);
    if (groups.length === 0) return <p class="mwa-muted">{t('leaderboardNoGroups')}</p>;

    const viewerIndex = groups.findIndex((g) => g.id === viewerGroupId);
    const viewerGroup = viewerIndex >= 0 ? groups[viewerIndex] : null;
    const pinned = groups.length > 20;

    return (
        <div class="table mwa-tx mwa-lb">
            <table>
                <thead>
                    <tr>
                        <th class="mwa-lb-rank">#</th>
                        <th>{t('leaderboardGroups')}</th>
                        <th class="mwa-tx-amount">{t('leaderboardColMembers')}</th>
                        <th class="mwa-tx-amount">{t('currencyName')}</th>
                    </tr>
                </thead>
                <tbody>
                    {pinned && (
                        <tr class="mwa-lb-you">
                            <td class="mwa-lb-rank">{viewerIndex >= 0 ? viewerIndex + 1 : '—'}</td>
                            <td>{viewerGroup?.name ?? '—'}</td>
                            <td class="mwa-tx-amount">{viewerGroup?.memberCount ?? '—'}</td>
                            <td class="mwa-tx-amount">
                                {viewerGroup ? viewerGroup.score.toFixed(2) : '—'}
                            </td>
                        </tr>
                    )}
                    {groups.map((group, index) => (
                        <tr
                            key={group.id}
                            class={group.id === viewerGroupId ? 'mwa-lb--self' : undefined}
                        >
                            <td class="mwa-lb-rank">{index + 1}</td>
                            <td>{group.name}</td>
                            <td class="mwa-tx-amount">{group.memberCount}</td>
                            <td class="mwa-tx-amount">{group.score.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
