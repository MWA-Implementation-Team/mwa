import { MAX_USERNAME_LENGTH } from './constants.js';

export type LanguageCode = 'en' | 'lt';

export const defaultLanguage: LanguageCode = 'lt';

export type Language = {
    displayName: string;

    titleApp: string;

    headerHome: string;
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
    loginConfirmPrompt: string;
    loginConfirmSubmit: string;

    interactSelfJoke: string;
    interactGeneralTitle: string;
    interactSendMoneyTitle: string;
    interactAwardNote: string;
    interactSendSubmit: string;
    interactSendAvailable: string;
    interactSendAll: string;
    interactSendInvalid: string;
    interactSendInsufficient: string;
    interactMoneySent: string;
    interactAwardInvalid: string;
    interactAwarded: string;
    interactGroupNone: string;
    interactCodeTitle: string;
    interactCodeYours: string;
    interactCodeReset: string;
    interactCodeInput: string;
    interactCodeInvalid: string;
    interactAwardGroup: string;
    interactAwardedGroup: string;
    interactAwardNoGroup: string;
    stationBanner: string;
    accountQrHint: string;
    accountQrReset: string;
    qrClaimed: string;
    qrErrorNotFound: string;
    qrErrorExpired: string;
    qrErrorUsedUp: string;
    qrErrorAlreadyClaimed: string;

    landingLangTitle: string;
    landingLoginTitle: string;
    landingCountdownTitle: string;
    landingSocialTitle: string;
    landingSocialEvent: string;
    landingFeedTitle: string;
    landingGoApp: string;
    landingMain: string;
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
    queueTooSmall: string;
    queueAtStation: string;
    queueAllDone: string;
    homeStationProgress: string;
    queueJoinFailed: string;
    queueLeaveFailed: string;
    dashStandings: string;

    hostAssign: string;
    hostCount: string;
    hostRequest: string;
    hostAtStation: string;
    hostStationEmpty: string;
    hostPrevStation: string;
    hostNextStation: string;
    hostDone: string;
    hostAlreadyDone: string;
    hostNextUp: string;
    hostQueueEmpty: string;
    hostRequestFailed: string;
    hostDoneFailed: string;
    hostCall: string;

    dashSupport: string;
    dashCall: string;

    shellSkip: string;
    shellLogoAlt: string;
    shellNavLabel: string;
    navTitle: string;
    shellAlert: string;
    dialogClose: string;

    activityBack: string;
    activityCompleted: string;

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
    lbDisbanded: string;
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
    youSaved: string;
    youQrReset: string;
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
    groupDisbandHint: string;
    groupKickFailed: string;
    groupLeaveFailed: string;
    groupKicked: string;
    groupDeleted: string;
    groupLeft: string;
    groupName: string;
    groupPhone: string;
    groupSettings: string;
    groupSettingsEdit: string;
    groupSaved: string;
    groupDisband: string;
    groupDisbandConfirm: string;
    groupDisbandFailed: string;
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
    loginRateLimited: string;
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
    gamblingChallenge: string;
    gamblingPlayAgain: string;
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

        titleApp: 'Freshman Event',

        headerHome: 'Event',

        headerLeaderboard: 'Leaderboard',
        headerGambling: 'Gambling',
        headerHost: 'Host tools',
        headerAdmin: 'Admin tools',

        logOut: 'Log out',
        logInSignUp: 'Log in / sign up',

        loginEmail: 'Email',
        loginSendLink: 'Send login link',
        loginSentLogin: 'We sent a login link to {email}.',
        loginSentSignup: 'We sent a signup link to {email} — click it to create your account.',
        loginCode: 'Code from the email',
        loginVerify: 'Verify code',
        loginConfirmPrompt: 'Continue to sign in.',
        loginConfirmSubmit: 'Continue',

        interactSelfJoke: "That's you! Scan someone else's code instead.",
        interactGeneralTitle: 'General information',
        interactSendMoneyTitle: 'Send money',
        interactAwardNote: 'Note (optional)',
        interactSendSubmit: 'Send',
        interactSendAvailable: 'Available {amount}',
        interactSendAll: 'All',
        interactSendInvalid: 'Enter a valid whole-number amount.',
        interactSendInsufficient: 'You do not have enough coins.',
        interactMoneySent: 'Sent {amount} coins.',
        interactAwardInvalid: 'Enter a valid whole-number amount.',
        interactAwarded: 'Coins awarded.',
        interactGroupNone: 'Not in a group.',
        interactCodeTitle: 'Interact code',
        interactCodeYours: 'Your interaction code',
        interactCodeReset: 'Reset interact code',
        interactCodeInput: "Friend's code",
        interactCodeInvalid: 'No one has that code.',
        interactAwardGroup: 'Award group ({n})',
        interactAwardedGroup: 'Whole group awarded.',
        interactAwardNoGroup: 'They have no group.',
        stationBanner: 'Your group is assigned to {name}',
        accountQrHint:
            'Your personal QR is shown in the sidebar. Reset it to invalidate the old code.',
        accountQrReset: 'Reset QR code',
        qrClaimed: 'You found {amount} coins!',
        qrErrorNotFound: "This QR code doesn't exist.",
        qrErrorExpired: 'This QR code has expired.',
        qrErrorUsedUp: 'This QR code has already been fully used.',
        qrErrorAlreadyClaimed: 'You have already claimed this QR code.',

        landingLangTitle: 'Language',
        landingLoginTitle: 'System',
        landingCountdownTitle: 'Until the event',
        landingSocialTitle: 'Follow us here!',
        landingSocialEvent: 'Event',
        landingFeedTitle: 'Activities',
        landingGoApp: 'Go',
        landingMain: 'Main',
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
        queueTooSmall: 'Your group needs at least 2 people to join the queue.',
        queueAtStation:
            'Your team is at a station right now — finish it before rejoining the queue.',
        queueAllDone: 'Your team has completed every station!',
        homeStationProgress: 'Activities',
        queueJoinFailed: 'Could not join the queue',
        queueLeaveFailed: 'Could not leave the queue',
        dashStandings: 'Your standings',

        hostAssign: 'Assign groups',
        hostCount: 'Groups to call',
        hostRequest: 'Request from queue',
        hostAtStation: 'Teams assigned to the activity',
        hostStationEmpty: 'No groups at this station',
        hostPrevStation: 'Previous station',
        hostNextStation: 'Next station',
        hostDone: 'Done',
        hostAlreadyDone: 'done here',
        hostNextUp: 'Next in line',
        hostQueueEmpty: 'The queue is empty',
        hostRequestFailed: 'Could not request groups',
        hostDoneFailed: 'Could not mark the group done',
        hostCall: 'Call',

        dashSupport: 'Support',
        dashCall: 'Call support',

        shellSkip: 'Skip to content',
        shellLogoAlt: 'first years Event home',
        shellNavLabel: 'Main navigation',
        navTitle: 'Menu',
        shellAlert: 'Alert',
        dialogClose: 'Close',

        activityBack: '← back to activities',
        activityCompleted: '✓ Your team completed this station',

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
        lbDisbanded: 'disbanded',
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
        youSaved: 'Settings saved.',
        youQrReset: 'QR code reset.',
        youUsernameTaken: 'That username is taken',
        youUsernameInvalid: `Usernames are 1–${MAX_USERNAME_LENGTH} lowercase letters, numbers, _ or -`,
        adminPanelHead: 'administration',
        adminPanelTodo: 'TODO: admin panel.',

        dashGroup: 'Your group',
        groupNone: 'You are not in a group.',
        groupOwner: 'owner',
        groupKick: 'Kick',
        groupKickHint: 'Remove {name} from the group',
        groupLeave: 'Leave',
        groupLeaveHint: 'Leave this group',
        groupDisbandHint: 'Disband this group and remove all members',
        groupKickFailed: 'Could not remove the member',
        groupLeaveFailed: 'Could not leave the group',
        groupKicked: 'Member kicked.',
        groupDeleted: 'Group deleted.',
        groupLeft: 'Left the group.',
        groupName: 'Name',
        groupPhone: 'Emergency phone',
        groupSettings: 'Group settings',
        groupSettingsEdit: 'Edit group settings',
        groupSaved: 'Group settings saved.',
        groupDisband: 'Disband group',
        groupDisbandConfirm: 'Disband group?',
        groupDisbandFailed: 'failed to disband group',
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
        loginRateLimited: 'Please wait a minute before requesting another login email.',
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
        gamblingChallenge: 'Challenge',
        gamblingPlayAgain: 'Play again',
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

        titleApp: 'Pirmakursių Renginys',

        headerHome: 'Renginys',

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
        loginConfirmPrompt: 'Tęskite, kad prisijungtumėte.',
        loginConfirmSubmit: 'Tęsti',

        interactSelfJoke: 'Tai jūs! Nuskanuokite ką nors kitą.',
        interactGeneralTitle: 'Bendra informacija',
        interactSendMoneyTitle: 'Siųsti pinigus',
        interactAwardNote: 'Žinutė (neprivaloma)',
        interactSendSubmit: 'Siųsti',
        interactSendAvailable: 'Galima {amount}',
        interactSendAll: 'Viską',
        interactSendInvalid: 'Neteisinga suma.',
        interactSendInsufficient: 'Nepakanka monetų.',
        interactMoneySent: 'Išsiųsta {amount} monetų.',
        interactAwardInvalid: 'Neteisinga suma.',
        interactAwarded: 'Koinai suteikti.',
        interactGroupNone: 'Nėra grupėje.',
        interactCodeTitle: 'Sąveikos kodas',
        interactCodeYours: 'Jūsų sąveikos kodas',
        interactCodeReset: 'Perkurti sąveikos kodą',
        interactCodeInput: 'Draugo kodas',
        interactCodeInvalid: 'Niekas neturi tokio kodo.',
        interactAwardGroup: 'Apdovanoti grupę ({n})',
        interactAwardedGroup: 'Grupė apdovanota.',
        interactAwardNoGroup: 'Vartotojas neturi grupės.',
        stationBanner: 'Grupės priskirta veikla „{name}“',
        accountQrHint:
            'Jūsų asmeninis QR rodomas šone. Čia galite jį sukurti iš naujo (senasis nustos veikti).',
        accountQrReset: 'Iš naujo sukurti QR kodą',
        qrClaimed: 'Radote {amount} miciaus koinų!',
        qrErrorNotFound: 'Šis QR kodas neegzistuoja.',
        qrErrorExpired: 'Šis QR kodas nebegalioja.',
        qrErrorUsedUp: 'Šis QR kodas jau panaudotas.',
        qrErrorAlreadyClaimed: 'Jūs jau panaudojote šį QR kodą.',

        landingLangTitle: 'Kalba',
        landingLoginTitle: 'Sistema',
        landingCountdownTitle: 'Iki renginio',
        landingSocialTitle: 'Sekite mus čia!',
        landingSocialEvent: 'Renginys',
        landingFeedTitle: 'Veiklos',
        landingGoApp: 'Eiti',
        landingMain: 'Pagrindinis',
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
        queueTooSmall: 'Norint stoti į eilę, grupėje turi būti bent 2 nariai.',
        queueAtStation: 'Jūsų komanda dabar prie stotelės — užbaikite ją prieš vėl stodami į eilę.',
        queueAllDone: 'Jūsų komanda įveikė visas stoteles!',
        homeStationProgress: 'Veiklos',
        queueJoinFailed: 'Nepavyko stoti į eilę',
        queueLeaveFailed: 'Nepavyko palikti eilės',
        dashStandings: 'Tavo pozicijos',

        hostCount: 'Kiek grupių kviesti',
        hostRequest: 'Paimti iš eilės',
        hostAssign: 'Grupių priskirimas',
        hostAtStation: 'Veiklai priskirtos komandos',
        hostStationEmpty: 'Prie šios veiklos grupių nėra',
        hostPrevStation: 'Ankstesnė veikla',
        hostNextStation: 'Kita veikla',
        hostDone: 'Atlikta',
        hostAlreadyDone: 'jau atlikta',
        hostNextUp: 'Eilėje toliau',
        hostQueueEmpty: 'Eilė tuščia',
        hostRequestFailed: 'Nepavyko pakviesti grupių',
        hostDoneFailed: 'Nepavyko pažymėti grupės kaip atliktos',
        hostCall: 'Skambinti',

        dashSupport: 'Pagalba',
        dashCall: 'Skambinti pagalbai',

        shellSkip: 'Pereiti prie turinio',
        shellLogoAlt: 'pirmakursiu renginio pradžia',
        shellNavLabel: 'Pagrindinė navigacija',
        navTitle: 'Meniu',
        shellAlert: 'Pranešimas',
        dialogClose: 'Uždaryti',

        activityBack: '← atgal į veiklas',
        activityCompleted: '✓ Jūsų komanda įveikė šią stotelę',

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
        lbDisbanded: 'išformuota',
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
        youSaved: 'Nustatymai išsaugoti.',
        youQrReset: 'QR kodas atstatytas.',
        youUsernameTaken: 'Šis vartotojo vardas užimtas',
        youUsernameInvalid: `Varde gali būti 1–${MAX_USERNAME_LENGTH} mažųjų raidžių, skaičių, _ arba -`,

        adminPanelHead: 'administravimas',
        adminPanelTodo: 'TODO: administravimo skydelis.',

        dashGroup: 'Tavo grupė',
        groupNone: 'Nesate grupėje.',
        groupOwner: 'savininkas',
        groupKick: 'Išmesti',
        groupKickHint: 'Pašalinti {name} iš grupės',
        groupLeave: 'Išeiti',
        groupLeaveHint: 'Išeiti iš grupės',
        groupDisbandHint: 'Išformuoti grupę ir pašalinti visus narius',
        groupKickFailed: 'Nepavyko pašalinti nario',
        groupLeaveFailed: 'Nepavyko išeiti iš grupės',
        groupKicked: 'Narys išmestas.',
        groupDeleted: 'Grupė ištrinta.',
        groupLeft: 'Išėjote iš grupės.',
        groupName: 'Pavadinimas',
        groupPhone: 'Skubios pagalbos telefonas',
        groupSettings: 'Grupės nustatymai',
        groupSettingsEdit: 'Keičiami grupės nustatymai',
        groupSaved: 'Grupės nustatymai išsaugoti.',
        groupDisband: 'Išformuoti grupę',
        groupDisbandConfirm: 'Išformuoti grupę?',
        groupDisbandFailed: 'nepavyko išformuoti grupės',
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
        loginRateLimited: 'Prieš prašydami kito prisijungimo laiško, palaukite minutę.',
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
        gamblingChallenge: 'Siųsti iššūkį',
        gamblingPlayAgain: 'Žaisti dar kartą',
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
