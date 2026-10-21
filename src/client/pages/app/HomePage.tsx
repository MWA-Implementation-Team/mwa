import Header from '#src/client/ui/Header.js';
import Footer from '#src/client/ui/Footer.js';
import { Page } from '#src/client/pages.js';
import { useContext, useState } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import { Transaction, TransactionKind } from '#src/client/api/transactions.js';
import { BookIcon, PhoneIcon } from '#src/client/ui/icons.js';
import { Language } from '#src/client/language.js';

type HomePageProps = {
    transactions: Transaction[];
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
} as const satisfies Record<TransactionKind, keyof Language>;

function HomePage({ transactions }: HomePageProps) {
    const { t, user, lang } = useContext(ClientContext);
    const [guideOpen, setGuideOpen] = useState(false);

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
                    <h2 class="section-title">{t('dashQrTitle')}</h2>
                    <div class="qr-description">
                        <strong>{t('dashQrHint')}</strong>
                        <br />
                        {t('dashQrBody')}
                    </div>
                    <div class="wireframe-box qr-placeholder">{t('qrPlaceholder')}</div>
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
