import Header from '#src/client/ui/Header.js';
import Footer from '#src/client/ui/Footer.js';
import { Page } from '#src/client/pages.js';
import { useContext, useState } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import { Transaction } from '#src/client/api/transactions.js';
import { joinQueue, leaveQueue } from '#src/client/api/queue.js';
import { BookIcon, PhoneIcon } from '#src/client/ui/icons.js';

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
        <>
            <Header />

            <main class="page page-narrow">
                <h1 class="page-title">{t('homeWelcome', { name: user!.username })}</h1>

                <section class="card">
                    <h2 class="section-title">{t('dashFinances')}</h2>

                    <div class="balance">
                        <div class="balance-label">{t('dashBalance')}</div>
                        <div class="balance-value">
                            {user!.currentBalance.toFixed(2)} {t('currencyName')}
                        </div>
                    </div>

                    <div class="transaction-title">{t('dashTransactions')}</div>

                    <div class="transactions">
                        {transactions.length === 0 && (
                            <p class="muted">{t('dashNoTransactions')}</p>
                        )}
                        {transactions.map((tx, i) => (
                            <div key={i} class="transaction">
                                <div class="transaction-icon">
                                    {tx.balanceDelta > 0 ? '↑' : '↓'}
                                </div>
                                <div class="transaction-info">
                                    <div class="transaction-name">
                                        {t(transactionKindKey[tx.kind])}
                                    </div>
                                    <div class="transaction-date">
                                        {new Date(tx.createdAt).toLocaleDateString(lang)}
                                    </div>
                                </div>
                                <div
                                    class={`transaction-value ${tx.balanceDelta > 0 ? 'positive' : 'negative'}`}
                                >
                                    {tx.balanceDelta > 0 ? '+' : ''}
                                    {tx.balanceDelta.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section class="card">
                    <h2 class="section-title">{t('queueTitle')}</h2>

                    {queueError && <p class="queue-error">{queueError}</p>}

                    {queuePosition !== null ? (
                        <>
                            <div class="queue-position">
                                <div class="queue-position-label">{t('queuePositionLabel')}</div>
                                <div class="queue-position-value">#{queuePosition}</div>
                            </div>
                            <button class="btn btn-outline btn-block" onClick={handleLeaveQueue}>
                                {t('queueLeave')}
                            </button>
                        </>
                    ) : groupName ? (
                        <button class="btn btn-primary btn-block" onClick={handleJoinQueue}>
                            {t('queueJoinAs', { group: groupName })}
                        </button>
                    ) : (
                        <p class="muted queue-empty">
                            {t('queueNeedGroup')} <a href="/app/group">{t('queueGoGroup')}</a>
                        </p>
                    )}
                </section>

                <section class="card">
                    <h2 class="section-title">{t('dashQrTitle')}</h2>
                    <div class="qr-description">
                        <strong>{t('dashQrHint')}</strong>
                        <br />
                        {t('dashQrBody')}
                    </div>
                    <div class="qr-code" dangerouslySetInnerHTML={{ __html: qrSvg }} />
                    <a class="muted" href={interactUrl}>
                        {interactUrl}
                    </a>
                </section>

                <section class="card">
                    <h2 class="section-title">{t('dashSupport')}</h2>

                    <div class="support-options">
                        <button class="support-button">
                            <div class="support-icon">
                                <PhoneIcon />
                            </div>
                            <div class="support-label">{t('dashCall')}</div>
                        </button>
                        <button
                            class="support-button alt"
                            aria-expanded={guideOpen}
                            onClick={() => setGuideOpen(!guideOpen)}
                        >
                            <div class="support-icon">
                                <BookIcon />
                            </div>
                            <div class="support-label">{t('dashGuide')}</div>
                        </button>
                    </div>

                    {guideOpen && <div class="guide-box">{t('dashGuideBody')}</div>}
                </section>

                <section class="card">
                    <h2 class="section-title">{t('sponsorsTitle')}</h2>
                    <p class="muted sponsor-subtitle">{t('sponsorsSubtitle')}</p>
                    <div class="sponsor-grid">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} class="sponsor">
                                LOGO
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
