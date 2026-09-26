export type LanguageCode = 'en' | 'lt';

export const defaultLanguage: LanguageCode = 'en';

export type Language = {
    displayName: string;

    titleHome: string;
    titleLogin: string;
    titleApp: string;
    titleCasino: string;
    titleError: string;

    headerHome: string;
    headerLogin: string;
    headerApp: string;

    appWelcome: string;
};

export const languages: Record<LanguageCode, Language> = {
    en: {
        displayName: 'English',

        titleHome: 'MWA | Home',
        titleLogin: 'MWA | Login',
        titleApp: 'MWA | App',
        titleCasino: 'MWA | Casino',
        titleError: 'MWA | {status}',

        headerHome: 'Home',
        headerLogin: 'Login',
        headerApp: 'App',

        appWelcome: 'Welcome back, {name}',
    },
    lt: {
        displayName: 'Lietuvių',

        titleHome: 'MWA | Pradžia',
        titleLogin: 'MWA | Prisijungimas',
        titleApp: 'MWA | Programa',
        titleCasino: 'MWA | Kazino',
        titleError: 'MWA | {status}',

        headerHome: 'Pradžia',
        headerLogin: 'Prisijungimas',
        headerApp: 'Programa',

        appWelcome: 'Sveiki sugrįžę, {name}',
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
