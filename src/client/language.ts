export type LanguageCode = 'en' | 'lt';

export const defaultLanguage: LanguageCode = 'en';

export type Language = {
    displayName: string;

    titleLanding: string;
    titleLogin: string;
    titleHome: string;
    titleActivities: string;
    titleActivity: string;
    titleLeaderboard: string;
    titleGambling: string;
    titleHost: string;
    titleAdmin: string;
    titleError: string;
    titleGamblingRequest: string;
    titleGamblingExpired: string;
    titleGamblingRejected: string;
    titleGamblingCoinFlip: string;
    titleGamblingConnect4: string;
    titleGamblingInvite: string;

    headerHome: string;
    headerActivities: string;
    headerLeaderboard: string;
    headerGambling: string;
    headerHost: string;
    headerAdmin: string;

    logOut: string;
    logInSignUp: string;

    loginEmail: string;
    loginSendLink: string;
    loginSentLogin: string;
    loginSentSignup: string;
    loginCode: string;
    loginVerify: string;

    interactHeading: string;
    interactSelfJoke: string;
    interactSendMoneyTitle: string;
    interactProfileDetailTitle: string;
    interactDetailEmail: string;
    interactDetailBalance: string;
    interactDetailJoined: string;

    landingLangTitle: string;
    landingLoginTitle: string;
    landingCountdownTitle: string;
    landingSocialTitle: string;
    landingFeedTitle: string;
    landingGoApp: string;
    landingLogin: string;
    countdownDays: string;
    countdownHours: string;
    countdownMinutes: string;
    countdownSeconds: string;
    sponsorsTitle: string;
    sponsorsSubtitle: string;

    dashFinances: string;
    dashBalance: string;
    currencyName: string;
    dashNoTransactions: string;
    txTransfer: string;
    txPurchase: string;
    txSystem: string;
    txGamblingDeduction: string;
    txGamblingWinnings: string;
    txHostGrant: string;
    txColDate: string;
    txColType: string;
    txColAmount: string;
    dashQrTitle: string;
    qrCopyLink: string;
    qrCopied: string;

    dashGame: string;
    queuePositionInline: string;
    queueJoin: string;
    queueLeave: string;
    queueGroupSize: string;
    queueNeedGroup: string;
    queueJoinFailed: string;
    queueLeaveFailed: string;
    dashStandings: string;

    hostCallTitle: string;
    hostStation: string;
    hostCount: string;
    hostRequest: string;
    hostWaiting: string;
    hostAtStation: string;
    hostStationEmpty: string;
    hostDone: string;
    hostNextUp: string;
    hostQueueEmpty: string;
    hostRequestFailed: string;
    hostDoneFailed: string;

    dashSupport: string;
    dashCall: string;
    dashGuide: string;
    dashGuideBody: string;

    shellSkip: string;
    shellLogoAlt: string;
    shellNavLabel: string;
    navTitle: string;
    shellAlert: string;
    dialogClose: string;

    activitiesDirectory: string;
    activitiesEmpty: string;
    activityInfoTitle: string;
    activityBack: string;

    leaderboardTypeLabel: string;
    leaderboardScopeLabel: string;
    leaderboardActivity: string;
    leaderboardGambling: string;
    leaderboardCombined: string;
    leaderboardActivityHint: string;
    leaderboardGamblingHint: string;
    leaderboardCombinedHint: string;
    leaderboardPlayers: string;
    leaderboardGroups: string;
    leaderboardRankings: string;
    leaderboardColMembers: string;
    leaderboardColGames: string;
    leaderboardNoGroups: string;
    leaderboardNoPlayers: string;
    leaderboardMemberCount: string;
    leaderboardGames: string;
    leaderboardGroupTag: string;
    leaderboardYou: string;

    dashYou: string;
    youUsername: string;
    youEdit: string;
    youSettingsEdit: string;
    youEmail: string;
    youRole: string;
    youSave: string;
    youUsernameTaken: string;
    youUsernameInvalid: string;
    adminPanelHead: string;
    adminPanelTodo: string;

    dashGroup: string;
    groupNone: string;
    groupOwner: string;
    groupKick: string;
    groupKickHint: string;
    groupLeave: string;
    groupLeaveHint: string;
    groupDeleteHint: string;
    groupKickFailed: string;
    groupLeaveFailed: string;
    groupName: string;
    groupPhone: string;
    groupSettings: string;
    groupSettingsEdit: string;
    groupDelete: string;
    groupDeleteConfirm: string;
    groupDeleteFailed: string;
    groupRequestJoin: string;
    groupInviteCreates: string;
    groupRequestSent: string;
    groupRequestFailed: string;
    groupInviteNotice: string;
    groupInviteAccept: string;
    groupAcceptFailed: string;
    groupEdit: string;
    groupEditFailed: string;
    groupNameTaken: string;

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
    gamblingInvitations: string;
    gamblingNoInvitations: string;
    gamblingNoActiveGames: string;
    gamblingVersus: string;
    gamblingWith: string;
    gamblingChallenge: string;
    gamblingBetAmount: string;
    gamblingSendInvite: string;
    gamblingInsufficientCoins: string;
    gamblingInvalidBet: string;
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
    gamblingPlayerYou: string;
    gamblingDraw: string;
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

    gamblingConnect4: string;
    gamblingConnect4Description: string;
    gamblingConnect4Challenged: string;

    gamblingChess: string;
    gamblingChessDescription: string;
    gamblingChessChallenged: string;
    gamblingChessTurn: string;
    gamblingChessCheck: string;
    gamblingChessWhite: string;
    gamblingChessBlack: string;
    gamblingChessPromotion: string;
    gamblingChessPawn: string;
    gamblingChessKnight: string;
    gamblingChessBishop: string;
    gamblingChessRook: string;
    gamblingChessQueen: string;
    gamblingChessKing: string;
};

export const languages: Record<LanguageCode, Language> = {
    en: {
        displayName: 'English',

        titleLanding: 'first years | Home',
        titleLogin: 'first years | Login',
        titleHome: 'first years | App',
        titleActivities: 'first years | Activities',
        titleActivity: 'first years | {name}',
        titleLeaderboard: 'first years | Leaderboard',
        titleGambling: 'first years | Gambling',
        titleHost: 'first years | Host',
        titleAdmin: 'first years | Admin',
        titleError: 'first years | {status}',
        titleGamblingRequest: 'first years | Challenge request',
        titleGamblingExpired: 'first years | Expired',
        titleGamblingRejected: 'first years | Rejected',
        titleGamblingCoinFlip: 'first years | Coin flip',
        titleGamblingConnect4: 'first years | Connect 4',
        titleGamblingInvite: 'first years | Gamble with {name}',

        headerHome: 'App',
        headerActivities: 'Activities',
        headerLeaderboard: 'Leaderboard',
        headerGambling: 'Gambling',
        headerHost: 'Host tools',
        headerAdmin: 'Admin',

        logOut: 'Log out',
        logInSignUp: 'Log in / sign up',

        loginEmail: 'Email',
        loginSendLink: 'Send login link',
        loginSentLogin: 'We sent a login link to {email}.',
        loginSentSignup: 'We sent a signup link to {email} — click it to create your account.',
        loginCode: 'Code from the email',
        loginVerify: 'Verify code',

        interactHeading: 'Interact with {name}',
        interactSelfJoke: "That's you! Scan someone else's code instead.",
        interactSendMoneyTitle: 'Send money',
        interactProfileDetailTitle: 'Profile details',
        interactDetailEmail: 'Email',
        interactDetailBalance: 'Balance',
        interactDetailJoined: 'Joined',

        landingLangTitle: 'Language',
        landingLoginTitle: 'System',
        landingCountdownTitle: 'Until the event',
        landingSocialTitle: 'Follow us here!',
        landingFeedTitle: 'Activities',
        landingGoApp: 'Go',
        landingLogin: 'Login',
        countdownDays: 'days',
        countdownHours: 'hours',
        countdownMinutes: 'minutes',
        countdownSeconds: 'seconds',
        sponsorsTitle: 'Sponsors',
        sponsorsSubtitle: 'Our generous sponsors',

        dashFinances: 'Your finances',
        dashBalance: 'Current balance',
        currencyName: 'micius koinai',
        dashNoTransactions: 'No transactions yet',
        txTransfer: 'Transfer',
        txPurchase: 'Purchase',
        txSystem: 'System credit',
        txGamblingDeduction: 'Gambling deduction',
        txGamblingWinnings: 'Gambling winnings',
        txHostGrant: 'Host grant',
        txColDate: 'Date',
        txColType: 'Type',
        txColAmount: 'Amount',
        dashQrTitle: 'Account QR code',
        qrCopyLink: 'Copy link',
        qrCopied: 'Copied!',

        dashGame: 'Game',
        queuePositionInline: '#{pos} in the queue',
        queueJoin: 'Join queue',
        queueLeave: 'Leave the queue',
        queueGroupSize: '{n} people in the group',
        queueNeedGroup: 'You need a group to join the queue.',
        queueJoinFailed: 'Could not join the queue',
        queueLeaveFailed: 'Could not leave the queue',
        dashStandings: 'Your standings',

        hostCallTitle: 'Send groups to a station',
        hostStation: 'Station',
        hostCount: 'Groups to call',
        hostRequest: 'Request from queue',
        hostWaiting: '{n} group(s) waiting in the queue',
        hostAtStation: 'At the station',
        hostStationEmpty: 'No groups at this station',
        hostDone: 'Done',
        hostNextUp: 'Next in line',
        hostQueueEmpty: 'The queue is empty',
        hostRequestFailed: 'Could not request groups',
        hostDoneFailed: 'Could not mark the group done',

        dashSupport: 'Support',
        dashCall: 'Call support',
        dashGuide: 'Guide & explanations',
        dashGuideBody: 'This section can contain explanations of the dashboard features.',

        shellSkip: 'Skip to content',
        shellLogoAlt: 'first years Event home',
        shellNavLabel: 'Main navigation',
        navTitle: 'Menu',
        shellAlert: 'Alert',
        dialogClose: 'Close',

        activitiesDirectory: 'Activity directory',
        activitiesEmpty: 'No activities listed yet.',
        activityInfoTitle: 'activity information',
        activityBack: '← back to activities',

        leaderboardTypeLabel: 'Leaderboard board',
        leaderboardScopeLabel: 'Leaderboard scope',
        leaderboardActivity: 'Activity',
        leaderboardGambling: 'Gambling',
        leaderboardCombined: 'All',
        leaderboardActivityHint: 'earned at activity stations',
        leaderboardGamblingHint: 'net gambling balance',
        leaderboardCombinedHint: 'total balance',
        leaderboardPlayers: 'players',
        leaderboardGroups: 'groups',
        leaderboardRankings: '{type} rankings',
        leaderboardColMembers: 'members',
        leaderboardColGames: 'games',
        leaderboardNoGroups: 'No groups yet.',
        leaderboardNoPlayers: 'No players yet.',
        leaderboardMemberCount: '{n} member(s)',
        leaderboardGames: '{n} game(s)',
        leaderboardGroupTag: '*group',
        leaderboardYou: 'You',

        dashYou: 'You',
        youUsername: 'Username',
        youEdit: 'Edit',
        youSettingsEdit: 'Edit user settings',
        youEmail: 'Email',
        youRole: 'Role',
        youSave: 'Save',
        youUsernameTaken: 'That username is taken',
        youUsernameInvalid: 'Usernames are 1–16 lowercase letters, numbers, _ or -',
        adminPanelHead: 'administration',
        adminPanelTodo: 'TODO: admin panel.',

        dashGroup: 'Your group',
        groupNone: 'You are not in a group.',
        groupOwner: 'owner',
        groupKick: 'Kick',
        groupKickHint: 'Remove {name} from the group',
        groupLeave: 'Leave',
        groupLeaveHint: 'Leave this group',
        groupDeleteHint: 'Delete this group and all its members',
        groupKickFailed: 'Could not remove the member',
        groupLeaveFailed: 'Could not leave the group',
        groupName: 'Name',
        groupPhone: 'Emergency phone',
        groupSettings: 'Group settings',
        groupSettingsEdit: 'Edit group settings',
        groupDelete: 'Delete group',
        groupDeleteConfirm: 'Delete group?',
        groupDeleteFailed: 'failed to delete group',
        groupRequestJoin: 'Join their team',
        groupInviteCreates: 'Accepting creates a new team with you as the owner.',
        groupRequestSent: 'Join request sent.',
        groupRequestFailed: 'Could not send the join request.',
        groupInviteNotice: '{player} wants to join your team!',
        groupInviteAccept: 'Accept',
        groupAcceptFailed: 'Could not form the group.',
        groupEdit: 'Edit',
        groupEditFailed: 'Could not update the group.',
        groupNameTaken: 'That group name is already taken.',

        loginInvalidEmail: 'Enter a valid email',
        loginSendFailed: 'Could not send the email — try again in a moment',
        loginLinkExpired: 'That login link is expired or already used — request a new one',
        loginWrongCode: 'Wrong code — check the email and try again',
        loginCodeExpired: 'That code is expired or already used — request a new one',
        badRequest: 'Bad Request',
        emailLoginSubject: 'Your first years sign-in link',
        emailLoginHeading: 'Sign in to first years',
        emailLoginIntro: 'Click the button below to sign in. The link expires in 15 minutes.',
        emailLoginAction: 'Sign in',
        emailLoginCode: 'Or enter this code on the login page:',
        emailLoginFallback: "If the button doesn't work, paste this link into your browser:",
        emailLoginExpiry: 'The link and code expire in 15 minutes.',

        gamblingActiveGames: 'Active games',
        gamblingInvitations: 'Invitations',
        gamblingNoInvitations: 'No invitations yet.',
        gamblingNoActiveGames: 'No games running.',
        gamblingVersus: '{p1} vs {p2}',
        gamblingWith: 'Gamble with {name}',
        gamblingChallenge: 'Challenge',
        gamblingBetAmount: 'Bet amount',
        gamblingSendInvite: 'Send invite',
        gamblingInsufficientCoins: 'You do not have enough coins for this bet.',
        gamblingInvalidBet: 'Enter a valid whole-number bet amount.',
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
        gamblingPlayerYou: '{player} (You)',
        gamblingDraw: "It's a draw!",
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

        gamblingChess: 'Chess',
        gamblingChessDescription: 'Play regular chess. Each player has five minutes.',
        gamblingChessChallenged: '{player} challenged you to chess for {amount} coins.',
        gamblingChessTurn: '{player} to move',
        gamblingChessCheck: 'Check',
        gamblingChessWhite: 'White',
        gamblingChessBlack: 'Black',
        gamblingChessPromotion: 'Promote pawn to',
        gamblingChessPawn: 'Pawn',
        gamblingChessKnight: 'Knight',
        gamblingChessBishop: 'Bishop',
        gamblingChessRook: 'Rook',
        gamblingChessQueen: 'Queen',
        gamblingChessKing: 'King',
        gamblingConnect4: 'Connect 4',
        gamblingConnect4Description:
            'Be the first to connect four of your pieces horizontally, vertically, or diagonally.',
        gamblingConnect4Challenged: '{player} invites you to a Connect 4 duel for {amount} coins.',
    },
    lt: {
        displayName: 'Lietuvių',

        titleLanding: 'pirmakursiu | Pradžia',
        titleLogin: 'pirmakursiu | Prisijungimas',
        titleHome: 'pirmakursiu | Programa',
        titleActivities: 'pirmakursiu | Veiklos',
        titleActivity: 'pirmakursiu | {name}',
        titleLeaderboard: 'pirmakursiu | Lyderių lentelė',
        titleGambling: 'pirmakursiu | Lošimai',
        titleHost: 'pirmakursiu | Vedėjas',
        titleAdmin: 'pirmakursiu | Administravimas',
        titleError: 'pirmakursiu | {status}',
        titleGamblingRequest: 'pirmakursiu | Kvietimas lošti',
        titleGamblingExpired: 'pirmakursiu | Kvietimas nebegalioja',
        titleGamblingRejected: 'pirmakursiu | Kvietimas atmestas',
        titleGamblingCoinFlip: 'pirmakursiu | Monetos metimas',
        titleGamblingConnect4: 'pirmakursiu | Keturi iš eilės',
        titleGamblingInvite: 'pirmakursiu | Lošk su {name}',

        headerHome: 'Programa',
        headerActivities: 'Veiklos',
        headerLeaderboard: 'Lyderių lentelė',
        headerGambling: 'Lošimai',
        headerHost: 'Vedėjo įrankiai',
        headerAdmin: 'Administravimas',

        logOut: 'Atsijungti',
        logInSignUp: 'Prisijungti / registruotis',

        loginEmail: 'El. paštas',
        loginSendLink: 'Siųsti prisijungimo nuorodą',
        loginSentLogin: 'Išsiuntėme prisijungimo nuorodą į {email}.',
        loginSentSignup:
            'Išsiuntėme registracijos nuorodą į {email} — paspausk ją, kad sukurtum paskyrą.',
        loginCode: 'Kodas iš laiško',
        loginVerify: 'Patvirtinti kodą',

        interactHeading: 'Sąveika su {name}',
        interactSelfJoke: 'Tai jūs! Nuskanuokite ką nors kitą.',
        interactSendMoneyTitle: 'Siųsti pinigus',
        interactProfileDetailTitle: 'Profilio detalės',
        interactDetailEmail: 'El. paštas',
        interactDetailBalance: 'Balansas',
        interactDetailJoined: 'Prisijungė',

        landingLangTitle: 'Kalba',
        landingLoginTitle: 'Sistema',
        landingCountdownTitle: 'Iki renginio',
        landingSocialTitle: 'Sekite mus čia!',
        landingFeedTitle: 'Veiklos',
        landingGoApp: 'Eiti',
        landingLogin: 'Prisijungti',
        countdownDays: 'dienų',
        countdownHours: 'valandų',
        countdownMinutes: 'minučių',
        countdownSeconds: 'sekundžių',
        sponsorsTitle: 'Rėmėjai',
        sponsorsSubtitle: 'Mūsų dosnūs rėmėjai',

        dashFinances: 'Tavo finansai',
        dashBalance: 'Dabartinis balansas',
        currencyName: 'micius koinai',
        dashNoTransactions: 'Operacijų dar nėra',
        txTransfer: 'Pervedimas',
        txPurchase: 'Pirkimas',
        txSystem: 'Sisteminis įskaitymas',
        txGamblingDeduction: 'Lošimo atsiskaitymas',
        txGamblingWinnings: 'Lošimo laimėjimas',
        txHostGrant: 'Vedėjo įskaitymas',
        txColDate: 'Data',
        txColType: 'Tipas',
        txColAmount: 'Suma',
        dashQrTitle: 'Paskyros QR kodas',
        qrCopyLink: 'Kopijuoti nuorodą',
        qrCopied: 'Nukopijuota!',

        dashGame: 'Žaidimas',
        queuePositionInline: '#{pos} eilėje',
        queueJoin: 'Stoti į eilę',
        queueLeave: 'Palikti eilę',
        queueGroupSize: '{n} nariai grupėje',
        queueNeedGroup: 'Norint stoti į eilę, reikia grupės.',
        queueJoinFailed: 'Nepavyko stoti į eilę',
        queueLeaveFailed: 'Nepavyko palikti eilės',
        dashStandings: 'Tavo pozicijos',

        hostCallTitle: 'Siųsti grupes į stotį',
        hostStation: 'Stotis',
        hostCount: 'Kiek grupių kviesti',
        hostRequest: 'Paimti iš eilės',
        hostWaiting: 'Eilėje laukia grupių: {n}',
        hostAtStation: 'Prie stoties',
        hostStationEmpty: 'Prie šios stoties grupių nėra',
        hostDone: 'Atlikta',
        hostNextUp: 'Eilėje toliau',
        hostQueueEmpty: 'Eilė tuščia',
        hostRequestFailed: 'Nepavyko pakviesti grupių',
        hostDoneFailed: 'Nepavyko pažymėti grupės kaip atliktos',

        dashSupport: 'Pagalba',
        dashCall: 'Skambinti pagalbai',
        dashGuide: 'Vadovas ir paaiškinimai',
        dashGuideBody: 'Šiame skyriuje gali būti pateikiami prietaisų skydelio paaiškinimai.',

        shellSkip: 'Pereiti prie turinio',
        shellLogoAlt: 'pirmakursiu renginio pradžia',
        shellNavLabel: 'Pagrindinė navigacija',
        navTitle: 'Meniu',
        shellAlert: 'Pranešimas',
        dialogClose: 'Uždaryti',

        activitiesDirectory: 'Veiklų katalogas',
        activitiesEmpty: 'Veiklų dar nėra.',
        activityInfoTitle: 'veiklos informacija',
        activityBack: '← atgal į veiklas',

        leaderboardTypeLabel: 'Lentelės tipas',
        leaderboardScopeLabel: 'Lentelės apimtis',
        leaderboardActivity: 'Aktyvumas',
        leaderboardGambling: 'Lošimai',
        leaderboardCombined: 'Viskas',
        leaderboardActivityHint: 'uždirbta per veiklas',
        leaderboardGamblingHint: 'lošimų balansas',
        leaderboardCombinedHint: 'bendras balansas',
        leaderboardPlayers: 'žaidėjai',
        leaderboardGroups: 'grupės',
        leaderboardRankings: '{type} lyderiai',
        leaderboardColMembers: 'nariai',
        leaderboardColGames: 'žaidimai',
        leaderboardNoGroups: 'Grupių kol kas nėra.',
        leaderboardNoPlayers: 'Žaidėjų kol kas nėra.',
        leaderboardMemberCount: 'Nariai: {n}',
        leaderboardGames: 'Žaidimai: {n}',
        leaderboardGroupTag: '*grupė',
        leaderboardYou: 'Jūs',

        dashYou: 'Tu',
        youUsername: 'Vartotojo vardas',
        youEdit: 'Redaguoti',
        youSettingsEdit: 'Keičiami vartotojo nustatymai',
        youEmail: 'El. paštas',
        youRole: 'Rolė',
        youSave: 'Išsaugoti',
        youUsernameTaken: 'Šis vartotojo vardas užimtas',
        youUsernameInvalid: 'Varde gali būti 1–16 mažųjų raidžių, skaičių, _ arba -',

        adminPanelHead: 'administravimas',
        adminPanelTodo: 'TODO: administravimo skydelis.',

        dashGroup: 'Tavo grupė',
        groupNone: 'Nesate grupėje.',
        groupOwner: 'savininkas',
        groupKick: 'Išmesti',
        groupKickHint: 'Pašalinti {name} iš grupės',
        groupLeave: 'Išeiti',
        groupLeaveHint: 'Išeiti iš grupės',
        groupDeleteHint: 'Ištrinti grupę ir visus narius',
        groupKickFailed: 'Nepavyko pašalinti nario',
        groupLeaveFailed: 'Nepavyko išeiti iš grupės',
        groupName: 'Pavadinimas',
        groupPhone: 'Skubios pagalbos numeris',
        groupSettings: 'Grupės nustatymai',
        groupSettingsEdit: 'Keičiami grupės nustatymai',
        groupDelete: 'Ištrinti grupę',
        groupDeleteConfirm: 'Ištrinti grupę?',
        groupDeleteFailed: 'nepavyko ištrinti grupės',
        groupRequestJoin: 'Prisijungti prie komandos',
        groupInviteCreates: 'Priėmus bus sukurta nauja komanda, kurios savininkas būsi tu.',
        groupRequestSent: 'Prašymas išsiųstas.',
        groupRequestFailed: 'Nepavyko išsiųsti prašymo.',
        groupInviteNotice: '{player} nori prisijungti prie tavo komandos!',
        groupInviteAccept: 'Priimti',
        groupAcceptFailed: 'Nepavyko suformuoti komandos.',
        groupEdit: 'Redaguoti',
        groupEditFailed: 'Nepavyko atnaujinti grupės.',
        groupNameTaken: 'Grupės pavadinimas jau užimtas.',

        loginInvalidEmail: 'Įveskite galiojantį el. pašto adresą',
        loginSendFailed: 'Nepavyko išsiųsti el. laiško — netrukus bandykite dar kartą',
        loginLinkExpired:
            'Ši prisijungimo nuoroda nebegalioja arba jau panaudota — paprašykite naujos',
        loginWrongCode: 'Neteisingas kodas — patikrinkite el. laišką ir bandykite dar kartą',
        loginCodeExpired: 'Šis kodas nebegalioja arba jau panaudotas — paprašykite naujo',
        badRequest: 'Netinkama užklausa',
        emailLoginSubject: 'Jūsų pirmakursiu prisijungimo nuoroda',
        emailLoginHeading: 'Prisijunkite prie pirmakursiu',
        emailLoginIntro:
            'Norėdami prisijungti, spustelėkite žemiau esantį mygtuką. Nuoroda galioja 15 minučių.',
        emailLoginAction: 'Prisijungti',
        emailLoginCode: 'Arba prisijungimo puslapyje įveskite šį kodą:',
        emailLoginFallback: 'Jei mygtukas neveikia, įklijuokite šią nuorodą į naršyklę:',
        emailLoginExpiry: 'Nuoroda ir kodas galioja 15 minučių.',

        gamblingActiveGames: 'Vykstantys žaidimai',
        gamblingInvitations: 'Kvietimai',
        gamblingNoInvitations: 'Kvietimų kol kas nėra.',
        gamblingNoActiveGames: 'Šiuo metu vykstančių žaidimų nėra.',
        gamblingVersus: '{p1} prieš {p2}',
        gamblingWith: 'Lošk su {name}',
        gamblingChallenge: 'Siųsti iššūkį',
        gamblingBetAmount: 'Statymo suma',
        gamblingSendInvite: 'Pakviesti',
        gamblingInsufficientCoins: 'Šiam statymui nepakanka monetų.',
        gamblingInvalidBet: 'Neteisinga statymo suma.',
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
        gamblingPlayerYou: '{player} (Tu)',
        gamblingDraw: 'Lygiosios',
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

        gamblingChess: 'Šachmatai',
        gamblingChessDescription: 'Žaiskite šachmatais. Kiekvienam skiriamos penkios minutės.',
        gamblingChessChallenged: '{player} kviečia žaisti šachmatais iš {amount} monetų.',
        gamblingChessTurn: '{player} eilė eiti',
        gamblingChessCheck: 'Šachas',
        gamblingChessWhite: 'Baltieji',
        gamblingChessBlack: 'Juodieji',
        gamblingChessPromotion: 'Pėstininką pakeisti į',
        gamblingChessPawn: 'Pėstininkas',
        gamblingChessKnight: 'Žirgas',
        gamblingChessBishop: 'Rikis',
        gamblingChessRook: 'Bokštas',
        gamblingChessQueen: 'Valdovė',
        gamblingChessKing: 'Karalius',
        gamblingConnect4: 'Keturi iš eilės',
        gamblingConnect4Description:
            'Pirmas sudėk keturis savo žetonus į eilę horizontaliai, vertikaliai arba įstrižai.',
        gamblingConnect4Challenged:
            '{player} kviečia tave žaisti „Keturi iš eilės“ statant {amount} monetų.',
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
