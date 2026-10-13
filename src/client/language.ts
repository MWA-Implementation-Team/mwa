export type LanguageCode = 'en' | 'lt';

export const defaultLanguage: LanguageCode = 'en';

export type Language = {
    displayName: string;

    titleLanding: string;
    titleLogin: string;
    titleHome: string;
    titleActivities: string;
    titleActivity: string;
    titleAccount: string;
    titleLeaderboard: string;
    titleGroup: string;
    titleCasino: string;
    titleAdmin: string;
    titleError: string;

    headerLanding: string;
    headerLogin: string;
    headerHome: string;
    headerActivities: string;
    headerLeaderboard: string;
    headerGroup: string;
    headerCasino: string;
    headerAccount: string;
    headerAdmin: string;

    menuTitle: string;
    menuClose: string;
    logOut: string;
    logInSignUp: string;

    loginTitle: string;
    loginUsername: string;
    loginSubmit: string;

    homeWelcome: string;

    landingHeroTitle: string;
    landingHeroBody: string;
    landingRegister: string;
    landingSocialTitle: string;
    landingNews1Title: string;
    landingNews1Body: string;
    landingNews2Title: string;
    landingNews2Body: string;
    landingMapTitle: string;
    mapPlaceholder: string;
    landingFeedTitle: string;
    landingFeedActive: string;
    activitySlot: string;
    activityDesc: string;
    statusOpen: string;
    statusBusy: string;
    getInLine: string;
    sponsorsTitle: string;
    sponsorsSubtitle: string;

    dashFinances: string;
    dashBalance: string;
    currencyName: string;
    dashTransactions: string;
    dashNoTransactions: string;
    txTransfer: string;
    txPurchase: string;
    txSystem: string;
    dashQrTitle: string;
    dashQrHint: string;
    dashQrBody: string;
    qrPlaceholder: string;
    dashSupport: string;
    dashCall: string;
    dashGuide: string;
    dashGuideBody: string;
};

export const languages: Record<LanguageCode, Language> = {
    en: {
        displayName: 'English',

        titleLanding: 'MWA | Home',
        titleLogin: 'MWA | Login',
        titleHome: 'MWA | App',
        titleActivities: 'MWA | Activities',
        titleActivity: 'MWA | {name}',
        titleAccount: 'MWA | Account',
        titleLeaderboard: 'MWA | Leaderboard',
        titleGroup: 'MWA | Group',
        titleCasino: 'MWA | Casino',
        titleAdmin: 'MWA | Admin',
        titleError: 'MWA | {status}',

        headerLanding: 'Home',
        headerLogin: 'Login',
        headerHome: 'App',
        headerActivities: 'Activities',
        headerLeaderboard: 'Leaderboard',
        headerGroup: 'Group',
        headerCasino: 'Casino',
        headerAccount: 'Account',
        headerAdmin: 'Admin',

        menuTitle: 'Menu',
        menuClose: 'Close menu',
        logOut: 'Log out',
        logInSignUp: 'Log in / sign up',

        loginTitle: 'Log in',
        loginUsername: 'Username',
        loginSubmit: 'Log in',

        homeWelcome: 'Welcome back, {name}',

        landingHeroTitle: 'MWA event registration',
        landingHeroBody:
            'Sign up for the event, explore the activities and get in line for your favorites.',
        landingRegister: 'Register now',
        landingSocialTitle: 'Social links & news',
        landingNews1Title: 'News headline item 1',
        landingNews1Body: 'Brief summary placeholder for event updates and news feed.',
        landingNews2Title: 'News headline item 2',
        landingNews2Body: 'Another short placeholder for upcoming event news.',
        landingMapTitle: 'Event map',
        mapPlaceholder: 'Map placeholder',
        landingFeedTitle: 'Activities feed',
        landingFeedActive: 'Active items',
        activitySlot: 'Activity slot {n}',
        activityDesc: 'Short description of this activity, attraction or schedule item.',
        statusOpen: 'Open',
        statusBusy: 'Busy',
        getInLine: 'Get in line',
        sponsorsTitle: 'Sponsors',
        sponsorsSubtitle: 'Our generous sponsors',

        dashFinances: 'Your finances',
        dashBalance: 'Current balance',
        currencyName: 'micius koinai',
        dashTransactions: 'Transaction history',
        dashNoTransactions: 'No transactions yet',
        txTransfer: 'Transfer',
        txPurchase: 'Purchase',
        txSystem: 'System credit',
        dashQrTitle: 'Account QR code',
        dashQrHint: 'Use for admin access',
        dashQrBody: 'Show this code to an administrator to allow access to your account details.',
        qrPlaceholder: 'QR code placeholder',
        dashSupport: 'Support',
        dashCall: 'Call support',
        dashGuide: 'Guide & explanations',
        dashGuideBody: 'This section can contain explanations of the dashboard features.',
    },
    lt: {
        displayName: 'Lietuvių',

        titleLanding: 'MWA | Pradžia',
        titleLogin: 'MWA | Prisijungimas',
        titleHome: 'MWA | Programa',
        titleActivities: 'MWA | Veiklos',
        titleActivity: 'MWA | {name}',
        titleAccount: 'MWA | Paskyra',
        titleLeaderboard: 'MWA | Lyderių lentelė',
        titleGroup: 'MWA | Grupė',
        titleCasino: 'MWA | Kazino',
        titleAdmin: 'MWA | Administravimas',
        titleError: 'MWA | {status}',

        headerLanding: 'Pradžia',
        headerLogin: 'Prisijungimas',
        headerHome: 'Programa',
        headerActivities: 'Veiklos',
        headerLeaderboard: 'Lyderių lentelė',
        headerGroup: 'Grupė',
        headerCasino: 'Kazino',
        headerAccount: 'Paskyra',
        headerAdmin: 'Administravimas',

        menuTitle: 'Meniu',
        menuClose: 'Uždaryti meniu',
        logOut: 'Atsijungti',
        logInSignUp: 'Prisijungti / registruotis',

        loginTitle: 'Prisijungti',
        loginUsername: 'Vartotojo vardas',
        loginSubmit: 'Prisijungti',

        homeWelcome: 'Sveiki sugrįžę, {name}',

        landingHeroTitle: 'MWA renginio registracija',
        landingHeroBody: 'Užsiregistruok į renginį, apžiūrėk veiklas ir užimk vietą eilėje.',
        landingRegister: 'Registruotis',
        landingSocialTitle: 'Socialiniai tinklai ir naujienos',
        landingNews1Title: 'Naujienų antraštė 1',
        landingNews1Body: 'Trumpas renginio naujienų ir atnaujinimų santraukos pavyzdys.',
        landingNews2Title: 'Naujienų antraštė 2',
        landingNews2Body: 'Dar vienas trumpas artėjančių renginio naujienų pavyzdys.',
        landingMapTitle: 'Renginio žemėlapis',
        mapPlaceholder: 'Žemėlapio vieta',
        landingFeedTitle: 'Veiklų srautas',
        landingFeedActive: 'Aktyvios veiklos',
        activitySlot: 'Veikla nr. {n}',
        activityDesc: 'Trumpas šios veiklos, atrakcijos ar programos punkto aprašymas.',
        statusOpen: 'Atvira',
        statusBusy: 'Užimta',
        getInLine: 'Stoti į eilę',
        sponsorsTitle: 'Rėmėjai',
        sponsorsSubtitle: 'Mūsų dosnūs rėmėjai',

        dashFinances: 'Tavo finansai',
        dashBalance: 'Dabartinis balansas',
        currencyName: 'micius koinai',
        dashTransactions: 'Operacijų istorija',
        dashNoTransactions: 'Operacijų dar nėra',
        txTransfer: 'Pervedimas',
        txPurchase: 'Pirkimas',
        txSystem: 'Sisteminis įskaitymas',
        dashQrTitle: 'Paskyros QR kodas',
        dashQrHint: 'Naudok administratoriaus prieigai',
        dashQrBody:
            'Parodyk šį kodą administratoriui, kad jis galėtų peržiūrėti tavo paskyros duomenis.',
        qrPlaceholder: 'QR kodo vieta',
        dashSupport: 'Pagalba',
        dashCall: 'Skambinti pagalbai',
        dashGuide: 'Vadovas ir paaiškinimai',
        dashGuideBody: 'Šiame skyriuje gali būti pateikiami prietaisų skydelio paaiškinimai.',
    },
};

export type TranslateFn = (key: keyof Language, params?: Record<string, string>) => string;

export function translate(lang: LanguageCode): TranslateFn {
    return (key, params = {}) => {
        let value = languages[lang]?.[key] || languages[defaultLanguage][key];
        for (const key in params) {
            value = value.replaceAll(`{${key}}`, params[key]);
        }
        return value;
    };
}
