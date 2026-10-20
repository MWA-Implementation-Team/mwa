import { Page } from '#src/client/pages.js';

type GamblingPageProps = {};

export const gamblingPage: Page<GamblingPageProps> = {
    Component: GamblingPage,
    title: (t) => t('titleGambling'),
};

function GamblingPage({}: GamblingPageProps) {
    return (
        <>
            <h1>TODO</h1>
        </>
    );
}
