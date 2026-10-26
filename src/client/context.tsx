import { createContext } from 'preact';
import { ReactNode } from 'preact/compat';
import { useState, useMemo, useEffect } from 'preact/hooks';
import { defaultLanguage, LanguageCode, translate, TranslateFn } from './language.js';
import { Page, RegisteredPageId, RegisteredPageProps, registeredPages } from './pages.js';
import { reviveUser, User, UserJson } from '#src/client/api/users.js';

import type { Notification } from '#src/db/users.js';
export type { Notification };

export type ClientContextType = {
    lang: LanguageCode;
    updateLang: (lang: LanguageCode) => void;
    t: TranslateFn;
    user: User | null; // logged-in user, else null
    notification: Notification | null;
};

export const ClientContext = createContext<ClientContextType>({
    lang: defaultLanguage,
    updateLang: () => {},
    t: translate(defaultLanguage),
    user: null,
    notification: null,
});

// ---

export type ClientContextWrapperInit = {
    lang: LanguageCode;
    user: UserJson | null;
    notification: Notification | null;
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
    let [notification, setNotification] = useState(init.notification);

    const value: ClientContextType = useMemo(
        () => ({
            lang,
            updateLang: (newLang) => setLang(newLang),
            t: translate(lang),
            user: init.user && reviveUser(init.user),
            notification,
        }),
        [lang, init.user, notification],
    );

    useEffect(() => {
        const page = registeredPages[pageId] as Page<RegisteredPageProps<P>>;
        if (page.customTitle) return;
        const title = page.title(value.t, pageProps, lang);
        document.title = title;
    }, [pageId, pageProps, value]);

    useEffect(() => {
        if (!init.user) return; // /api/notifications requires a session
        const updates = new EventSource('/api/notifications');
        updates.onmessage = (msg) => {
            setNotification(JSON.parse(msg.data as string));
        };
        return () => updates.close();
    }, [init.user?.id]);

    return <ClientContext value={value}>{content}</ClientContext>;
}
