import { ComponentProps, ComponentType } from 'preact/compat';
import { homePage } from '#src/client/pages/app/HomePage.js';
import { errorPage } from '#src/client/pages/ErrorPage.js';
import { landingPage } from '#src/client/pages/LandingPage.js';
import { loginPage } from '#src/client/pages/LoginPage.js';
import { casinoPage } from '#src/client/pages/app/CasinoPage.js';
import { LanguageCode, TranslateFn } from './language.js';

export const registeredPages = {
    // These keys are used in the writePage function
    landing: landingPage,
    login: loginPage,
    home: homePage,
    casino: casinoPage,
    error: errorPage,
} satisfies Record<string, Page<any>>;

export type Page<P> = {
    Component: ComponentType<P>;
    title: (t: TranslateFn, props: P, lang: LanguageCode) => string;
};

export type RegisteredPageId = keyof typeof registeredPages;

export type RegisteredPageProps<P extends RegisteredPageId> = ComponentProps<
    (typeof registeredPages)[P]['Component']
>;
