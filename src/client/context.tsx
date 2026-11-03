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
    // personal QR shown in the sidebar — present only when logged in
    qr: { svg: string; url: string } | null;
    notification: Notification | null;
};

export const ClientContext = createContext<ClientContextType>({
    lang: defaultLanguage,
    updateLang: () => {},
    t: translate(defaultLanguage),
    user: null,
    qr: null,
    notification: null,
});

// ---

export type ClientContextWrapperInit = {
    lang: LanguageCode;
    user: UserJson | null;
    qr: { svg: string; url: string } | null;
    notification: Notification | null;
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
