# Spec: role-gates

Module of the [authorization capability map](CAPABILITY-MAP.md).
Depends on: [sessions](SPEC-sessions.md) (provides `currentUser` → `User` with
`role`).

## Objective

Centralize authorization: today `/admin` hand-checks `user.role !== 'admin'` and
every `/app/*` route hand-checks `currentUser(ctx)`. This module replaces every
inline check with two route guards — `requireUser` (any logged-in user) and
`requireRole('admin' | 'host')` — so the answer to "who can hit this route" lives in
one place per route and can't drift.

User stories:

- As a logged-out visitor, any `/app/*` or `/admin` page redirects me to
  `/login?goto=…` (unchanged behavior).
- As a `user`, `/admin` gives me a 403 error page instead of content.
- As a developer, adding a protected route is one wrapper call, not a copy-pasted
  if-statement.

## Tech Stack

Hono middleware/handlers, existing `writeErrorPage(ctx, 403)` for pages, JSON errors
for API routes. No new dependencies.

## Commands

```
Build: npm run build
Test:  npm test   (node:test — introduced by accounts module)
Lint:  npm run lint
Dev:   npm run dev
```

## Project Structure

```
src/auth.ts            + requireUser(), requireRole() guards
src/routes/pages/app.ts      inline checks → requireUser
src/routes/pages/admin.ts    inline checks → requireRole('admin')
src/routes/pages/login.ts    signup link added to login page if not already (accounts)
src/routes/api/users.ts      inline check → guard (see Route policy)
docs/guides/auth.md          document the guard API + route policy table
docs/guides/add-a-page.md    update "protect your page" section to use guards
docs/guides/add-an-api-endpoint.md  same for API routes
```

## API

```ts
// Page routes: anonymous → redirect to /login?goto=…; wrong role → 403 page.
// Returns the User (non-null) so handlers stop re-checking.
requireUser(ctx): User | Response        // redirect
requireRole(ctx, 'admin'): User | Response  // redirect or 403

// Usage stays handler-style, matching current code shape:
app.get('/admin', async (ctx) => {
    const user = requireRole(ctx, 'admin');
    if (user instanceof Response) return user;
    return writePage(ctx, 'admin', {});
});
```

API variant: `requireApiUser` / `requireApiRole` return `ctx.json({ error: … }, 401 | 403)`
instead of redirect/error-page — preserving today's contract that fetch calls get
JSON, not HTML.

## Route policy

| Route                                                  | Guard                  | Change from today                                                |
| ------------------------------------------------------ | ---------------------- | ---------------------------------------------------------------- |
| `GET /` (landing), `/login`, `/signup`, `/auth/verify` | none (public)          | —                                                                |
| `GET /app`, `/app/*`                                   | `requireUser`          | none — same behavior                                             |
| `POST /app` (logout)                                   | `requireUser`          | was: unconditional logout                                        |
| `GET /admin`                                           | `requireRole('admin')` | none — same behavior                                             |
| `GET /api/users`                                       | `requireApiUser`       | none — any logged-in user; endpoint is slated for removal anyway |

No `host`-only routes exist yet; when one does it's `requireRole(ctx, 'host', 'admin')`
— the guard is variadic: caller lists every allowed role explicitly, no hidden
role hierarchy.

## Testing Strategy

`node:test` (setup from accounts). Tests: guard returns `User` for allowed roles,
redirect for anonymous on pages, 403 page for wrong role, 401/403 JSON on API
routes, and that `/api/users` policy change is intentional (test pins it).

## Boundaries

- Always: every non-public route goes through a guard — no new inline
  `currentUser` checks outside `src/auth.ts`.
- Ask first: changing the route policy table (e.g. giving `host` access to a page,
  making an API endpoint public).
- Never: return different error shapes between guards and the rest of the app;
  embed role checks inside page components (guards run at the route).

## Success Criteria

- [ ] `src/auth.ts` is the only file that calls `currentUser`; grepping routes for
      `currentUser(` finds nothing.
- [ ] Behaviors that didn't intentionally change are identical: logged-out `/app/*`
      → login redirect, `user` on `/admin` → 403, anonymous API → 401 JSON.
- [ ] `npm test` + `npm run lint` pass.
- [ ] `docs/guides/add-a-page.md` and `add-an-api-endpoint.md` show the guard
      pattern; `auth.md` documents the route policy table.

## Open Questions

Resolved: `/api/users` keeps "any logged-in user" — it's being removed later, so
no point tightening it now. Guard signature is **variadic** —
`requireRole(ctx, 'host', 'admin')` — the caller lists every allowed role; there's
no implicit `admin ≥ host` hierarchy.

**Note for future work — host routes.** The schema hints at what hosts will do:
`system_qr_codes` (QR codes that grant points) need generating, `activities` need
managing, and someone hands out points at the event. Plausible future rows:

| Future route                    | Likely guard                     |
| ------------------------------- | -------------------------------- |
| `POST /api/qr` (generate)       | `requireApiRole('host','admin')` |
| `POST /app/activities` (create) | `requireRole('host','admin')`    |

None of these exist yet, so the policy table covers current routes only — new
routes pick their guard when they're built. Flagging it so "what does a host do"
gets answered deliberately, not ad-hoc, when those pages arrive.

No open questions remain.
