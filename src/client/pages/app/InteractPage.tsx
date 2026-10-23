import { Page } from '#src/client/pages.js';
import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import PageShell from './PageShell.js';

// Extra target fields shown only to elevated roles — the route populates
// this solely for host/admin scanners, so `detail` being non-null is the gate.
export type InteractProfileDetail = {
    email: string;
    currentBalance: number;
    joinedAt: string; // ISO timestamp
};

type InteractPageProps = {
    self: boolean;
    target: { username: string };
    detail: InteractProfileDetail | null;
};

export const interactPage: Page<InteractPageProps> = {
    Component: InteractPage,
    title: (t) => t('titleInteract'),
};

function InteractPage({ self, target, detail }: InteractPageProps) {
    const { t } = useContext(ClientContext);

    if (self) {
        return (
            <PageShell section="interact" title={t('titleInteract')}>
                <section class="mwa-wiki-panel">
                    <div class="mwa-wiki-panel-body">
                        <p class="mwa-wiki-muted">{t('interactSelfJoke')}</p>
                    </div>
                </section>
            </PageShell>
        );
    }

    return (
        <PageShell section="interact" title={t('interactHeading', { name: target.username })}>
            {/* Stub — real transfers land with the pending/confirm flow. */}
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('interactSendMoneyTitle')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <div class="mwa-wiki-actions">
                        <button disabled>{t('interactSendMoneyTitle')}</button>
                    </div>
                    <p class="mwa-wiki-muted">{t('interactComingSoon')}</p>
                </div>
            </section>

            {detail && (
                <section class="mwa-wiki-panel">
                    <div class="mwa-wiki-panel-head">
                        <h2>{t('interactProfileDetailTitle')}</h2>
                    </div>
                    <div class="mwa-wiki-panel-body">
                        <ul class="mwa-wiki-rows">
                            <li class="mwa-wiki-row">
                                <span>{t('interactDetailEmail')}</span>
                                <strong>{detail.email}</strong>
                            </li>
                            <li class="mwa-wiki-row">
                                <span>{t('interactDetailBalance')}</span>
                                <strong>{detail.currentBalance}</strong>
                            </li>
                            <li class="mwa-wiki-row">
                                <span>{t('interactDetailJoined')}</span>
                                <strong>{detail.joinedAt.slice(0, 10)}</strong>
                            </li>
                        </ul>
                    </div>
                </section>
            )}
        </PageShell>
    );
}
