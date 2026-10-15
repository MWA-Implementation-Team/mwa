import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';

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
            <>
                <Header />
                <h1>{t('interactSelfJoke')}</h1>
            </>
        );
    }

    return (
        <>
            <Header />

            <h1>{t('interactHeading', { name: target.username })}</h1>

            {/* Stub — real transfers land with the pending/confirm flow. */}
            <section>
                <h2>{t('interactSendMoneyTitle')}</h2>
                <button disabled>{t('interactSendMoneyTitle')}</button>
                <p>{t('interactComingSoon')}</p>
            </section>

            {detail && (
                <section>
                    <h2>{t('interactProfileDetailTitle')}</h2>
                    <dl>
                        <dt>{t('interactDetailEmail')}</dt>
                        <dd>{detail.email}</dd>
                        <dt>{t('interactDetailBalance')}</dt>
                        <dd>{detail.currentBalance}</dd>
                        <dt>{t('interactDetailJoined')}</dt>
                        <dd>{detail.joinedAt.slice(0, 10)}</dd>
                    </dl>
                </section>
            )}
        </>
    );
}
