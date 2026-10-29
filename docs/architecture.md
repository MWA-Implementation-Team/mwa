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
   `mwa-session` cookie and resolves it through the `sessions` table to a `users`
   row — see [auth](guides/auth.md).
3. **The route loads data.** It calls typed functions from `src/db/<domain>/index.ts` (e.g.
   `listUsers(ctx.var)`), which wrap prepared statements. The results become _page props_.
4. **`writePage` renders the page.** `writePage(ctx, 'landing', { users })` in
   `src/pages.tsx` builds `ctxInit = { lang, user, notification }` (lang from the
   `mwa-language` cookie, user from `currentUser`, notification from the database) and renders the `Root` component with
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
- **Client code must never do a runtime import of `src/db/*`** — these are server-only
  modules whose URLs are not served in production. Initialization is now explicit. `import type` is erased
  at compile time and is fine — that's the whole reason `src/client/api/users.ts`
  exists (see [add-an-api-endpoint](guides/add-an-api-endpoint.md)).

## Dev mode

`npm run dev` runs `dev.js`, which:

1. builds once, then spawns `node dist/main.js --dev` — the `--dev` flag sets
   `isDevMode` in `src/main.ts`, which passes it to the state factory;
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

`registeredActivities` in `src/client/activities.ts` plays the same role for activity
stations: `ActivitySlug` is derived from its keys, the `/app/activities/:slug` route
validates the param against it (unknown slug → 404), and `syncActivities(state)`
(`src/db/activities/index.ts`) inserts every slug into the `activities` table on server
start so queue/badge rows can foreign-key them.

## Interactions and gambling

The `PageShell` sidebar renders a personal QR using `uqr` on every page, linking
to `/app/interact/:token`.
Migration `05_interact_tokens.sql` stores one permanent random token per user;
it identifies the target but grants no permissions. Any signed-in scanner can
challenge another user; hosts/admins also see their email, balance, and join date.
Self-scans show no actions, and money transfers remain a placeholder.

`/app/gambling` replaces `/app/casino`, listing running games and the viewer's
invitations. `/app/interact/:token/gamble` creates a challenge; re-challenging the
same player while an invite is still open redirects to that session instead of
stacking invites. Session pages live at `/app/gambling/sessions/:id`, with POST
`/accept` and `/reject` actions restricted to the invited player. Any signed-in
user can view a session.

`src/db/gambling/index.ts` owns the lifecycle, persisted by `06_gambling.sql`:

- Creating a `pending` session deducts the challenger's positive integer stake.
- Acceptance checks funds, deducts the opponent's equal stake, and marks it `running`.
- Rejection or expiry marks it `rejected`/`expired` and deletes the challenger's
  deposit transaction (cascading to its child) to refund the stake.
- Coin flip chooses and stores a cryptographically random result at creation,
  hides it until settlement, then credits twice the stake to the winner and marks
  the session `ended`. Deductions and winnings have separate transaction kinds.

These balance/status changes are transactional. Invitations expire after five
minutes (`gamblingPendingExpiryMinutes`); accepted flips settle after five seconds.
`scheduleGamblingTimers` in `src/routes/pages/gambling.ts` restores timers on startup
from session/deposit timestamps. Coin flip is the only implemented game; chess,
Connect 4, and draw settlement are future work.

`src/pubsub.ts` provides in-process channels for SSE: `/api/notifications` sends
the user's current notification, and `/app/gambling/sessions/:id/watch` sends session
snapshots. Both send initial state on connection and updates after changes. The
client uses `EventSource`; the notification banner in `PageShell` prioritizes a
running game over the oldest invitation. Multiple games per player are allowed, but only one notification is
shown. Timers and pubsub assume a single server process.

## Leaderboard

`/app/leaderboard` is server-rendered: `src/routes/pages/app.ts` loads rows as page
props, so there is no leaderboard API. Two query params pick the view —
`?board=activity|gambling|combined` (default `activity`) and
`?scope=players|groups` (default `players`).

Every `child_transactions` row is stamped with the user's `group_id` at insert time
(`insertTransaction` looks it up via `findUserGroup`). Group scores therefore
attribute coins to the group the user belonged to when the delta was recorded:
switching groups never moves past earnings, and coins earned while groupless count
for no group.

Board definitions (`src/db/leaderboard/index.ts`):

- **activity** — coins minted into the economy: positive deltas whose parent kind
  is `system` or `host_grant` (an allowlist — transfers, purchases and gambling only
  move coins between players and never count, so transfer-gifting and gambling
  ping-pong can't inflate the board).
- **gambling** — net of `gambling_deduction` + `gambling_winnings`, plus a
  games-played count. Only users who actually gambled are listed.
- **combined** — net of every delta: the player's actual balance for users, the
  stamped net for groups.

Player boards only rank `role = 'user'` accounts — admins and hosts never appear.
Group boards rank every group by stamped score with member count. The page renders
a dense table: when a board lists more than 20 rows, the viewer's own standing is
pinned in a bold `mwa-lb-you` header row, their in-list row gets `mwa-lb--self`,
and their groupmates `mwa-lb--group` (on the groups board, `mwa-lb--self` marks
the viewer's group).
Zero-sum kinds (transfers, gambling) can't move net-based boards at all — collusion
shows up as coin concentration, not score inflation.
