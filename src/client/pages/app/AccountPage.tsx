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
        <PageShell section="account" title={t('headerAccount')} subtitle={t('subAccount')}>
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('accountProfile')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <ul class="mwa-wiki-rows">
                        <li class="mwa-wiki-row">
                            <span>{t('accountUsername')}</span>
                            <strong>{user!.username}</strong>
                        </li>
                        <li class="mwa-wiki-row">
                            <span>{t('accountEmail')}</span>
                            <strong>{user!.email}</strong>
                        </li>
                        <li class="mwa-wiki-row">
                            <span>{t('accountRole')}</span>
                            <strong>{user!.role}</strong>
                        </li>
                        <li class="mwa-wiki-row">
                            <span>{t('accountJoined')}</span>
                            <strong>{user!.createdAt.toLocaleDateString(lang)}</strong>
                        </li>
                    </ul>
                </div>
            </section>

            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('dashFinances')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <ul class="mwa-wiki-rows">
                        <li class="mwa-wiki-row">
                            <span>{t('dashBalance')}</span>
                            <strong>
                                {user!.currentBalance.toFixed(2)} {t('currencyName')}
                            </strong>
                        </li>
                        <li class="mwa-wiki-row">
                            <span>{t('accountLifetimeEarned')}</span>
                            <strong>
                                {user!.lifetimeEarned.toFixed(2)} {t('currencyName')}
                            </strong>
                        </li>
                    </ul>
                    <p class="mwa-wiki-muted">
                        {t('dashTransactions')} — <a href="/app">{t('headerHome')}</a>
                    </p>
                </div>
            </section>

            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('dashQrTitle')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-muted">
                        {t('dashQrBody')} <a href="/app">{t('headerHome')}</a>
                    </p>
                </div>
            </section>

            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>{t('accountSettings')}</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-muted">{t('accountSettingsTodo')}</p>
                    <form method="POST" action="/app">
                        <div class="mwa-wiki-actions">
                            <button type="submit" class="mwa-wiki-danger">
                                {t('logOut')}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </PageShell>
    );
}
