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
const wrapped = <ClientContextWrapper
    pageId={data.pageId}
    pageProps={data.pageProps}
    init={data.init}
    content={content}
/>;
hydrate(wrapped, document.getElementById('app')!);
