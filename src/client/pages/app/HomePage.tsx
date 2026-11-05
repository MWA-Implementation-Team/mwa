import { MAX_GROUP_NAME_LENGTH, MAX_USERNAME_LENGTH } from '#src/client/constants.js';
import { Page } from '#src/client/pages.js';
import { useContext, useState } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import { Transaction, TransactionKind } from '#src/client/api/transactions.js';
import PageShell from './PageShell.js';
import Dialog from '#src/client/ui/Dialog.js';
import { Language } from '#src/client/language.js';
import type { ViewerStanding } from '#src/db/leaderboard/index.js';
import { displayActor, displayUsername } from '#src/client/display.js';
import { Toast } from '#src/client/ui/Toast.js';

type HomePageProps = {
    transactions: Transaction[];
    groupName: string | null;
    groupPhone: string | null;
    groupMemberCount: number | null;
    groupOwnerId: number | null;
    groupMembers: { userId: number; username: string }[];
    groupError?: keyof Language;
    groupNotice?: keyof Language;
    youError?: keyof Language;
    youNotice?: keyof Language;
    queuePosition: number | null;
    queueCanJoin: boolean;
    // per-station ✓/— for the viewer's group; null when groupless
    stationProgress: { slug: string; name: string; done: boolean }[] | null;
    queueError?: keyof Language;
    qrClaimedAmount?: number | null;
    qrError?: 'not_found' | 'expired' | 'used_up' | 'already_claimed';
    codeError?: keyof Language;
    standings: ViewerStanding[];
};

export const homePage: Page<HomePageProps> = {
    Component: HomePage,
};

const transactionKindKey = {
    transfer: 'txTransfer',
    purchase: 'txPurchase',
    system: 'txSystem',
    gambling_deduction: 'txGamblingDeduction',
    gambling_winnings: 'txGamblingWinnings',
    host_grant: 'txHostGrant',
} as const satisfies Record<TransactionKind, keyof Language>;

import { boardHintKey, boardLabelKey } from '#src/client/boards.js';

const qrErrorKey = {
    not_found: 'qrErrorNotFound',
    expired: 'qrErrorExpired',
    used_up: 'qrErrorUsedUp',
    already_claimed: 'qrErrorAlreadyClaimed',
} as const satisfies Record<NonNullable<HomePageProps['qrError']>, keyof Language>;

function HomePage({
    transactions,
    groupName,
    groupPhone,
    groupMemberCount,
    groupOwnerId,
    groupMembers,
    groupError,
    groupNotice,
    youError,
    youNotice,
    queuePosition,
    queueCanJoin,
    stationProgress,
    queueError,
    qrClaimedAmount,
    qrError,
    codeError,
    standings,
}: HomePageProps) {
    const { t, user, lang } = useContext(ClientContext);
    const [usernameDialogOpen, setUsernameDialogOpen] = useState(youError !== undefined);
    const [groupNameEditOpen, setGroupNameEditOpen] = useState(false);
    const [groupPhoneEditOpen, setGroupPhoneEditOpen] = useState(false);

    return (
        <PageShell section="home">
            {qrClaimedAmount !== null && qrClaimedAmount !== undefined && (
                <Toast kind="success">{t('qrClaimed', { amount: String(qrClaimedAmount) })}</Toast>
            )}
            {qrError && <Toast kind="error">{t(qrErrorKey[qrError])}</Toast>}
            {codeError && <Toast kind="error">{t(codeError)}</Toast>}
            <section class="mwa-panel" id="panel-game">
                <div class="mwa-panel-head">
                    <h2>{t('dashGame')}</h2>
                </div>
                <div class="mwa-panel-body mwa-queue-grid">
                    <div>
                        <p class="mwa-queue-name">{displayUsername(user!.username)}</p>
                        {queueError && <Toast kind="error">{t(queueError)}</Toast>}

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
                            !queueCanJoin ? (
                                <p class="mwa-muted mwa-queue-cta">{t('queueTooSmall')}</p>
                            ) : (
                                <form method="post" action="/app/queue/join" class="mwa-queue-cta">
                                    <button type="submit" class="lang-link">
                                        {t('queueJoin')}
                                    </button>
                                </form>
                            )
                        ) : (
                            <p class="mwa-muted mwa-queue-cta">{t('queueNeedGroup')}</p>
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

                        {stationProgress && (
                            <div class="table mwa-tx">
                                <table>
                                    <thead>
                                        <tr>
                                            <th colSpan={2}>{t('homeStationProgress')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stationProgress.map((s) => (
                                            <tr key={s.slug}>
                                                <td>{s.name}</td>
                                                <td class="mwa-tx-amount">{s.done ? '✓' : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
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
                            {user!.currentBalance} {t('currencyName')}
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
                                            <td>
                                                {t(transactionKindKey[tx.kind])}
                                                {tx.note && <div class="mwa-muted">{tx.note}</div>}
                                            </td>
                                            <td class="mwa-tx-amount">
                                                {tx.balanceDelta > 0 ? '+' : ''}
                                                {tx.balanceDelta}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            <section class="mwa-panel" id="panel-group">
                <div class="mwa-panel-head">
                    <h2>{t('dashGroup')}</h2>
                </div>
                <div class="mwa-panel-body">
                    {groupError && <Toast kind="error">{t(groupError)}</Toast>}
                    {groupNotice && <Toast kind="success">{t(groupNotice)}</Toast>}
                    {groupMembers.length === 0 ? (
                        <p class="mwa-muted">{t('groupNone')}</p>
                    ) : (
                        <>
                            <div class="table mwa-tx">
                                <table>
                                    <thead>
                                        <tr>
                                            <th colSpan={3}>{t('groupSettings')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{t('groupName')}</td>
                                            <td>{groupName}</td>
                                            <td class="mwa-tx-amount">
                                                {groupOwnerId === user!.id && (
                                                    <button
                                                        type="button"
                                                        class="lang-link"
                                                        onClick={() => setGroupNameEditOpen(true)}
                                                    >
                                                        {t('groupEdit')}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>{t('groupPhone')}</td>
                                            <td>{groupPhone ?? '—'}</td>
                                            <td class="mwa-tx-amount">
                                                {groupOwnerId === user!.id && (
                                                    <button
                                                        type="button"
                                                        class="lang-link"
                                                        onClick={() => setGroupPhoneEditOpen(true)}
                                                    >
                                                        {t('groupEdit')}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="table mwa-tx">
                                <table>
                                    <thead>
                                        <tr>
                                            <th colSpan={2}>{t('leaderboardColMembers')}</th>
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
                                                                action="/app/group/disband"
                                                                onSubmit={(e) => {
                                                                    if (
                                                                        !window.confirm(
                                                                            t(
                                                                                'groupDisbandConfirm',
                                                                            ),
                                                                        )
                                                                    ) {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                            >
                                                                <button
                                                                    type="submit"
                                                                    class="lang-link lang-link--danger"
                                                                    title={t('groupDisbandHint')}
                                                                >
                                                                    {t('groupDisband')}
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
                                                        <form
                                                            method="post"
                                                            action="/app/group/leave"
                                                        >
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
                        </>
                    )}
                </div>
            </section>

            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('dashYou')}</h2>
                </div>
                <div class="mwa-panel-body">
                    <div class="table mwa-tx">
                        <table>
                            <tbody>
                                <tr>
                                    <td>{t('youUsername')}</td>
                                    <td>{displayUsername(user!.username)}</td>
                                    <td class="mwa-tx-amount">
                                        <button
                                            type="button"
                                            class="lang-link"
                                            onClick={() => setUsernameDialogOpen(true)}
                                        >
                                            {t('youEdit')}
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>{t('youEmail')}</td>
                                    <td colSpan={2}>{user!.email}</td>
                                </tr>
                                <tr>
                                    <td>{t('youRole')}</td>
                                    <td colSpan={2}>
                                        {user!.role.charAt(0).toUpperCase() + user!.role.slice(1)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('dashSupport')}</h2>
                </div>
                <div class="mwa-panel-body">
                    <div class="mwa-actions">
                        <a
                            class="mwa-button"
                            href="https://discord.com/users/228556514879602688"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t('dashDiscord')}
                        </a>
                    </div>
                </div>
            </section>

            <Dialog
                isOpen={usernameDialogOpen}
                onClose={() => setUsernameDialogOpen(false)}
                title={t('youSettingsEdit')}
                class="mwa-dialog--half"
                submit={{ form: 'mwa-you-form', label: t('youSave') }}
            >
                <form id="mwa-you-form" method="POST" action="/app/you/username" class="mwa-form">
                    <div class="mwa-field">
                        <label for="mwa-you-username">{t('youUsername')}</label>
                        <input
                            id="mwa-you-username"
                            name="username"
                            type="text"
                            defaultValue={user!.username}
                            maxLength={MAX_USERNAME_LENGTH}
                            required
                        />
                    </div>
                    {youError && <Toast kind="error">{t(youError)}</Toast>}
                    {youNotice && <Toast kind="success">{t(youNotice)}</Toast>}
                </form>
            </Dialog>

            <Dialog
                isOpen={groupNameEditOpen}
                onClose={() => setGroupNameEditOpen(false)}
                title={t('groupSettingsEdit')}
                class="mwa-dialog--half"
                submit={{ form: 'mwa-group-name-form', label: t('youSave') }}
            >
                <form
                    id="mwa-group-name-form"
                    method="POST"
                    action="/app/group/edit"
                    class="mwa-form"
                >
                    {/* The route rewrites both columns — carry the phone through. */}
                    <input type="hidden" name="phone_number" value={groupPhone ?? ''} />
                    <div class="mwa-field">
                        <label for="mwa-group-edit-name">{t('groupName')}</label>
                        <input
                            id="mwa-group-edit-name"
                            name="name"
                            type="text"
                            defaultValue={groupName ?? ''}
                            maxLength={MAX_GROUP_NAME_LENGTH}
                            required
                        />
                    </div>
                </form>
            </Dialog>

            <Dialog
                isOpen={groupPhoneEditOpen}
                onClose={() => setGroupPhoneEditOpen(false)}
                title={t('groupSettingsEdit')}
                class="mwa-dialog--half"
                submit={{ form: 'mwa-group-phone-form', label: t('youSave') }}
            >
                <form
                    id="mwa-group-phone-form"
                    method="POST"
                    action="/app/group/edit"
                    class="mwa-form"
                >
                    {/* The route rewrites both columns — carry the name through. */}
                    <input type="hidden" name="name" value={groupName ?? ''} />
                    <div class="mwa-field">
                        <label for="mwa-group-edit-phone">{t('groupPhone')}</label>
                        <input
                            id="mwa-group-edit-phone"
                            name="phone_number"
                            type="tel"
                            defaultValue={groupPhone ?? ''}
                        />
                    </div>
                </form>
            </Dialog>
        </PageShell>
    );
}
