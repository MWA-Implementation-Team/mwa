import { Page, RegisteredPageId, RegisteredPageProps, registeredPages } from '#src/client/pages.js';
import { currentUser } from '#src/auth.js';
import { fakeUsername, isDevMode } from '#src/state.js';
import { ClientContextWrapper, ClientContextWrapperInit } from '#src/client/context.js';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { renderToString } from 'preact-render-to-string';
import { cookieLanguage, cookieThemeOverride } from './client/constants.js';
import { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { defaultLanguage, LanguageCode, translate } from './client/language.js';
import { StatusCode } from 'hono/utils/http-status';

export function writePage<P extends RegisteredPageId>(
    ctx: Context,
    id: P,
    props: RegisteredPageProps<P>,
): Response {
    const ctxInit: ClientContextWrapperInit = {
        lang: (getCookie(ctx, cookieLanguage) as LanguageCode) ?? defaultLanguage, // not validated
        user: currentUser(ctx),
        fakeUsername,
    };

    const root = Root({
        pageId: id,
        pageProps: props,
        ctxInit,
        themeOverride: getCookie(ctx, cookieThemeOverride) ?? null,
    });

    return ctx.html('<!DOCTYPE html>' + renderToString(root));
}

export function writeErrorPage(ctx: Context, status: StatusCode): Response {
    ctx.status(status);
    return writePage(ctx, 'error', { status });
}

export function registerNodeModulesRoutes(app: Hono) {
    app.get(
        '/preact.module.js',
        serveStatic({ path: 'node_modules/preact/dist/preact.module.js' }),
    );

    app.get(
        '/preact-hooks.module.js',
        serveStatic({ path: 'node_modules/preact/hooks/dist/hooks.module.js' }),
    );

    app.get(
        '/preact-jsx-runtime.module.js',
        serveStatic({ path: 'node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js' }),
    );
}

type RootProps<P extends RegisteredPageId> = {
    pageId: RegisteredPageId;
    pageProps: RegisteredPageProps<P>;
    ctxInit: ClientContextWrapperInit;
    themeOverride: string | null;
};

export function Root<P extends RegisteredPageId>({
    pageId,
    pageProps,
    ctxInit,
    themeOverride,
}: RootProps<P>) {
    // Instead of using a bundler, use the browser's native js module support for simplicity
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap
    const importmap = {
        imports: {
            '#src/': '/',
            preact: '/preact.module.js',
            'preact/hooks': '/preact-hooks.module.js',
            'preact/jsx-runtime': '/preact-jsx-runtime.module.js',
        },
    };

    // Hydration data is delivered as JSON inside a script tag and
    // read back by src/client/bootstrap.ts. Escape '<' so a value
    // containing '</script>' can't break out of the tag.
    const ssrData = JSON.stringify({ pageId, pageProps, init: ctxInit }).replace(/</g, '\\u003c');

    const page = registeredPages[pageId] as Page<RegisteredPageProps<P>>;

    const title = page.title(translate(ctxInit.lang), pageProps, ctxInit.lang);

    let bodyStyle = undefined;
    if (themeOverride) {
        bodyStyle = `color-scheme: ${themeOverride === 'dark' ? 'dark' : 'light'};`;
    }

    return (
        <html>
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{title}</title>
                <script
                    type="importmap"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(importmap) }}
                />
                <script
                    id="ssr-data"
                    type="application/json"
                    dangerouslySetInnerHTML={{ __html: ssrData }}
                />
                <script type="module" src="/client/bootstrap.js" />
                <link rel="stylesheet" href="/oat.css" />
                <link rel="stylesheet" href="/style/main.css" />
                <script src="/oat.js" defer />
                {isDevMode && <script src="/reload.js" defer />}
            </head>
            <body style={bodyStyle}>
                <div id="app">
                    <ClientContextWrapper
                        pageId={pageId}
                        pageProps={pageProps}
                        init={ctxInit}
                        content={<page.Component {...(pageProps as any)} />}
                    />
                </div>
            </body>
        </html>
    );
}
