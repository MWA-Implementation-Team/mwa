# Guide: load data in a page

Server data reaches a page through:

- **SSR props** — the route queries the db and passes data to `writePage`, which puts it
  in the HTML _and_ the `#ssr-data` JSON.
- **Client fetch** — the page calls an `/api/*` endpoint from the browser (see
  [add-an-api-endpoint](add-an-api-endpoint.md)).
- **SSE** — `EventSource` receives snapshots after the initial render; gambling
  sessions and the `PageShell` notification banner use this (see [architecture](../architecture.md#interactions-and-gambling)).

These populate Preact props or state. The difference is _when_ the data arrives and
_who pays_ the loading state.

## Decision rule

**Use SSR props when** the data is needed for the first render. The user sees real
content immediately — no spinner, no layout jump — and the HTML works even with JS
disabled. This is the default.

**Use client fetch when** the data changes after load (refresh button, live updates),
is expensive and rarely viewed (defer the cost), or depends on a browser-only input.

**Use both** when the data is needed up front _and_ refreshable — the hybrid pattern
below.

**Props constraint:** everything in `pageProps` is serialized into the `#ssr-data`
script tag, so it must be JSON-serializable (no functions, Dates become strings,
`undefined` fields are dropped) and it will be visible in "view source" — never put
secrets in props.

## Option A — SSR props

Continuing the [badges example](add-a-page.md). In `src/routes/pages/app.ts`, the app is typed as `MwaHono` and state middleware is
already registered by `main.ts`. Pass `ctx.var` to DB functions:

```ts
import { listBadges } from '#src/db/badges.js';
// ...
app.get('/app/badges', async (ctx) => {
    const user = requireUser(ctx);
    if (user instanceof Response) return user;

    return writePage(ctx, 'badges', { badges: listBadges(ctx.var) });
});
```

In `src/client/pages/app/BadgesPage.tsx`:

```tsx
import PageShell from '#src/client/pages/app/PageShell.js';
import { Page } from '#src/client/pages.js';
import { Badge } from '#src/client/api/badges.js';

type BadgesPageProps = {
    badges: Badge[];
};

export const badgesPage: Page<BadgesPageProps> = {
    Component: BadgesPage,
    title: (t) => t('titleBadges'),
};

function BadgesPage({ badges }: BadgesPageProps) {
    return (
        <PageShell section="badges">
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>Badges</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <ul class="mwa-wiki-rows">
                        {badges.map((b) => (
                            <li key={b.id} class="mwa-wiki-row">
                                {b.title} — {b.description}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </PageShell>
    );
}
```

Note the `Badge` type comes from `src/client/api/badges.ts`, not `src/db/badges.ts` —
always reach for the type through the `client/api/` re-export so client code never
runtime-imports a db module.

The route decides _what_ the page gets — it's where auth-based variation belongs.
`src/routes/pages/landing.ts` passes `users` or `null` depending on `currentUser`, and the
component renders accordingly.

## Option B — client fetch

Keep props empty, fetch in the component:

```tsx
import { useState, useEffect } from 'preact/hooks';
import { fetchBadges, Badge } from '#src/client/api/badges.js';

function BadgesPage() {
    const [badges, setBadges] = useState<Badge[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBadges().then(setBadges, (e) => setError(e.message));
    }, []);

    if (error) return <p class="error-message">{error}</p>;
    if (!badges) return <p>Loading…</p>;
    // ...render badges
}
```

You own the loading and error states — that's the cost of this option.

## Option C — the hybrid (recommended for refreshable data)

`src/client/pages/LandingPage.tsx` shows the pattern: feed the SSR prop into `useState`,
then refresh the state by calling the fetcher again (`refreshUsers`).

First paint shows real data, and a **Refresh** button re-fetches without a page load —
no loading state needed on mount because the prop already contains data.

## How to verify

1. `npm run lint`.
2. Props path: `curl -s -b cookies.txt http://localhost:3000/app/badges` (mint
   `cookies.txt` via [auth](auth.md)) — the `<li>` elements are already in the
   HTML, and the badge data also appears inside `<script id="ssr-data">`. That's
   proof SSR and hydration render identically.
3. Fetch path: open the browser's Network tab, trigger the fetch (page load or button),
   see `GET /api/badges` return `200` with JSON.
4. Fetch path, logged out: the endpoint returns `401`; the page shows your error state
   rather than crashing.
