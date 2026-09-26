import { Page } from '#src/client/pages.js';

type CasinoPageProps = {};

export const casinoPage: Page<CasinoPageProps> = {
    Component: CasinoPage,
    title: (t) => t('titleCasino'),
};

function CasinoPage({}: CasinoPageProps) {
    return (
        <>
            <h1>TODO</h1>
        </>
    );
}
