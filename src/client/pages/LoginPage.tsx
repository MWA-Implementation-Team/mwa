import Header from '#src/client/ui/Header.js';
import Footer from '#src/client/ui/Footer.js';
import { Page } from '#src/client/pages.js';
import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';

type LoginPageProps = {
    errorMessage?: string;
};

export const loginPage: Page<LoginPageProps> = {
    Component: LoginPage,
    title: (t) => t('titleLogin'),
};

function LoginPage({ errorMessage }: LoginPageProps) {
    const { t } = useContext(ClientContext);

    return (
        <>
            <Header />

            <main class="page page-narrow">
                <section class="card">
                    <h1 class="section-title">{t('loginTitle')}</h1>

                    <form method="POST">
                        <label for="username">{t('loginUsername')}</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder={t('loginUsername')}
                            required
                        />

                        <button type="submit" class="btn btn-primary btn-block">
                            {t('loginSubmit')}
                        </button>

                        {errorMessage && <p class="error-message">{errorMessage}</p>}
                    </form>
                </section>
            </main>

            <Footer />
        </>
    );
}
