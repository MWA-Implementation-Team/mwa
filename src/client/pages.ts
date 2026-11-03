import { ComponentProps, ComponentType } from 'preact/compat';
import { homePage } from '#src/client/pages/app/HomePage.js';
import { errorPage } from '#src/client/pages/ErrorPage.js';
import { landingPage } from '#src/client/pages/LandingPage.js';
import { loginPage } from '#src/client/pages/LoginPage.js';
import { activityPage } from '#src/client/pages/ActivityPage.js';
import { leaderboardPage } from '#src/client/pages/app/LeaderboardPage.js';
import { gamblingPage } from '#src/client/pages/app/gambling/GamblingHomePage.js';
import { interactPage } from '#src/client/pages/app/InteractPage.js';
import { hostPage } from '#src/client/pages/app/HostPage.js';
import { adminPage } from '#src/client/pages/AdminPage.js';
import { gamblingSessionPage } from '#src/client/pages/app/gambling/GamblingSessionPage.js';

export const registeredPages = {
    // These keys are used in the writePage function
    landing: landingPage,
    login: loginPage,
    home: homePage,
    activity: activityPage,
    leaderboard: leaderboardPage,
    gambling: gamblingPage,
    gamblingSession: gamblingSessionPage,
    interact: interactPage,
    host: hostPage,
    admin: adminPage,
    error: errorPage,
} satisfies Record<string, Page<any>>;

// Every page shares the same <title> (titleApp) — writePage renders it
// server-side and ClientContextWrapper re-applies it on language switches.
export type Page<P> = {
    Component: ComponentType<P>;
};

export type RegisteredPageId = keyof typeof registeredPages;

export type RegisteredPageProps<P extends RegisteredPageId> = ComponentProps<
    (typeof registeredPages)[P]['Component']
>;
