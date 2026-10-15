# Guide: add an API endpoint

Worked example: `GET /api/badges`, returning the badges list as JSON. This guide covers
the four pieces: the db function, the route, its registration, and a client-side
fetcher.

The pattern (from `src/routes/api/users.ts`): the SQL lives in `db/<domain>.ts` as a
prepared statement + typed function; the route handler only checks auth and serializes.

## 1. The db function

Write `listBadges(state: MwaState)` in `src/db/badges.ts` following the house pattern:
a row type and a typed function that calls `state.prepare(sql)` and executes the
returned statement. Preparation is cached per state; do not prepare at module scope. See `src/db/users.ts` for the
shape, and [change-the-database](change-the-database.md) if you need a new table first.

## 2. Add the route

Create `src/routes/api/badges.ts`:

```ts
import { requireApiUser } from '#src/auth.js';
import { listBadges } from '#src/db/badges.js';
import type { MwaHono } from '#src/state.js';

export function registerBadgesRoutes(app: MwaHono) {
    app.get('/api/badges', (ctx) => {
        const user = requireApiUser(ctx);
        if (user instanceof Response) return user;

        return ctx.json(listBadges(ctx.var));
    });
}
```

API routes return `401`/`403` JSON instead of redirecting — fetch calls can't
follow a login redirect usefully. `requireApiRole(ctx, 'host', 'admin')` is the
staff variant. See [auth](auth.md) for the guard list.

## 3. Register it in `src/main.ts`

Import `registerBadgesRoutes` and call it alongside the other `register*Routes` calls,
after `setupHonoState(app, state)`. The middleware exposes dependencies as `ctx.var`;
`MwaHono` gives handlers the matching context type.

## 4. Add a client fetcher

Create `src/client/api/badges.ts`:

```ts
import type { Badge } from '#src/db/badges.js';
// ^ type-only import: erased at compile time, so the browser never
// loads the server-only src/db/badges.ts module.

export type { Badge };

export async function fetchBadges(): Promise<Badge[]> {
    const res = await fetch('/api/badges');
    if (!res.ok) throw new Error(`GET /api/badges failed: ${res.status}`);
    return res.json();
}
```

Two things going on here:

- **`import type`, not `import`.** `db/*.ts` modules are server-only and their URLs
  are not served in production. Explicit initialization does not make them client code. Type-only imports are erased
  by `tsc`, so the emitted JS never references the module. Re-exporting the type keeps
  one source of truth for the API response shape.
- **Plain `fetch` sends the auth cookie.** Same-origin requests include cookies by
  default, so `mwa-session` rides along with no config.

## 5. Consume it

From any page component:

```ts
import { fetchBadges } from '#src/client/api/badges.js';
// ...
fetchBadges().then(setBadges, (e) => setError(e.message));
```

The full pattern — including when to fetch vs. pass props — is in
[load-data-in-a-page](load-data-in-a-page.md).

## How to verify

1. `npm run lint`.
2. `npm run dev`, then:
    - `curl -i http://localhost:3000/api/badges` → `401` and
      `{"error":"unauthorized"}`.
    - `curl -s -b cookies.txt http://localhost:3000/api/badges` → a JSON array
      containing `Scarab Hunter` (if you ran `npm run seed`). Mint `cookies.txt`
      through the verify flow in [auth](auth.md) — session cookies can't be
      forged.
3. In the browser while logged in: `fetch('/api/badges').then(r => r.json())` in the
   console returns the same array.
