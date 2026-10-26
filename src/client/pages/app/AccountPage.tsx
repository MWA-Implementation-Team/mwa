import { useContext } from 'preact/hooks';
import { Page } from '#src/client/pages.js';
import { ClientContext } from '#src/client/context.js';
import PageShell from './PageShell.js';

type AccountPageProps = {};

export const accountPage: Page<AccountPageProps> = {
    Component: AccountPage,
    title: (t) => t('titleAccount'),
};

function AccountPage({}: AccountPageProps) {
    const { t, user, lang } = useContext(ClientContext);

    return (
        <PageShell section="account">
            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('accountProfile')}</h2>
                </div>
                <div class="mwa-panel-body">
                    <ul class="mwa-rows">
                        <li class="mwa-row">
                            <span>{t('accountUsername')}</span>
                            <span>
                                <strong>{user!.username}</strong>{' '}
                                <button type="button">{t('accountEdit')}</button>
                            </span>
                        </li>
                        <li class="mwa-row">
                            <span>{t('accountEmail')}</span>
                            <strong>{user!.email}</strong>
                        </li>
                        <li class="mwa-row">
                            <span>{t('accountRole')}</span>
                            <strong>{user!.role}</strong>
                        </li>
                        <li class="mwa-row">
                            <span>{t('accountJoined')}</span>
                            <strong>{user!.createdAt.toLocaleDateString(lang)}</strong>
                        </li>
                    </ul>
                </div>
            </section>

            <section class="mwa-panel">
                <div class="mwa-panel-head">
                    <h2>{t('dashFinances')}</h2>
                </div>
                <div class="mwa-panel-body">
                    <ul class="mwa-rows">
                        <li class="mwa-row">
                            <span>{t('dashBalance')}</span>
                            <strong>
                                {user!.currentBalance.toFixed(2)} {t('currencyName')}
                            </strong>
                        </li>
                        <li class="mwa-row">
                            <span>{t('accountLifetimeEarned')}</span>
                            <strong>
                                {user!.lifetimeEarned.toFixed(2)} {t('currencyName')}
                            </strong>
                        </li>
                    </ul>
                </div>
            </section>
        </PageShell>
    );
}
