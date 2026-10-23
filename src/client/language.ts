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
    titleInteract: string;
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
    loginEmail: string;
    loginSendLink: string;
    loginSentLogin: string;
    loginSentSignup: string;
    loginCode: string;
    loginVerify: string;

    homeWelcome: string;

    interactHeading: string;
    interactSelfJoke: string;
    interactSendMoneyTitle: string;
    interactComingSoon: string;
    interactProfileDetailTitle: string;
    interactDetailEmail: string;
    interactDetailBalance: string;
    interactDetailJoined: string;

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

    queueTitle: string;
    queuePositionLabel: string;
    queueJoinAs: string;
    queueLeave: string;
    queueNeedGroup: string;
    queueGoGroup: string;
    queueJoinFailed: string;
    queueLeaveFailed: string;

    dashSupport: string;
    dashCall: string;
    dashGuide: string;
    dashGuideBody: string;

    groupManagement: string;
    groupName: string;
    groupPhone: string;
    groupCreate: string;
    groupYourGroups: string;
    groupEmpty: string;
    groupDelete: string;
    groupDeleteConfirm: string;
    groupCreated: string;
    groupDeleted: string;
    groupCreateFailed: string;
    groupDeleteFailed: string;

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
        titleInteract: 'MWA | Interact',
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
        loginEmail: 'Email',
        loginSendLink: 'Send login link',
        loginSentLogin: 'We sent a login link to {email}.',
        loginSentSignup: 'We sent a signup link to {email} — click it to create your account.',
        loginCode: 'Code from the email',
        loginVerify: 'Verify code',

        homeWelcome: 'Welcome back, {name}',

        interactHeading: 'Interact with {name}',
        interactSelfJoke: "That's you! Scan someone else's code instead.",
        interactSendMoneyTitle: 'Send money',
        interactComingSoon: 'Coming soon',
        interactProfileDetailTitle: 'Profile details',
        interactDetailEmail: 'Email',
        interactDetailBalance: 'Balance',
        interactDetailJoined: 'Joined',

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
        dashQrHint: 'Let another user scan this code',
        dashQrBody: 'Scanning it opens a page where they can interact with your account.',

        queueTitle: 'Event queue',
        queuePositionLabel: 'Your position',
        queueJoinAs: 'Join the queue as {group}',
        queueLeave: 'Leave the queue',
        queueNeedGroup: 'You need a group to join the queue.',
        queueGoGroup: 'Go to your group',
        queueJoinFailed: 'Could not join the queue',
        queueLeaveFailed: 'Could not leave the queue',

        dashSupport: 'Support',
        dashCall: 'Call support',
        dashGuide: 'Guide & explanations',
        dashGuideBody: 'This section can contain explanations of the dashboard features.',

        groupManagement: 'Group Management',
        groupName: 'Group Name',
        groupPhone: 'Enter emergency phone Number',
        groupCreate: 'Create Group',
        groupYourGroups: 'your Groups',
        groupEmpty: 'no groups found',
        groupDelete: 'Delete group',
        groupDeleteConfirm: 'Delete group?',
        groupCreated: 'Group created successfully!',
        groupDeleted: 'Group deleted successfully!',
        groupCreateFailed: 'failed to create group',
        groupDeleteFailed: 'failed to delete group',

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
        titleInteract: 'MWA | Sąveika',
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
        loginEmail: 'El. paštas',
        loginSendLink: 'Siųsti prisijungimo nuorodą',
        loginSentLogin: 'Išsiuntėme prisijungimo nuorodą į {email}.',
        loginSentSignup:
            'Išsiuntėme registracijos nuorodą į {email} — paspausk ją, kad sukurtum paskyrą.',
        loginCode: 'Kodas iš laiško',
        loginVerify: 'Patvirtinti kodą',

        homeWelcome: 'Sveiki sugrįžę, {name}',

        interactHeading: 'Sąveika su {name}',
        interactSelfJoke: 'Tai jūs! Nuskanuokite ką nors kitą.',
        interactSendMoneyTitle: 'Siųsti pinigus',
        interactComingSoon: 'Netrukus',
        interactProfileDetailTitle: 'Profilio detalės',
        interactDetailEmail: 'El. paštas',
        interactDetailBalance: 'Balansas',
        interactDetailJoined: 'Prisijungė',

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
        dashQrHint: 'Leisk kitam naudotojui nuskamuoti šį kodą',
        dashQrBody: 'Nuskanavus atidaromas puslapis, kuriame galima sąveikauti su tavo paskyra.',

        queueTitle: 'Renginio eilė',
        queuePositionLabel: 'Tavo pozicija',
        queueJoinAs: 'Stoti į eilę kaip {group}',
        queueLeave: 'Palikti eilę',
        queueNeedGroup: 'Norint stoti į eilę, reikia grupės.',
        queueGoGroup: 'Eiti į grupę',
        queueJoinFailed: 'Nepavyko stoti į eilę',
        queueLeaveFailed: 'Nepavyko palikti eilės',

        dashSupport: 'Pagalba',
        dashCall: 'Skambinti pagalbai',
        dashGuide: 'Vadovas ir paaiškinimai',
        dashGuideBody: 'Šiame skyriuje gali būti pateikiami prietaisų skydelio paaiškinimai.',

        groupManagement: 'Grupių valdymas',
        groupName: 'Grupės pavadinimas',
        groupPhone: 'Įveskite skubios pagalbos telefono numerį',
        groupCreate: 'Sukurti grupę',
        groupYourGroups: 'tavo grupės',
        groupEmpty: 'grupių nerasta',
        groupDelete: 'Ištrinti grupę',
        groupDeleteConfirm: 'Ištrinti grupę?',
        groupCreated: 'Grupė sėkmingai sukurta!',
        groupDeleted: 'Grupė sėkmingai ištrinta!',
        groupCreateFailed: 'nepavyko sukurti grupės',
        groupDeleteFailed: 'nepavyko ištrinti grupės',

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
