import { Page } from '#src/client/pages.js';
import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import PageShell from './app/PageShell.js';
import { Toast } from '#src/client/ui/Toast.js';

export type LoginErrorKey =
    | 'loginInvalidEmail'
    | 'loginSendFailed'
    | 'loginRateLimited'
    | 'loginLinkExpired'
    | 'loginWrongCode'
    | 'loginCodeExpired';

type LoginPageProps = {
    errorKey?: LoginErrorKey;
    sentTo?: string;
    challengeId?: string;
    sentKind?: 'login' | 'signup';
    // set by GET /auth/verify — the emailed link lands here and only the
    // posted form spends the one-shot token
    confirmToken?: string;
    goto?: string;
};

export const loginPage: Page<LoginPageProps> = {
    Component: LoginPage,
    title: (t) => t('titleLogin'),
};

function LoginPage({
    errorKey,
    sentTo,
    challengeId,
    sentKind,
    confirmToken,
    goto,
}: LoginPageProps) {
    const { t } = useContext(ClientContext);
    return (
        <PageShell section="login" nav={false}>
            <section class="mwa-panel">
                <div class="mwa-panel-body">
                    {confirmToken ? (
                        <>
                            <p class="mwa-muted">{t('loginConfirmPrompt')}</p>
                            <form method="POST" action="/auth/verify" class="mwa-form">
                                <input type="hidden" name="token" value={confirmToken} />
                                {goto && <input type="hidden" name="goto" value={goto} />}
                                <button type="submit">{t('loginConfirmSubmit')}</button>
                            </form>
                        </>
                    ) : sentTo && challengeId ? (
                        <>
                            <p class="mwa-muted">
                                {sentKind === 'signup'
                                    ? t('loginSentSignup', { email: sentTo })
                                    : t('loginSentLogin', { email: sentTo })}
                            </p>
                            <form method="POST" action="/auth/verify" class="mwa-form">
                                <input type="hidden" name="challenge_id" value={challengeId} />
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

                    {errorKey && <Toast kind="error">{t(errorKey)}</Toast>}
                </div>
            </section>
        </PageShell>
    );
}
