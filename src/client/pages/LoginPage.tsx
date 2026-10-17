import Header from '#src/client/ui/Header.js';
import Footer from '#src/client/ui/Footer.js';
import { Page } from '#src/client/pages.js';
import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';

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

            <main class="page page-narrow">
                <section class="card">
                    <h1 class="section-title">{t('loginTitle')}</h1>

                    {sentTo ? (
                        <>
                            <p class="muted">
                                {sentKind === 'signup'
                                    ? t('loginSentSignup', { email: sentTo })
                                    : t('loginSentLogin', { email: sentTo })}
                            </p>
                            <form method="POST" action="/auth/verify" class="form-stack">
                                <input type="hidden" name="email" value={sentTo} />
                                {goto && <input type="hidden" name="goto" value={goto} />}
                                <label for="code">{t('loginCode')}</label>
                                <input
                                    type="text"
                                    id="code"
                                    name="code"
                                    placeholder={t('loginCode')}
                                    autoComplete="one-time-code"
                                    required
                                />
                                <button type="submit" class="btn btn-primary btn-block">
                                    {t('loginVerify')}
                                </button>
                            </form>
                        </>
                    ) : (
                        <form method="POST" class="form-stack">
                            <label for="email">{t('loginEmail')}</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder={t('loginEmail')}
                                required
                            />
                            <button type="submit" class="btn btn-primary btn-block">
                                {t('loginSendLink')}
                            </button>
                        </form>
                    )}

                    {errorKey && <p class="error-message">{t(errorKey)}</p>}
                </section>
            </main>

            <Footer />
        </>
    );
}
