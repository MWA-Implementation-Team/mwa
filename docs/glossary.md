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
`mwa-session` (auth), `mwa-language`, `mwa-theme-override`. Same-origin `fetch`
sends cookies automatically — that's why `client/api/*` fetchers need no auth code.

## Migration

A versioned SQL file in `migrations/` that changes the database schema. `migrate.ts`
applies pending files in numeric order on server start and records the highest applied
version in `migration_status`. Migrations only go forward — no automatic undo. CI
runs `scripts/check-migrations.sh` on migration PRs to keep filenames digit-prefixed,
versions strictly sequential (each new file is `highest + 1`), and existing files
append-only.

## Prepared statement

A SQL query compiled once with parameter placeholders (`?`) and executed many times —
faster, and parameters are bound safely instead of string-concatenated. Domain functions in
`db/<domain>/index.ts` accept `MwaState` and call `state.prepare(sql)` when invoked. Each state
caches statements by SQL string for reuse on its own connection.

## MwaState

The server dependencies defined in `src/state.ts`: the dev-mode flag, database,
mailer, and statement preparation cache. Factories create state explicitly;
`setupHonoState` exposes its fields as `ctx.var` in typed Hono handlers. Tests can
create independent states with in-memory databases and injected mailers.

## Context

Preact's mechanism for passing values deep into the component tree without threading
props through every level. The server also has Hono request contexts: `MwaContext`
is the app-specific type, with `MwaState` fields available through `ctx.var`. This
is separate from the Preact context passed to page components.

## Activity

An irl station at the event — something visitors queue for and complete. In code it's
a `registeredActivities` entry (`src/client/activities.ts`): a slug mapped to
`{ name, Card, text }`. The slug is its identity in the url
(`/activities/<slug>`) and as a row in the `activities` table, so queue/badge
records can reference it. A group completes an activity when a host marks
its queue visit done (see Queue entry); the public page then shows the
signed-in team a "completed" banner, and the home queue panel lists every
station with its ✓/— status.

## Registry

A compile-time-checked map of everything of a kind — `registeredPages` for pages,
`registeredActivities` for activities. Keys are string ids; `satisfies` plus derived
`keyof` types turn misconfiguration (a typo'd key, a missing field) into a `tsc`
error. Server code resolves entries at request time (the activities route) or syncs
them into a table at startup (`syncActivities` → `activities`).

## Interact token

A permanent, unguessable string identifying a user for the personal-QR flow — the
`<token>` in `/app/interact/<token>` (the legacy query form
`/app?interact=<token>` redirects there). Minted lazily by `getOrCreateInteractToken`
(`src/db/interactions/index.ts`) on the owner's first `/app` render and stored raw in
`interact_tokens` (like `system_qr_codes.secret`), because the QR needs the real
value every render. It identifies the target but authorizes nothing — the
scanner's session and role decide what they can do.

## Interact code

The human-typeable alias of an interact token — the 5-letter "sąveikos kodas"
shown in the sidebar pane under the QR (`code` column on `interact_tokens`,
migration 18). Minted lazily by `getOrCreateInteractCode` from a 23-letter
unambiguous alphabet (no I/L/O); QR rotation (`rotateInteractToken`) leaves it
alone. Typing it into the pane's field GETs `/app/interact?code=`, which
redirects to the token's `/app/interact/<token>` page. Unlike the token it's
guessable, but it still authorizes nothing — the scanner's session decides.

## Interaction

Something a scanner can do with the owner of an interact token — today just the
conditional content of `InteractPage` (`src/client/pages/app/InteractPage.tsx`).
Two route-computed flags split the audience: `canPlay` (both sides are plain
users) shows the play panels — send-money, gambling, join-team — and
`canAward` (host/admin scanner) shows the award-shaped send panel instead.
If interactions multiply, this can
graduate to a registry like `registeredActivities`.

## Queue entry

One row in `queue_entries` — a group's spot in the single event-wide queue
(`src/db/queue/index.ts`). The dashboard uses forms to join via
`POST /app/queue/join` and leave via `POST /app/queue/leave`, redirecting
back to `/app` with the updated position or a localized error.
Both actions use the caller's own group; any member may act. Joining needs
at least `QUEUE_MIN_GROUP_SIZE` (2) members — groups may drop below that
(members can always leave; only the owner can't), but an undersized group
can't queue and loses a held spot when the removal drops it below the
minimum. A group called to a station and not yet done there can't rejoin —
`joinQueue` reports `at_station` and the dashboard tells the team to finish
the station first.
Status is `waiting` while in line and stays on the row afterwards — `left` for
a bail, `called` when a host pulls the group to a station (`activity_slug`
records which one). A called group finishing its station is marked by
`done_at` rather than a new status — it drops out of `listStationGroups`, which
is what `/app/host` shows. Disbanding a group closes its queue entries the
same way — a waiting spot becomes `left`, and a called-not-done visit counts
as `left` too, never as a completion. Order is by row id, so a rejoined group lands at the
back and a partial unique index guarantees at most one waiting spot per group.
A `called` row with `done_at` set is the group's **completion** of that
station — `listGroupCompletions` reads those slugs, `callNextGroups` skips
waiting groups that already did the station they're being called to, and
`joinQueue` reports `all_done` once the group finished every registered
station. Marking done pays nothing; hosts award players by scan.
The dashboard shows the caller's 1-based position; hosts read `listWaitingQueue`
and call `callNextGroups` when a station frees up. Host actions use
POST forms at `/app/host/call` and `/app/host/done`, restricted to hosts and
admins. Both host tables show each group's phone number as a `tel:` link
next to its name (`phoneNumber` on `WaitingQueueRow`). Each redirects back
to the selected station with fresh queue data and localized errors.
