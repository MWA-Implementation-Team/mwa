import { Page } from '#src/client/pages.js';
import { useContext, useState } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import { Transaction, TransactionKind } from '#src/client/api/transactions.js';
import { BookIcon, PhoneIcon } from '#src/client/ui/icons.js';
import PageShell from './PageShell.js';
import { Language } from '#src/client/language.js';
import type { LeaderboardBoard, ViewerStanding } from '#src/db/leaderboard/index.js';
import { displayActor, displayUsername } from '#src/client/display.js';

type HomePageProps = {
    transactions: Transaction[];
    groupName: string | null;
    groupEmoji: string;
    groupMemberCount: number | null;
    groupOwnerId: number | null;
    groupMembers: { userId: number; username: string }[];
    groupError?: keyof Language;
    queuePosition: number | null;
    queueError?: keyof Language;
    standings: ViewerStanding[];
};

export const homePage: Page<HomePageProps> = {
    Component: HomePage,
    title: (t) => t('titleHome'),
};

const transactionKindKey = {
    transfer: 'txTransfer',
    purchase: 'txPurchase',
    system: 'txSystem',
    gambling_deduction: 'txGamblingDeduction',
    gambling_winnings: 'txGamblingWinnings',
    host_grant: 'txHostGrant',
} as const satisfies Record<TransactionKind, keyof Language>;

const boardLabelKey = {
    activity: 'leaderboardActivity',
    gambling: 'leaderboardGambling',
    combined: 'leaderboardCombined',
} as const satisfies Record<LeaderboardBoard, keyof Language>;

const boardHintKey = {
    activity: 'leaderboardActivityHint',
    gambling: 'leaderboardGamblingHint',
    combined: 'leaderboardCombinedHint',
} as const satisfies Record<LeaderboardBoard, keyof Language>;

function HomePage({
    transactions,
    groupName,
    groupEmoji,
    groupMemberCount,
    groupOwnerId,
    groupMembers,
    groupError,
    queuePosition,
    queueError,
    standings,
}: HomePageProps) {
    const { t, user, lang } = useContext(ClientContext);
    const [guideOpen, setGuideOpen] = useState(false);

    return (
        <PageShell section="home">
            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('dashGame')}</h2>
                </div>
                <div class="mwa-panel-body mwa-queue-grid">
                    <div>
                        <div class="mwa-queue-art" aria-hidden="true">
                            {groupEmoji}
                        </div>
                        {queueError && (
                            <p class="mwa-note mwa-note--error" role="alert">
                                {t(queueError)}
                            </p>
                        )}

                        {groupMemberCount !== null && (
                            <p class="mwa-queue-members">
                                {t('queueGroupSize', { n: String(groupMemberCount) })}
                            </p>
                        )}

                        {queuePosition !== null ? (
                            <div class="mwa-queue-cta">
                                {t('queuePositionInline', { pos: String(queuePosition) })}{' '}
                                <span class="lang-links-sep">·</span>{' '}
                                <form method="post" action="/app/queue/leave">
                                    <button type="submit" class="lang-link">
                                        {t('queueLeave')}
                                    </button>
                                </form>
                            </div>
                        ) : groupName ? (
                            <form method="post" action="/app/queue/join" class="mwa-queue-cta">
                                <button type="submit" class="lang-link">
                                    {t('queueJoin')}
                                </button>
                            </form>
                        ) : (
                            <p class="mwa-muted mwa-queue-cta">
                                {t('queueNeedGroup')} <a href="/app/group">{t('queueGoGroup')}</a>
                            </p>
                        )}
                    </div>

                    <div>
                        <div class="table mwa-tx">
                            <table>
                                <thead>
                                    <tr>
                                        <th colSpan={2}>{t('dashStandings')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {standings.map((s) => [
                                        <tr key={s.board}>
                                            <td>{t(boardLabelKey[s.board])}</td>
                                            <td class="mwa-tx-amount">
                                                <span class="mwa-standing-hint">
                                                    *{t(boardHintKey[s.board])}
                                                </span>
                                            </td>
                                        </tr>,
                                        <tr key={s.board + '-you'} class="mwa-standing-sub">
                                            <td>{t('leaderboardYou')}</td>
                                            <td class="mwa-tx-amount">
                                                {s.you ? `#${s.you.rank}` : '—'}
                                            </td>
                                        </tr>,
                                        <tr key={s.board + '-grp'} class="mwa-standing-sub">
                                            <td>{groupName ?? '—'}</td>
                                            <td class="mwa-tx-amount">
                                                {s.group ? `#${s.group.rank}` : '—'}
                                            </td>
                                        </tr>,
                                    ])}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('dashFinances')}</h2>
                </div>
                <div class="mwa-panel-body">
                    <p class="mwa-intro">
                        {t('dashBalance')}:{' '}
                        <strong>
                            {user!.currentBalance.toFixed(2)} {t('currencyName')}
                        </strong>
                    </p>

                    {transactions.length === 0 ? (
                        <p class="mwa-muted">{t('dashNoTransactions')}</p>
                    ) : (
                        <div class="table mwa-tx">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('txColDate')}</th>
                                        <th>{t('txColType')}</th>
                                        <th class="mwa-tx-amount">{t('txColAmount')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx, i) => (
                                        <tr
                                            key={i}
                                            class={
                                                tx.balanceDelta >= 0 ? 'mwa-tx--pos' : 'mwa-tx--neg'
                                            }
                                        >
                                            <td class="mwa-tx-date">
                                                {new Date(tx.createdAt).toLocaleString(lang, {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: false,
                                                })}
                                            </td>
                                            <td>{t(transactionKindKey[tx.kind])}</td>
                                            <td class="mwa-tx-amount">
                                                {tx.balanceDelta > 0 ? '+' : ''}
                                                {tx.balanceDelta.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('dashGroup')}</h2>
                </div>
                <div class="mwa-panel-body">
                    {groupError && (
                        <p class="mwa-note mwa-note--error" role="alert">
                            {t(groupError)}
                        </p>
                    )}
                    {groupMembers.length === 0 ? (
                        <p class="mwa-muted">
                            {t('groupNone')} <a href="/app/group">{t('queueGoGroup')}</a>
                        </p>
                    ) : (
                        <div class="table mwa-tx">
                            <table>
                                <thead>
                                    <tr>
                                        <th colSpan={2}>{groupName}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupMembers.map((member) => (
                                        <tr key={member.userId}>
                                            <td>
                                                {displayActor(member.username, user, t)}
                                                {member.userId === groupOwnerId && (
                                                    <span class="mwa-row-tag">
                                                        {t('groupOwner')}
                                                    </span>
                                                )}
                                            </td>
                                            <td class="mwa-tx-amount">
                                                {groupOwnerId === user!.id ? (
                                                    member.userId === user!.id ? (
                                                        <form
                                                            method="post"
                                                            action="/app/group/delete"
                                                            onSubmit={(e) => {
                                                                if (
                                                                    !window.confirm(
                                                                        t('groupDeleteConfirm'),
                                                                    )
                                                                ) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        >
                                                            <button
                                                                type="submit"
                                                                class="lang-link lang-link--danger"
                                                                title={t('groupDeleteHint')}
                                                            >
                                                                {t('groupDelete')}
                                                            </button>
                                                        </form>
                                                    ) : (
                                                        <form
                                                            method="post"
                                                            action="/app/group/kick"
                                                        >
                                                            <input
                                                                type="hidden"
                                                                name="member_id"
                                                                value={member.userId}
                                                            />
                                                            <button
                                                                type="submit"
                                                                class="lang-link lang-link--danger"
                                                                title={t('groupKickHint', {
                                                                    name: displayUsername(
                                                                        member.username,
                                                                    ),
                                                                })}
                                                            >
                                                                {t('groupKick')}
                                                            </button>
                                                        </form>
                                                    )
                                                ) : member.userId === user!.id ? (
                                                    <form method="post" action="/app/group/leave">
                                                        <button
                                                            type="submit"
                                                            class="lang-link"
                                                            title={t('groupLeaveHint')}
                                                        >
                                                            {t('groupLeave')}
                                                        </button>
                                                    </form>
                                                ) : null}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('dashSupport')}</h2>
                </div>
                <div class="mwa-panel-body">
                    <div class="mwa-actions">
                        <button type="button">
                            <PhoneIcon /> {t('dashCall')}
                        </button>
                        <button
                            type="button"
                            aria-expanded={guideOpen}
                            onClick={() => setGuideOpen(!guideOpen)}
                        >
                            <BookIcon /> {t('dashGuide')}
                        </button>
                    </div>
                    {guideOpen && <p class="mwa-muted">{t('dashGuideBody')}</p>}
                </div>
            </section>
        </PageShell>
    );
}
