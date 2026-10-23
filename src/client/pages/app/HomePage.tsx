import { Page } from '#src/client/pages.js';
import { useContext, useState } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import { Transaction } from '#src/client/api/transactions.js';
import { joinQueue, leaveQueue } from '#src/client/api/queue.js';
import { BookIcon, PhoneIcon } from '#src/client/ui/icons.js';
import PageShell from './PageShell.js';

type HomePageProps = {
    qrSvg: string;
    interactUrl: string;
    transactions: Transaction[];
    groupName: string | null;
    queuePosition: number | null;
};

export const homePage: Page<HomePageProps> = {
    Component: HomePage,
    title: (t) => t('titleHome'),
};

const transactionKindKey = {
    transfer: 'txTransfer',
    purchase: 'txPurchase',
    system: 'txSystem',
} as const;

function HomePage({
    qrSvg,
    interactUrl,
    transactions,
    groupName,
    queuePosition: initialQueuePosition,
}: HomePageProps) {
    const { t, user, lang } = useContext(ClientContext);
    const [guideOpen, setGuideOpen] = useState(false);
    const [queuePosition, setQueuePosition] = useState(initialQueuePosition);
    const [queueError, setQueueError] = useState<string | null>(null);

    const handleJoinQueue = async () => {
        setQueueError(null);
        try {
            const { position } = await joinQueue();
            setQueuePosition(position);
        } catch {
            setQueueError(t('queueJoinFailed'));
        }
    };

    const handleLeaveQueue = async () => {
        setQueueError(null);
        try {
            await leaveQueue();
            setQueuePosition(null);
        } catch {
            setQueueError(t('queueLeaveFailed'));
        }
    };

    return (
        <PageShell
            section="home"
            title={t('homeWelcome', { name: user!.username })}
            subtitle={t('homeSubtitle')}
        >
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('dashFinances')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-intro">
                        {t('dashBalance')}:{' '}
                        <strong>
                            {user!.currentBalance.toFixed(2)} {t('currencyName')}
                        </strong>
                    </p>

                    <h3>{t('dashTransactions')}</h3>
                    {transactions.length === 0 ? (
                        <p class="mwa-wiki-muted">{t('dashNoTransactions')}</p>
                    ) : (
                        <ul class="mwa-wiki-rows">
                            {transactions.map((tx, i) => (
                                <li key={i} class="mwa-wiki-row">
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

            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('queueTitle')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    {queueError && (
                        <p class="mwa-wiki-note mwa-wiki-note--error" role="alert">
                            {queueError}
                        </p>
                    )}

                    {queuePosition !== null ? (
                        <>
                            <p class="mwa-wiki-intro">
                                {t('queuePositionLabel')}: <strong>#{queuePosition}</strong>
                            </p>
                            <div class="mwa-wiki-actions">
                                <button type="button" onClick={handleLeaveQueue}>
                                    {t('queueLeave')}
                                </button>
                            </div>
                        </>
                    ) : groupName ? (
                        <div class="mwa-wiki-actions">
                            <button type="button" class="btn-primary" onClick={handleJoinQueue}>
                                {t('queueJoinAs', { group: groupName })}
                            </button>
                        </div>
                    ) : (
                        <p class="mwa-wiki-muted">
                            {t('queueNeedGroup')} <a href="/app/group">{t('queueGoGroup')}</a>
                        </p>
                    )}
                </div>
            </section>

            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('dashQrTitle')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-muted">
                        <strong>{t('dashQrHint')}</strong>
                        <br />
                        {t('dashQrBody')}
                    </p>
                    <div class="qr-code" dangerouslySetInnerHTML={{ __html: qrSvg }} />
                    <a href={interactUrl}>{interactUrl}</a>
                </div>
            </section>

            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('dashSupport')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <div class="mwa-wiki-actions">
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
                    {guideOpen && <p class="mwa-wiki-muted">{t('dashGuideBody')}</p>}
                </div>
            </section>

            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('sponsorsTitle')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-muted">{t('sponsorsSubtitle')}</p>
                    <div class="mwa-wiki-grid">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} class="mwa-wiki-mini">
                                <span class="mwa-wiki-mini-title">LOGO</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PageShell>
    );
}
