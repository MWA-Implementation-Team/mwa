import { createContext } from 'preact';
import { ReactNode } from 'preact/compat';
import { useState, useMemo, useEffect } from 'preact/hooks';
import { defaultLanguage, LanguageCode, translate, TranslateFn } from './language.js';
import { Page, RegisteredPageId, RegisteredPageProps, registeredPages } from './pages.js';
import { ensureFakeLogin } from './fakeAuth.js';

export type ClientContextType = {
    lang: LanguageCode;
    updateLang: (lang: LanguageCode) => void;
    t: TranslateFn;
    username: string | null; // username if logged in, else null
};

export const ClientContext = createContext<ClientContextType>({
    lang: defaultLanguage,
    updateLang: () => {},
    t: translate(defaultLanguage),
    username: null,
});

// ---

export type ClientContextWrapperInit = {
    lang: LanguageCode;
    username: string | null;
    fakeUsername: string;
};

export type ClientContextWrapperProps<P extends RegisteredPageId> = {
    pageId: P;
    pageProps: RegisteredPageProps<P>;

    init: ClientContextWrapperInit;
    content: ReactNode;
};

export function ClientContextWrapper<P extends RegisteredPageId>({
    pageId,
    pageProps,
    init,
    content,
}: ClientContextWrapperProps<P>) {
    let [lang, setLang] = useState(init.lang);
    let [username, setUsername] = useState(init.username);

    useEffect(() => {
        setUsername(ensureFakeLogin(init.fakeUsername));
    }, []);

    const value: ClientContextType = useMemo(
        () => ({
            lang,
            updateLang: (newLang) => setLang(newLang),
            t: translate(lang),
            username,
        }),
        [lang, username],
    );

    useEffect(() => {
        const page = registeredPages[pageId] as Page<RegisteredPageProps<P>>;
        const title = page.title(value.t, pageProps, lang);
        document.title = title;
    }, [pageId, pageProps, value]);

    return <ClientContext value={value}>{content}</ClientContext>;
}
