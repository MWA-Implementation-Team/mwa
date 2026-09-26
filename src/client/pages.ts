import { ComponentProps, ComponentType } from 'preact/compat';
import { appHomePage } from '#src/client/pages/app/AppHomePage.js';
import { errorPage } from '#src/client/pages/ErrorPage.js';
import { homePage } from '#src/client/pages/HomePage.js';
import { loginPage } from '#src/client/pages/LoginPage.js';
import { casinoPage } from '#src/client/pages/app/CasinoPage.js';
import { LanguageCode, TranslateFn } from './language.js';

export const registeredPages = {
    // These keys are used in the writePage function
    home: homePage,
    login: loginPage,
    appHome: appHomePage,
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
