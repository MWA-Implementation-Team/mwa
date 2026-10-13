# Guide: add an API endpoint

Worked example: `GET /api/badges`, returning the badges list as JSON. This guide covers
the four pieces: the db function, the route, its registration, and a client-side
fetcher.

The pattern (from `src/routes/api/users.ts`): the SQL lives in `db/<domain>.ts` as a
prepared statement + typed function; the route handler only checks auth and serializes.

## 1. The db function

Write `listBadges()` in `src/db/badges.ts` following the house pattern — a row type, a
prepared statement, and a typed function that wraps it. See `src/db/users.ts` for the
shape, and [change-the-database](change-the-database.md) if you need a new table first.

## 2. Add the route

Create `src/routes/api/badges.ts`:

```ts
import { currentUser } from '#src/auth.js';
import { listBadges } from '#src/db/badges.js';
import { Hono } from 'hono';

export function registerBadgesRoutes(app: Hono) {
    app.get('/api/badges', (ctx) => {
        if (!currentUser(ctx)) {
            return ctx.json({ error: 'unauthorized' }, 401);
        }

        return ctx.json(listBadges());
    });
}
```

API routes return `401` JSON when logged out (page routes redirect to `/login`
instead — see [auth-in-dev](auth-in-dev.md)).

## 3. Register it in `src/main.ts`

Import `registerBadgesRoutes` and call it alongside the other `register*Routes` calls.

## 4. Add a client fetcher

Create `src/client/api/badges.ts`:

```ts
import type { Badge } from '#src/db/badges.js';
// ^ type-only import: erased at compile time, so the browser never
// loads src/db/badges.ts (it opens the database on import).

export type { Badge };

export async function fetchBadges(): Promise<Badge[]> {
    const res = await fetch('/api/badges');
    if (!res.ok) throw new Error(`GET /api/badges failed: ${res.status}`);
    return res.json();
}
```

Two things going on here:

- **`import type`, not `import`.** `db/*.ts` modules open `db.sqlite` the moment they're
  imported — fine on the server, impossible in the browser. Type-only imports are erased
  by `tsc`, so the emitted JS never references the module. Re-exporting the type keeps
  one source of truth for the API response shape.
- **Plain `fetch` sends the auth cookie.** Same-origin requests include cookies by
  default, so `mwa-username` rides along with no config.

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
    - `curl -s -b 'mwa-username=alice' http://localhost:3000/api/badges` → a JSON array
      containing `Scarab Hunter` (if you ran `npm run seed`). Setting the cookie by hand
      works because dev auth is just the username in a cookie.
3. In the browser while logged in: `fetch('/api/badges').then(r => r.json())` in the
   console returns the same array.
