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
    headerAccount: string;
    headerAdmin: string;

    homeWelcome: string;
    loginHeading: string;
    loginEmail: string;
    loginSendLink: string;
    loginSent: string;
    signupSent: string;
    loginCodePlaceholder: string;
    loginVerifyCode: string;
    loginInvalidEmail: string;
    loginSendFailed: string;
    loginLinkExpired: string;
    loginWrongCode: string;
    loginCodeExpired: string;
    badRequest: string;
    emailLoginSubject: string;
    emailLoginHeading: string;
    emailLoginIntro: string;
    emailLoginAction: string;
    emailLoginCode: string;
    emailLoginFallback: string;
    emailLoginExpiry: string;
    logout: string;
    usersLoginRequired: string;
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
        headerAccount: 'Account',
        headerAdmin: 'Admin',

        homeWelcome: 'Welcome back, {name}',
        loginHeading: 'Login with email',
        loginEmail: 'Email',
        loginSendLink: 'Send login link',
        loginSent: 'We sent a login link to {email}.',
        signupSent: 'We sent a signup link to {email} — click it to create your account.',
        loginCodePlaceholder: 'Code from the email',
        loginVerifyCode: 'Verify code',
        loginInvalidEmail: 'Enter a valid email',
        loginSendFailed: 'Could not send the email — try again in a moment',
        loginLinkExpired: 'That login link is expired or already used — request a new one',
        loginWrongCode: 'Wrong code — check the email and try again',
        loginCodeExpired: 'That code is expired or already used — request a new one',
        badRequest: 'Bad Request',
        emailLoginSubject: 'Your MWA sign-in link',
        emailLoginHeading: 'Sign in to MWA',
        emailLoginIntro: 'Click the button below to sign in. The link expires in 15 minutes.',
        emailLoginAction: 'Sign in',
        emailLoginCode: 'Or enter this code on the login page:',
        emailLoginFallback: "If the button doesn't work, paste this link into your browser:",
        emailLoginExpiry: 'The link and code expire in 15 minutes.',
        logout: 'Logout',
        usersLoginRequired: 'Log in to see users.',
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
        headerAccount: 'Paskyra',
        headerAdmin: 'Administravimas',

        homeWelcome: 'Sveiki sugrįžę, {name}',
        loginHeading: 'Prisijungti el. paštu',
        loginEmail: 'El. paštas',
        loginSendLink: 'Siųsti prisijungimo nuorodą',
        loginSent: 'Prisijungimo nuorodą išsiuntėme adresu {email}.',
        signupSent:
            'Registracijos nuorodą išsiuntėme adresu {email} — spustelėkite ją, kad sukurtumėte paskyrą.',
        loginCodePlaceholder: 'Kodas iš el. laiško',
        loginVerifyCode: 'Patvirtinti kodą',
        loginInvalidEmail: 'Įveskite galiojantį el. pašto adresą',
        loginSendFailed: 'Nepavyko išsiųsti el. laiško — netrukus bandykite dar kartą',
        loginLinkExpired:
            'Ši prisijungimo nuoroda nebegalioja arba jau panaudota — paprašykite naujos',
        loginWrongCode: 'Neteisingas kodas — patikrinkite el. laišką ir bandykite dar kartą',
        loginCodeExpired: 'Šis kodas nebegalioja arba jau panaudotas — paprašykite naujo',
        badRequest: 'Netinkama užklausa',
        emailLoginSubject: 'Jūsų MWA prisijungimo nuoroda',
        emailLoginHeading: 'Prisijunkite prie MWA',
        emailLoginIntro:
            'Norėdami prisijungti, spustelėkite žemiau esantį mygtuką. Nuoroda galioja 15 minučių.',
        emailLoginAction: 'Prisijungti',
        emailLoginCode: 'Arba prisijungimo puslapyje įveskite šį kodą:',
        emailLoginFallback: 'Jei mygtukas neveikia, įklijuokite šią nuorodą į naršyklę:',
        emailLoginExpiry: 'Nuoroda ir kodas galioja 15 minučių.',
        logout: 'Atsijungti',
        usersLoginRequired: 'Prisijunkite, kad matytumėte naudotojus.',
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
