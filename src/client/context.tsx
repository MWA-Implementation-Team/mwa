import { createContext } from 'preact';
import { ReactNode } from 'preact/compat';
import { useState, useMemo, useEffect } from 'preact/hooks';
import { defaultLanguage, LanguageCode, translate, TranslateFn } from './language.js';
import { RegisteredPageId, RegisteredPageProps } from './pages.js';
import { reviveUser, User, UserJson } from '#src/client/api/users.js';
import { Toasts } from './ui/Toast.js';

import type { Notification } from '#src/db/users/index.js';
export type { Notification };

export type ClientContextType = {
    lang: LanguageCode;
    updateLang: (lang: LanguageCode) => void;
    t: TranslateFn;
    user: User | null; // logged-in user, else null
    // personal QR + typed "sąveikos kodas" shown in the sidebar — logged in only
    qr: { svg: string; url: string; code: string } | null;
    notification: Notification | null;
    // station the user's group is called to — drives the fixed PageShell
    // banner (links to the activity page when slug is set); null when not
    // at a station
    atStation: { name: string; slug: string | null } | null;
};

export const ClientContext = createContext<ClientContextType>({
    lang: defaultLanguage,
    updateLang: () => {},
    t: translate(defaultLanguage),
    user: null,
    qr: null,
    notification: null,
    atStation: null,
});

// ---

export type ClientContextWrapperInit = {
    lang: LanguageCode;
    user: UserJson | null;
    qr: { svg: string; url: string; code: string } | null;
    notification: Notification | null;
    atStation: { name: string; slug: string | null } | null;
};

export type ClientContextWrapperProps<P extends RegisteredPageId> = {
    pageId: P;
    pageProps: RegisteredPageProps<P>;

    init: ClientContextWrapperInit;
    content: ReactNode;
};

export function ClientContextWrapper<P extends RegisteredPageId>({
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
            qr: init.qr,
            notification,
            atStation: init.atStation,
        }),
        [lang, init.user, init.qr, notification],
    );

    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    useEffect(() => {
        document.title = value.t('titleApp');
    }, [value.t]);

    useEffect(() => {
        if (!init.user) return; // /api/notifications requires a session
        const updates = new EventSource('/api/notifications');
        updates.onmessage = (event) => setNotification(JSON.parse(event.data));
        updates.addEventListener('session-ended', () => {
            updates.close();
            window.location.reload();
        });
        return () => updates.close();
    }, [init.user?.id]);

    return (
        <ClientContext value={value}>
            {content}
            <Toasts />
        </ClientContext>
    );
}
