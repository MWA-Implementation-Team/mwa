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
