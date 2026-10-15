import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';
import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';

type HomePageProps = {
    qrSvg: string;
    interactUrl: string;
};

export const homePage: Page<HomePageProps> = {
    Component: HomePage,
    title: (t) => t('titleHome'),
};

function HomePage({ qrSvg, interactUrl }: HomePageProps) {
    const { t, user } = useContext(ClientContext);

    return (
        <>
            <Header />

            <h1>{t('homeWelcome', { name: user!.username })}</h1>
            <form method="POST">
                <button type="submit">Logout</button>
            </form>

            <a href="/app/casino">
                <button>GO GAMBLING</button>
            </a>

            <section>
                <h2>{t('homeQrTitle')}</h2>
                <div class="qr-code" dangerouslySetInnerHTML={{ __html: qrSvg }} />
                <a href={interactUrl}>{interactUrl}</a>
            </section>
        </>
    );
}
