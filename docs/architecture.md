# Architecture

> **Audience: experienced readers.** This doc explains how the internals work, end to
> end — read it only if you want deep understanding of the machinery. Everything in
> `guides/` is self-contained and doesn't require it.

How a request travels through this app, end to end. Read this once and every file in
`src/` will make sense.

The stack is [Hono](https://hono.dev) on the server, [Preact](https://preactjs.com) for
UI, and SQLite via `node:sqlite`. There is **no bundler**: the server renders HTML to a
string, the browser loads the _same_ compiled modules through an
[importmap](glossary.md#importmap), then Preact hydrates the markup it received.

## The request lifecycle

Follow `GET /` through the code:

1. **Hono matches a route.** `src/main.ts` creates the app and calls the
   `register*Routes` functions. `/` lives in `src/routes/pages/landing.ts`.
2. **The route resolves the user.** `currentUser(ctx)` (`src/auth.ts`) reads the
   `mwa-username` cookie and looks the username up in the `users` table. This is
   dev-only cookie auth — see [auth-in-dev](guides/auth-in-dev.md).
3. **The route loads data.** It calls typed functions from `src/db/*.ts` (e.g.
   `listUsers()`), which wrap prepared statements. The results become _page props_.
4. **`writePage` renders the page.** `writePage(ctx, 'landing', { users })` in
   `src/pages.tsx` builds `ctxInit = { lang, user }` (lang from the `mwa-language`
   cookie, user from `currentUser`) and renders the `Root` component with
   `preact-render-to-string`.
5. **`Root` emits the document shell** (`src/pages.tsx`). The `<head>` contains:
    - the importmap (explained below),
    - `<script id="ssr-data" type="application/json">` — JSON
      `{ pageId, pageProps, init }` that carries everything hydration needs. `<`
      characters are escaped so a prop containing `</script>` can't break out of the
      tag,
    - `<script type="module" src="/client/bootstrap.js">`,
    - stylesheets (`/oat.css`, `/style/main.css`), `/oat.js`, and in dev mode
      `/reload.js`.

    The `<body>` is a `<div id="app">` containing the server-rendered
    `ClientContextWrapper` wrapping the page component — real HTML, not a placeholder.

6. **The browser boots.** `/client/bootstrap.js` is served out of `dist/` by
   `app.use('/client/*', serveStatic({ root: './dist' }))` in `main.ts`.
   `src/client/bootstrap.tsx` parses `#ssr-data`, looks up
   `registeredPages[data.pageId].Component`, and calls `hydrate()` on `#app`.
7. **Hydration.** Preact attaches event handlers and state to the DOM the server
   already sent — no re-render, no flash. Then effects run: `ClientContextWrapper`
   (`src/client/context.tsx`) sets `document.title` from the page's `title()` so the
   tab title tracks language changes.

## The `#src/` trick (how there's no bundler)

Imports in `src/` look like `import { currentUser } from '#src/auth.js'`. One specifier
works in three different environments:

- **TypeScript** resolves `#src/*` via `tsconfig.json` `paths` → `./src/*`.
- **Node** resolves `#src/*` via `package.json` `imports` → `./dist/*` (the compiled
  output — `tsc` leaves the specifier untouched).
- **The browser** resolves `#src/` via the importmap to `/`, and `main.ts` serves
  `dist/` — so `#src/client/pages.js` becomes `/client/pages.js`, i.e.
  `dist/client/pages.js`.

Two consequences:

- Imports always use `#src/...` with a `.js` extension (NodeNext resolution requires
  the extension; it refers to the _compiled_ file).
- **Client code must never do a runtime import of `src/db/*`** — those modules open
  the database on import, and the URL wouldn't resolve anyway. `import type` is erased
  at compile time and is fine — that's the whole reason `src/client/api/users.ts`
  exists (see [add-an-api-endpoint](guides/add-an-api-endpoint.md)).

## Dev mode

`npm run dev` runs `dev.js`, which:

1. builds once, then spawns `node dist/main.js --dev` — the `--dev` flag sets
   `isDevMode` in `src/state.ts`;
2. runs `tsc --watch`; when `dist/` changes, it restarts the server and broadcasts
   `refresh` over a Server-Sent Events endpoint on port **3001**;
3. `static/reload.js` (only included in dev mode, see `Root`) listens on
   `http://localhost:3001/watch` and reloads the tab;
4. changes in `static/` broadcast a reload without restarting the server.

In dev mode, `main.ts` also serves the whole repo root as static files (so sourcemaps
and sources resolve). In production it only serves `static/` and `dist/`, and refuses
`.js.map` requests.

## Errors and 404s

`app.notFound` and `app.onError` in `main.ts` both call `writeErrorPage(ctx, status)`,
which renders the `error` page through the same `writePage` pipeline — error pages are
real SSR pages with real hydration, not special-cased HTML.

## Type flow

`registeredPages` in `src/client/pages.ts` is the single source of truth for pages.
`RegisteredPageId` is derived from its keys and `RegisteredPageProps` from each page's
component, so `writePage(ctx, 'badges', { badges })` is fully typechecked — wrong or
missing props are a compile error caught by `npm run lint`, not a runtime surprise.
