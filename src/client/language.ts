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
    titleGambling: string;
    titleGame: string;
    titleInteract: string;
    titleAdmin: string;
    titleError: string;
    titleGamblingRequest: string;
    titleGamblingExpired: string;
    titleGamblingRejected: string;
    titleGamblingCoinFlip: string;
    titleGamblingInvite: string;

    headerLanding: string;
    headerLogin: string;
    headerHome: string;
    headerActivities: string;
    headerLeaderboard: string;
    headerGroup: string;
    headerGambling: string;
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
    txGamblingDeduction: string;
    txGamblingWinnings: string;
    dashQrTitle: string;
    dashQrHint: string;
    dashQrBody: string;
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

    gamblingActiveGames: string;
    gamblingVersus: string;
    gamblingWith: string;
    gamblingChallenge: string;
    gamblingBetAmount: string;
    gamblingSendInvite: string;
    gamblingInsufficientCoins: string;
    gamblingRequest: string;
    gamblingAcceptQuestion: string;
    gamblingAccept: string;
    gamblingReject: string;
    gamblingDisconnected: string;
    gamblingRefreshQuestion: string;
    gamblingWaiting: string;
    gamblingWaitingHelp: string;
    gamblingExpired: string;
    gamblingExpiryDetails: string;
    gamblingRejected: string;
    gamblingRejectedDetails: string;
    gamblingYouWin: string;
    gamblingWinner: string;
    gamblingNotificationInvite: string;
    gamblingOpen: string;
    gamblingInProgress: string;
    gamblingReturn: string;
    gamblingAction: string;

    gamblingCoinFlip: string;
    gamblingHeads: string;
    gamblingTails: string;
    gamblingCoinFlipDescription: string;
    gamblingCoinFlipChallenged: string;
    gamblingCoinFlipBetDetails: string;
    gamblingCoinFlipBetOutcome: string;
    gamblingCoinFlipping: string;
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
        titleGambling: 'MWA | Gambling',
        titleGame: 'MWA | Game',
        titleInteract: 'MWA | Interact',
        titleAdmin: 'MWA | Admin',
        titleError: 'MWA | {status}',
        titleGamblingRequest: 'MWA | Challenge request',
        titleGamblingExpired: 'MWA | Expired',
        titleGamblingRejected: 'MWA | Rejected',
        titleGamblingCoinFlip: 'MWA | Coin flip',
        titleGamblingInvite: 'MWA | Gamble with {name}',

        headerLanding: 'Home',
        headerLogin: 'Login',
        headerHome: 'App',
        headerActivities: 'Activities',
        headerLeaderboard: 'Leaderboard',
        headerGroup: 'Group',
        headerGambling: 'Gambling',
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
        txGamblingDeduction: 'Gambling deduction',
        txGamblingWinnings: 'Gambling winnings',
        dashQrTitle: 'Account QR code',
        dashQrHint: 'Let another user scan this code',
        dashQrBody: 'Scanning it opens a page where they can interact with your account.',
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

        gamblingActiveGames: 'Active games',
        gamblingVersus: '{p1} vs {p2}',
        gamblingWith: 'Gamble with {name}',
        gamblingChallenge: 'Challenge',
        gamblingBetAmount: 'Bet amount',
        gamblingSendInvite: 'Send invite',
        gamblingInsufficientCoins: 'You do not have enough coins for this bet.',
        gamblingRequest: 'Gambling request',
        gamblingAcceptQuestion: 'Do you wish to accept this bet?',
        gamblingAccept: 'Accept',
        gamblingReject: 'Reject',
        gamblingDisconnected: 'Disconnected from server.',
        gamblingRefreshQuestion: 'Refresh?',
        gamblingWaiting: 'Waiting for {player}',
        gamblingWaitingHelp: 'Tell them to open MWA and accept the invitation.',
        gamblingExpired: 'Expired',
        gamblingExpiryDetails:
            'This invitation expired because {player} did not accept it within {minutes} minutes.',
        gamblingRejected: 'Rejected',
        gamblingRejectedDetails: '{player} has rejected this challenge.',
        gamblingYouWin: 'You win!',
        gamblingWinner: '{player} won',
        gamblingNotificationInvite: '{player} has invited you to gamble!',
        gamblingOpen: 'Open',
        gamblingInProgress: 'You are currently gambling.',
        gamblingReturn: 'Return',
        gamblingAction: 'Gamble',

        gamblingCoinFlip: 'Coin flip',
        gamblingHeads: 'Heads',
        gamblingTails: 'Tails',
        gamblingCoinFlipDescription: 'Guess which side the coin will land on.',
        gamblingCoinFlipChallenged: '{player} has challenged you to a coin flip.',
        gamblingCoinFlipBetDetails: 'They are betting {amount} coins on this coin side: {side}.',
        gamblingCoinFlipBetOutcome:
            'If they are right, you lose {amount} coins. If they are wrong, you win {amount} coins.',
        gamblingCoinFlipping: 'Flipping the coin...',
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
        titleGambling: 'MWA | Lošimai',
        titleGame: 'MWA | Žaidimas',
        titleInteract: 'MWA | Sąveika',
        titleAdmin: 'MWA | Administravimas',
        titleError: 'MWA | {status}',
        titleGamblingRequest: 'MWA | Kvietimas lošti',
        titleGamblingExpired: 'MWA | Kvietimas nebegalioja',
        titleGamblingRejected: 'MWA | Kvietimas atmestas',
        titleGamblingCoinFlip: 'MWA | Monetos metimas',
        titleGamblingInvite: 'MWA | Lošk su {name}',

        headerLanding: 'Pradžia',
        headerLogin: 'Prisijungimas',
        headerHome: 'Programa',
        headerActivities: 'Veiklos',
        headerLeaderboard: 'Lyderių lentelė',
        headerGroup: 'Grupė',
        headerGambling: 'Lošimai',
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
        txGamblingDeduction: 'Lošimo atsiskaitymas',
        txGamblingWinnings: 'Lošimo laimėjimas',
        dashQrTitle: 'Paskyros QR kodas',
        dashQrHint: 'Leisk kitam naudotojui nuskamuoti šį kodą',
        dashQrBody: 'Nuskanavus atidaromas puslapis, kuriame galima sąveikauti su tavo paskyra.',
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

        gamblingActiveGames: 'Vykstantys žaidimai',
        gamblingVersus: '{p1} prieš {p2}',
        gamblingWith: 'Lošk su {name}',
        gamblingChallenge: 'Siųsti iššūkį',
        gamblingBetAmount: 'Statymo suma',
        gamblingSendInvite: 'Pakviesti',
        gamblingInsufficientCoins: 'Šiam statymui nepakanka monetų.',
        gamblingRequest: 'Kvietimas lošti',
        gamblingAcceptQuestion: 'Ar nori priimti šį statymą?',
        gamblingAccept: 'Priimti',
        gamblingReject: 'Atmesti',
        gamblingDisconnected: 'Ryšys su serveriu nutrūko.',
        gamblingRefreshQuestion: 'Atnaujinti?',
        gamblingWaiting: 'Laukiama žaidėjo {player}',
        gamblingWaitingHelp: 'Liepk atidaryti MWA ir priimti kvietimą.',
        gamblingExpired: 'Kvietimas nebegalioja',
        gamblingExpiryDetails:
            'Šis kvietimas nebegalioja, nes {player} jo nepriėmė per {minutes} min.',
        gamblingRejected: 'Kvietimas atmestas',
        gamblingRejectedDetails: '{player} atmetė šį kvietimą.',
        gamblingYouWin: 'Tu laimėjai!',
        gamblingWinner: 'Laimėjo {player}',
        gamblingNotificationInvite: '{player} kviečia tave lošti!',
        gamblingOpen: 'Atidaryti',
        gamblingInProgress: 'Šiuo metu dalyvauji lošime.',
        gamblingReturn: 'Grįžti',
        gamblingAction: 'Lošti',

        gamblingCoinFlip: 'Monetos metimas',
        gamblingHeads: 'Herbas',
        gamblingTails: 'Skaičius',
        gamblingCoinFlipDescription: 'Atspėk, kuria puse nukris moneta.',
        gamblingCoinFlipChallenged: '{player} kviečia tave mesti monetą.',
        gamblingCoinFlipBetDetails: 'Statoma {amount} monetų už šią monetos pusę: {side}.',
        gamblingCoinFlipBetOutcome:
            'Jei spėjimas teisingas, prarasi {amount} monetų. Jei klaidingas, laimėsi {amount} monetų.',
        gamblingCoinFlipping: 'Metama moneta...',
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
