import { createElement, hydrate } from 'preact';
import { ComponentType } from 'preact/compat';
import { registeredPages, RegisteredPageId, RegisteredPageProps } from '#src/client/pages.js';
import { ClientContextWrapper, ClientContextWrapperInit } from '#src/client/context.js';

// Serialized by writePage() into the <script id="ssr-data"> tag.
export type BootData = {
    pageId: RegisteredPageId;
    pageProps: RegisteredPageProps<any>;
    init: ClientContextWrapperInit;
};

const data: BootData = JSON.parse(document.getElementById('ssr-data')!.textContent!);

const PageComponent = registeredPages[data.pageId].Component as ComponentType<any>;
const content = createElement(PageComponent, data.pageProps);
const wrapped = (
    <ClientContextWrapper
        pageId={data.pageId}
        pageProps={data.pageProps}
        init={data.init}
        content={content}
    />
);
hydrate(wrapped, document.getElementById('app')!);

// POST → 303 → GET lands on a *new* URL (changed query string), which
// browsers treat as a fresh document — scroll resets to the top. Save the
// position on every form submit and restore it when the same path loads back.
const scrollKey = `scroll:${location.pathname}`;
document.addEventListener('submit', () => {
    sessionStorage.setItem(scrollKey, String(window.scrollY));
});
window.addEventListener('load', () => {
    const saved = sessionStorage.getItem(scrollKey);
    sessionStorage.removeItem(scrollKey);
    if (saved === null || location.hash) return;
    try {
        // only after a self-referring POST, not a plain visit
        if (new URL(document.referrer).pathname !== location.pathname) return;
    } catch {
        return;
    }
    window.scrollTo(0, Number(saved));
});
