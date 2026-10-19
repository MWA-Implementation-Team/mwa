import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import PageShell from './PageShell.js';

export type LoginErrorKey =
    | 'loginInvalidEmail'
    | 'loginSendFailed'
    | 'loginLinkExpired'
    | 'loginWrongCode'
    | 'loginCodeExpired';

type LoginPageProps = {
    errorKey?: LoginErrorKey;
    sentTo?: string;
    sentKind?: 'login' | 'signup';
    goto?: string;
};

export const loginPage: Page<LoginPageProps> = {
    Component: LoginPage,
    title: (t) => t('titleLogin'),
};

function LoginPage({ errorKey, sentTo, sentKind, goto }: LoginPageProps) {
    const { t } = useContext(ClientContext);

    return (
        <>
            <Header />
            <PageShell title={t('loginHeading')} subtitle="Sign in to access your MWA event account." narrow>
                <section class="mwa-panel">
                    <div class="mwa-panel-heading">
                        <h2>{sentTo ? t('loginVerifyCode') : t('loginHeading')}</h2>
                        <span class="mwa-badge">Account access</span>
                    </div>
                    <div class="mwa-panel-body mwa-stack">
                        {sentTo ? (
                            <>
                                <p class="mwa-notice" role="status">
                                    {sentKind === 'signup'
                                        ? t('signupSent', { email: sentTo })
                                        : t('loginSent', { email: sentTo })}
                                </p>
                                <form class="mwa-form" method="POST" action="/auth/verify">
                                    <input type="hidden" name="email" value={sentTo} />
                                    {goto && <input type="hidden" name="goto" value={goto} />}
                                    <div class="mwa-field">
                                        <label for="login-code">{t('loginCodePlaceholder')}</label>
                                        <input id="login-code" type="text" name="code" placeholder={t('loginCodePlaceholder')} autoComplete="one-time-code" required />
                                    </div>
                                    <button type="submit" class="btn-primary">{t('loginVerifyCode')}</button>
                                </form>
                            </>
                        ) : (
                            <form class="mwa-form" method="POST">
                                <div class="mwa-field">
                                    <label for="login-email">{t('loginEmail')}</label>
                                    <input id="login-email" type="email" name="email" placeholder={t('loginEmail')} autoComplete="email" required />
                                </div>
                                <button type="submit" class="btn-primary">{t('loginSendLink')}</button>
                            </form>
                        )}
                        {errorKey && <p class="mwa-notice mwa-notice--error error-message" role="alert">{t(errorKey)}</p>}
                    </div>
                </section>
            </PageShell>
        </>
    );
}
