import { createContext } from 'preact';
import { ReactNode } from 'preact/compat';
import { useState, useMemo, useEffect } from 'preact/hooks';
import { defaultLanguage, LanguageCode, translate, TranslateFn } from './language.js';
import { Page, RegisteredPageId, RegisteredPageProps, registeredPages } from './pages.js';
import { reviveUser, User, UserJson } from '#src/client/api/users.js';

export type ClientContextType = {
    lang: LanguageCode;
    updateLang: (lang: LanguageCode) => void;
    t: TranslateFn;
    user: User | null; // logged-in user, else null
    // personal QR shown in the sidebar — present only when logged in
    qr: { svg: string; url: string } | null;
};

export const ClientContext = createContext<ClientContextType>({
    lang: defaultLanguage,
    updateLang: () => {},
    t: translate(defaultLanguage),
    user: null,
    qr: null,
});

// ---

export type ClientContextWrapperInit = {
    lang: LanguageCode;
    user: UserJson | null;
    qr: { svg: string; url: string } | null;
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

    const value: ClientContextType = useMemo(
        () => ({
            lang,
            updateLang: (newLang) => setLang(newLang),
            t: translate(lang),
            user: init.user && reviveUser(init.user),
            qr: init.qr,
        }),
        [lang, init.user, init.qr],
    );

    useEffect(() => {
        const page = registeredPages[pageId] as Page<RegisteredPageProps<P>>;
        const title = page.title(value.t, pageProps, lang);
        document.title = title;
    }, [pageId, pageProps, value]);

    return <ClientContext value={value}>{content}</ClientContext>;
}
