# Glossary

Terms used in these docs and in code comments.

## Hydration

Taking server-rendered HTML and attaching interactivity (event handlers, state) to it in
the browser, without re-rendering the DOM. Here: `src/client/bootstrap.tsx` calls
Preact's `hydrate()` on `<div id="app">`, so the HTML from `writePage` becomes a live
app. Hydration requires the client render to match the server render — which is why the
page's props are serialized into `#ssr-data` rather than re-fetched.

## SSR (server-side rendering)

Rendering a page component to an HTML string on the server for each request, so the
browser receives real content instead of an empty shell. Done by
`renderToString` in `writePage` (`src/pages.tsx`). Compare _client-side rendering_,
where the browser builds all the DOM from JS.

## Importmap

A `<script type="importmap">` tag that tells the browser how to resolve bare/module
import specifiers to URLs — native browser behavior, no bundler. `Root` (`src/pages.tsx`)
emits one mapping `#src/` → `/` and `preact` → `/preact.module.js` (served from
`node_modules` by `registerNodeModulesRoutes`). It's what lets `import ... from
'#src/client/pages.js'` work in the browser exactly as it does under `tsc`/Node.

## Prop

Short for "property" — an input passed to a component. `Page<P>` components receive
their `P` from the route via `writePage(ctx, id, props)`; the same props are rendered
into HTML on the server and serialized into `#ssr-data` for hydration, so they must be
JSON-serializable.

## Cookie

A small key/value the server asks the browser to store and send back on every request to
the same origin. This app uses three (names in `src/client/constants.ts`):
`mwa-username` (dev auth), `mwa-language`, `mwa-theme-override`. Same-origin `fetch`
sends cookies automatically — that's why `client/api/*` fetchers need no auth code.

## Migration

A versioned SQL file in `migrations/` that changes the database schema. `migrate.ts`
applies pending files in numeric order on server start and records the highest applied
version in `migration_status`. Migrations only go forward — no automatic undo.

## Prepared statement

A SQL query compiled once with parameter placeholders (`?`) and executed many times —
faster, and parameters are bound safely instead of string-concatenated. Every `db/*.ts`
module prepares its queries at module load (`database.prepare(...)`) and exports typed
functions around them.

## Context

Preact's mechanism for passing values deep into the component tree without threading
props through every level.

## Activity

An irl station at the event — something visitors queue for and complete. In code it's
a `registeredActivities` entry (`src/client/activities.ts`): a slug mapped to
`{ name, Card, Detail }`. The slug is its identity in the url
(`/app/activities/<slug>`) and as a row in the `activities` table, so queue/badge
records can reference it.

## Registry

A compile-time-checked map of everything of a kind — `registeredPages` for pages,
`registeredActivities` for activities. Keys are string ids; `satisfies` plus derived
`keyof` types turn misconfiguration (a typo'd key, a missing field) into a `tsc`
error. Server code resolves entries at request time (the activities route) or syncs
them into a table at startup (`syncActivities` → `activities`).
