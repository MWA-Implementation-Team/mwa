import { ComponentProps, ComponentType } from 'preact/compat';
import { homePage } from '#src/client/pages/app/HomePage.js';
import { errorPage } from '#src/client/pages/ErrorPage.js';
import { landingPage } from '#src/client/pages/LandingPage.js';
import { loginPage } from '#src/client/pages/LoginPage.js';
import { activitiesPage } from '#src/client/pages/app/ActivitiesPage.js';
import { activityPage } from '#src/client/pages/app/ActivityPage.js';
import { accountPage } from '#src/client/pages/app/AccountPage.js';
import { leaderboardPage } from '#src/client/pages/app/LeaderboardPage.js';
import { groupPage } from '#src/client/pages/app/GroupPage.js';
import { casinoPage } from '#src/client/pages/app/CasinoPage.js';
import { adminPage } from '#src/client/pages/AdminPage.js';
import { LanguageCode, TranslateFn } from './language.js';

export const registeredPages = {
    // These keys are used in the writePage function
    landing: landingPage,
    login: loginPage,
    home: homePage,
    activities: activitiesPage,
    activity: activityPage,
    account: accountPage,
    leaderboard: leaderboardPage,
    group: groupPage,
    casino: casinoPage,
    admin: adminPage,
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
