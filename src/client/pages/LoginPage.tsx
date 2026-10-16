import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';

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

            {sentTo ? (
                <>
                    <p>
                        {sentKind === 'signup'
                            ? t('signupSent', { email: sentTo })
                            : t('loginSent', { email: sentTo })}
                    </p>
                    <form method="POST" action="/auth/verify">
                        <input type="hidden" name="email" value={sentTo} />
                        {goto && <input type="hidden" name="goto" value={goto} />}
                        <input
                            type="text"
                            name="code"
                            placeholder={t('loginCodePlaceholder')}
                            autoComplete="one-time-code"
                            required
                        />
                        <button type="submit">{t('loginVerifyCode')}</button>
                    </form>
                </>
            ) : (
                <form method="POST">
                    <h1>{t('loginHeading')}</h1>
                    <input type="email" name="email" placeholder={t('loginEmail')} required />
                    <button type="submit">{t('loginSendLink')}</button>
                </form>
            )}

            {errorKey && <p class="error-message">{t(errorKey)}</p>}
        </>
    );
}
