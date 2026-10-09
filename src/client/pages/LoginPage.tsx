import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';

type LoginPageProps = {
    errorMessage?: string;
    sentTo?: string;
    sentKind?: 'login' | 'signup';
};

export const loginPage: Page<LoginPageProps> = {
    Component: LoginPage,
    title: (t) => t('titleLogin'),
};

function LoginPage({ errorMessage, sentTo, sentKind }: LoginPageProps) {
    return (
        <>
            <Header />

            {sentTo ? (
                <>
                    <p>
                        {sentKind === 'signup'
                            ? `We sent a signup link to ${sentTo} — click it to create your account.`
                            : `We sent a login link to ${sentTo}.`}
                    </p>
                    <form method="POST" action="/auth/verify">
                        <input type="hidden" name="email" value={sentTo} />
                        <input
                            type="text"
                            name="code"
                            placeholder="Code from the email"
                            autoComplete="one-time-code"
                            required
                        />
                        <button type="submit">Verify code</button>
                    </form>
                </>
            ) : (
                <form method="POST">
                    <h1>Login with email</h1>
                    <input type="email" name="email" placeholder="Email" required />
                    <button type="submit">Send login link</button>
                </form>
            )}

            {errorMessage && <p class="error-message">{errorMessage}</p>}
        </>
    );
}
