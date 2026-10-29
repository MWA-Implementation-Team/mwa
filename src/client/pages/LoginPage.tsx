import { Page } from '#src/client/pages.js';
import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import PageShell from './app/PageShell.js';

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
        <PageShell section="login" nav={false}>
            <section class="mwa-panel">
                <div class="mwa-panel-body">
                    {sentTo ? (
                        <>
                            <p class="mwa-muted">
                                {sentKind === 'signup'
                                    ? t('loginSentSignup', { email: sentTo })
                                    : t('loginSentLogin', { email: sentTo })}
                            </p>
                            <form method="POST" action="/auth/verify" class="mwa-form">
                                <input type="hidden" name="email" value={sentTo} />
                                {goto && <input type="hidden" name="goto" value={goto} />}
                                <div class="mwa-field">
                                    <label for="code">{t('loginCode')}</label>
                                    <input
                                        type="text"
                                        id="code"
                                        name="code"
                                        placeholder={t('loginCode')}
                                        autoComplete="one-time-code"
                                        required
                                    />
                                </div>
                                <button type="submit">{t('loginVerify')}</button>
                            </form>
                        </>
                    ) : (
                        <form method="POST" class="mwa-form">
                            <div class="mwa-field">
                                <label for="email">{t('loginEmail')}</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder={t('loginEmail')}
                                    required
                                />
                            </div>
                            <button type="submit">{t('loginSendLink')}</button>
                        </form>
                    )}

                    {errorKey && (
                        <p class="mwa-note mwa-note--error" role="alert">
                            {t(errorKey)}
                        </p>
                    )}
                </div>
            </section>
        </PageShell>
    );
}
