import { useState } from 'preact/hooks';
import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';

type HomePageProps = {
    visitCount: number;
};

export const homePage: Page<HomePageProps> = {
    Component: HomePage,
    title: (t) => t('titleHome'),
};

function HomePage({ visitCount }: HomePageProps) {
    const [value, setValue] = useState(0);

    return (
        <>
            <Header />

            <h1>MWA Event: {value}</h1>
            <button onClick={() => setValue(value + 1)}>Increment</button>
            <button onClick={() => setValue(value - 1)}>Decrement</button>

            <h2>Visit count: {visitCount}</h2>
        </>
    );
}
