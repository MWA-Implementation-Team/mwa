# Spec: Host tools — call groups from the queue, mark done

Tracks issue #55's call/release half. Awarding points is deliberately out of
scope — it happens by hand via the personal QR scan flow in a later task.

## Objective

Hosts run activity stations at the event. When a station frees up, its host
needs a way to pull the next groups out of the event-wide queue and send them
to that station — and then mark them done when they finish so the station view
clears.

- **User:** logged-in users with `role` `host` or `admin`.
- **UI:** one new page, `/app/host` — no per-host station assignment, no admin
  page. Any host opens it, picks the station they're staffing from a dropdown,
  requests N groups, and later marks those groups done.
- **Matchmaking stays strict FIFO.** Hosts request a count; the next N waiting
  groups in line get assigned. Hosts never pick specific groups.

## Tech Stack

Hono + `node:sqlite` backend, Preact SSR pages hydrated via `#ssr-data`,
TypeScript, no bundler (native ESM + importmap). See `docs/architecture.md`.

## Commands

```shell
npm run dev                 # dev server on :3000
npm run lint                # typecheck (tsc --noEmit --noUnused*) + prettier check
npm test                    # build + node --test over dist/**/*.test.js
npm run check:migrations    # migration numbering/immutability check
```

## Project Structure

```
migrations/06_queue.sql      done_at column folded into the queue schema
src/db/queue.ts              extend with mark-done + station queries
src/routes/api/host.ts       new — host-only JSON endpoints
src/routes/pages/app.ts      register GET /app/host
src/client/pages/app/HostPage.tsx   new page component
src/client/api/host.ts       new — fetch wrappers (import type only from db/*)
src/client/ui/Header.tsx     drawer link, role-gated like /admin
src/client/language.ts       en + lt keys
static/style/pages/          host page styles
docs/glossary.md             update Queue entry for done_at lifecycle
```

## Code Style

Follow the existing house pattern — prepared statements inside functions
(`state.prepare(...)`), `requireApiRole` guards returning `User | Response`,
handlers that end in `ctx.json(...)`, and client fetchers that throw on
`!res.ok`. Reference shape:

```ts
app.post('/api/host/call', async (ctx) => {
    const user = requireApiRole(ctx, 'host', 'admin');
    if (user instanceof Response) return user;
    // validate body, act, ctx.json(result)
});
```

Commits: short, lowercase, imperative; one concern per commit. No agent
trailers. Branch: `feature/host-tools` — contains the queue work locally;
the remote `feature/queue` branch was deleted and nothing is pushed until
the owner decides.

## Schema

`done_at TEXT` on `queue_entries` — folded into `06_queue.sql` directly since
the queue migration isn't merged anywhere yet. Status semantics: `waiting`
(in line) → `called` (at station, `activity_slug` + `closed_at` set) →
`called` with `done_at` set (finished). `left` is unchanged (bailed while
waiting).

## Testing Strategy

`node:test`, in-memory db via `createTestMwaState({})`, `beforeEach` clearing
`queue_entries` — same harness as `src/db/queue.test.ts`.

- `src/db/queue.test.ts` — extend: mark-done transitions, done groups drop out
  of the station list, calling more groups while others sit 'called' is allowed
  (no busy-state gating).
- `src/routes/api/host.test.ts` — new: 401 logged-out, 403 regular user,
  call validates slug/count, done flips the row.

## Boundaries

- **Always:** `npm run lint` + `npm test` green before committing; en AND lt
  keys added together; docs updated in the same PR.
- **Ask first:** touching `migrations/06_queue.sql` (in review), changing the
  FIFO-only matchmaking rule, adding host↔station assignments later.
- **Never:** delete queue rows (history stays), let hosts pick specific groups,
  ship en-only translations.

## Success Criteria

- `GET /app/host` renders for host/admin, 403s for `user`, redirects anonymous
  to login.
- Dropdown lists every registered activity; requesting N calls the next N
  waiting groups (or fewer if the line is short) and marks them `called` with
  the selected `activity_slug`.
- The page lists called-not-done groups for the selected station with a done
  button; marking done sets `done_at` and removes them from that list.
- Queue positions on `/app` are unaffected by called/done rows.
- `npm run lint`, `npm test`, `npm run check:migrations` all green.

## Decisions

1. The dropdown selects the **activity/station** the host is staffing;
   matchmaking stays strict FIFO — hosts never pick specific groups.
2. `done_at` lives in `06_queue.sql` — both migrations were unmerged branch
   work, so they're folded into one file.
3. The nav link goes in the drawer menu next to the admin link, gated to
   host/admin.

```

```
