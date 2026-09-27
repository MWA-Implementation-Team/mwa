import { createElement, hydrate } from 'preact';
import { ComponentType } from 'preact/compat';
import { registeredPages, RegisteredPageId } from '#src/client/pages.js';
import { ClientContextWrapper, ClientContextWrapperInit } from '#src/client/context.js';
import { ensureFakeLogin } from '#src/client/fakeAuth.js';

// Serialized by writePage() into the <script id="ssr-data"> tag.
type BootData = {
    pageId: RegisteredPageId;
    pageProps: unknown;
    init: ClientContextWrapperInit;
};

const data: BootData = JSON.parse(document.getElementById('ssr-data')!.textContent!);

// Write the fake auth cookie before hydrating — child effects
// (e.g. fetchUsers on HomePage) run before the wrapper's own
// useEffect, so doing it there would be too late.
ensureFakeLogin(data.init.fakeUsername);

const Component = registeredPages[data.pageId].Component as ComponentType<any>;
const content = createElement(Component, data.pageProps);
const wrapped = createElement(ClientContextWrapper as ComponentType<any>, {
    pageId: data.pageId,
    pageProps: data.pageProps,
    init: data.init,
    content,
});
hydrate(wrapped, document.getElementById('app')!);
