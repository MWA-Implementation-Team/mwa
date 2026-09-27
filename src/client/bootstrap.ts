import { createElement, hydrate } from 'preact';
import { ComponentType } from 'preact/compat';
import { registeredPages, RegisteredPageId } from '#src/client/pages.js';
import { ClientContextWrapper, ClientContextWrapperInit } from '#src/client/context.js';

// Serialized by writePage() into the <script id="ssr-data"> tag.
type BootData = {
    pageId: RegisteredPageId;
    pageProps: unknown;
    init: ClientContextWrapperInit;
};

const data: BootData = JSON.parse(document.getElementById('ssr-data')!.textContent!);

const Component = registeredPages[data.pageId].Component as ComponentType<any>;
const content = createElement(Component, data.pageProps);
const wrapped = createElement(ClientContextWrapper as ComponentType<any>, {
    pageId: data.pageId,
    pageProps: data.pageProps,
    init: data.init,
    content,
});
hydrate(wrapped, document.getElementById('app')!);
