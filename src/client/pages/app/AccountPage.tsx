
import { useState } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import PageShell from './PageShell.js';

type AccountPageProps = {};

export const accountPage: Page<AccountPageProps> = {
    Component: AccountPage,
    title: (t) => t('titleAccount'),
};

function AccountPage({}: AccountPageProps) {
    const [guideOpen, setGuideOpen] = useState(false);

    return (
        <PageShell section="account" title="account" subtitle="your corner of the event ✧">
            <div class="mwa-account-layout">

                <section class="mwa-wiki-panel">
                    <div class="mwa-wiki-panel-head">
                        <h2>☆ your finances</h2>
                    </div>

                    <div class="mwa-wiki-panel-body">
                        <div class="account-balance">
                            <p>current balance</p>
                            <h2>150.00 micius koinai</h2>
                        </div>

                        <h3>transaction history</h3>

                        <div class="account-transactions">
                            {[
                                ['↑', 'event ticket purchase', '+$150.00'],
                                ['↓', 'account top-up', '+$30.00'],
                                ['↓', 'account top-up', '-$20.00'],
                                ['↓', 'account top-up', '-$10.00'],
                                ['↑', 'event ticket purchase', '+$10.00'],
                            ].map(([icon, name, amount], index) => (
                                <div class="account-transaction" key={index}>
                                    <div class="account-transaction-icon">{icon}</div>
                                    <div class="account-transaction-info">
                                        <strong>{name}</strong>
                                        <small>july 2021</small>
                                    </div>
                                    <strong>{amount}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section class="mwa-wiki-panel">
                    <div class="mwa-wiki-panel-head">
                        <h2>☆ account qr code</h2>
                    </div>

                    <div class="mwa-wiki-panel-body account-center">
                        <p>
                            <strong>use for admin access</strong>
                        </p>
                        <p>show this code to an administrator to allow access to your account details.</p>

                        <div class="account-qr">
                            qr code placeholder
                        </div>
                    </div>
                </section>

                <section class="mwa-wiki-panel">
                    <div class="mwa-wiki-panel-head">
                        <h2>☆ support</h2>
                    </div>

                    <div class="mwa-wiki-panel-body">
                        <div class="account-support">
                            <button type="button" disabled>
                                <span>☎</span>
                                call support
                            </button>

                            <button
                                type="button"
                                onClick={() => setGuideOpen(!guideOpen)}
                            >
                                <span>📖</span>
                                guide & explanations
                            </button>
                        </div>

                        {guideOpen && (
                            <div class="account-guide">
                                this section can contain explanations of the dashboard features.
                            </div>
                        )}
                    </div>
                </section>

                <section class="mwa-wiki-panel">
                    <div class="mwa-wiki-panel-head">
                        <h2>☆ sponsors</h2>
                    </div>

                    <div class="mwa-wiki-panel-body account-center">
                        <p>our generous sponsors</p>

                        <div class="account-sponsors">
                            {[1, 2, 3, 4, 5, 6].map((sponsor) => (
                                <div class="account-sponsor" key={sponsor}>
                                    sponsor {sponsor}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section class="mwa-wiki-panel">
                    <div class="mwa-wiki-panel-head">
                        <h2>☆ profile settings</h2>
                    </div>
                    <div class="mwa-wiki-panel-body">
                        <p class="mwa-wiki-muted">
                            TODO: change username, avatar, and other account-related settings.
                        </p>
                    </div>
                </section>

            </div>
        </PageShell>
    );
}
