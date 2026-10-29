import { Page } from '#src/client/pages.js';
import { useContext, useState } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import { Transaction, TransactionKind } from '#src/client/api/transactions.js';
import { BookIcon, PhoneIcon } from '#src/client/ui/icons.js';
import PageShell from './PageShell.js';
import { Language } from '#src/client/language.js';

type HomePageProps = {
    transactions: Transaction[];
    groupName: string | null;
    queuePosition: number | null;
    queueError?: keyof Language;
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

function HomePage({ transactions, groupName, queuePosition, queueError }: HomePageProps) {
    const { t, user, lang } = useContext(ClientContext);
    const [guideOpen, setGuideOpen] = useState(false);

    return (
        <PageShell section="home">
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

                    <h3>{t('dashTransactions')}</h3>
                    {transactions.length === 0 ? (
                        <p class="mwa-muted">{t('dashNoTransactions')}</p>
                    ) : (
                        <ul class="mwa-rows">
                            {transactions.map((tx, i) => (
                                <li key={i} class="mwa-row">
                                    <span>
                                        <strong>{t(transactionKindKey[tx.kind])}</strong>
                                        <small>
                                            {new Date(tx.createdAt).toLocaleDateString(lang)}
                                        </small>
                                    </span>
                                    <strong>
                                        {tx.balanceDelta > 0 ? '+' : ''}
                                        {tx.balanceDelta.toFixed(2)}
                                    </strong>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('queueTitle')}</h2>
                </div>
                <div class="mwa-panel-body">
                    {queueError && (
                        <p class="mwa-note mwa-note--error" role="alert">
                            {t(queueError)}
                        </p>
                    )}

                    {queuePosition !== null ? (
                        <>
                            <p class="mwa-intro">
                                {t('queuePositionLabel')}: <strong>#{queuePosition}</strong>
                            </p>
                            <form method="post" action="/app/queue/leave" class="mwa-actions">
                                <button type="submit">{t('queueLeave')}</button>
                            </form>
                        </>
                    ) : groupName ? (
                        <form method="post" action="/app/queue/join" class="mwa-actions">
                            <button type="submit" class="btn-primary">
                                {t('queueJoinAs', { group: groupName })}
                            </button>
                        </form>
                    ) : (
                        <p class="mwa-muted">
                            {t('queueNeedGroup')} <a href="/app/group">{t('queueGoGroup')}</a>
                        </p>
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
