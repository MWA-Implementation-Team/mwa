# Spec: accounts

Module of the [authorization capability map](CAPABILITY-MAP.md). No dependencies —
built first.

## Objective

Account creation is folded into the login flow: the `/login` email form is the only
entry point. Submitting an **unregistered** email
creates a pending signup — the emailed link/code, when consumed, creates a
`users` row with `role = 'user'` and an auto-derived username (from the email
local part, deduplicated), then lands the new user on `/app/account` to edit it.
Host/admin accounts are never creatable through this path — an admin promotes
existing users (promotion UI is out of scope; a SQL statement in docs is enough).

Email ownership is proven when the link/code is consumed, so the account is born
with `email_verified_at` set.

User stories:

- As a new event participant, entering my email sends me
  a signup link; clicking it creates my account and drops me on my profile page to
  fix my username.
- As a returning participant, the same form sends me a login link — the response
  page tells me which happened and lets me paste the email's code instead of
  clicking.
- As an admin, I can promote a user to `host` or `admin` with a documented SQL
  statement; no public path grants those roles.

## Tech Stack

Hono 4 routes, Preact SSR page (`writePage`), `node:sqlite` via `src/state.ts`,
issue-numbered SQL migrations (`<issue>_<name>.sql` — PR #38 convention). No new
dependencies.

## Commands

```
Build: npm run build
Test:  npm test            (added by this module — node:test, see Testing Strategy)
Lint:  npm run lint
Dev:   npm run dev
Seed:  npm run seed
```

## Project Structure

New/changed files:

```
migrations/26_auth.sql             adds users.email_verified_at (issue #26,
                                   shared with sessions' auth tables)
src/db/users.ts                    + createUser(), findUserByEmail(), findUserById(),
                                   markEmailVerified(), deriveUsername()
src/routes/pages/login.ts          POST /login handles unregistered emails
src/client/pages/LoginPage.tsx     email form + "which happened" copy
src/client/pages.ts                'signup' entry removed
docs/guides/auth.md                documents the unified flow
```

## Code Style

Match existing code: 4-space indent, single quotes, 100-col prettier. One domain
module per table in `src/db/` with prepared statements + typed functions:

```ts
const createUserQuery = database.prepare(`
INSERT INTO users (email, username, role) VALUES (?, ?, 'user')
`);

export function createUser(email: string, username: string): User {
    const id = Number(createUserQuery.run(email, username).lastInsertRowid);
    return findUserById(id)!;
}
```

## Behavior

- The standalone `/signup` page and route are deleted; `/login` is the only entry.
- `POST /login` accepts `email`:
    - Trim + lowercase the email; reject non-emails
      (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/` — real verification is the link itself).
    - **Registered email** → sessions module sends a login link/code; the page
      says "we sent a login link".
    - **Unregistered email** → sessions sends a
      signup link/code; the page says "we sent a signup link" — the response
      deliberately reveals registration state now (the old anti-enumeration rule
      is dropped).
    - Both states render a **code input** posting to `/auth/verify`, so users can
      type the code instead of clicking.
- Account creation happens inside `consumeLoginToken`'s caller (the sessions
  module) on verify: `deriveUsername(email)` sanitizes the local part to
  `[a-z0-9_-]`, truncates to 16, and appends digits until unique; the user is
  created with `role='user'` and `email_verified_at` set. New accounts redirect
  to `/app/account` by default (a valid `goto` still wins).
- `users.email_verified_at` — `TEXT NULL` column in `26_auth.sql`. For link-created
  accounts it's set at creation; `markEmailVerified` covers users created before
  this system existed (e.g. seeds).
- Promotion path (docs only): `UPDATE users SET role = 'host' WHERE username = 'x'`
  — documented in `docs/guides/auth.md`.

## Testing Strategy

This module introduces the test setup (no framework exists today):

- `node:test` + `node:assert/strict` — built into Node 24, zero new dependencies.
- Tests live next to code as `src/**/*.test.ts`, compiled to `dist/`, run via
  `node --test 'dist/**/*.test.js'`.
- `state.ts` gains a `MWA_DB_PATH` env override (default `db.sqlite`,
  `:memory:` allowed) so tests get isolated databases — owned by this module since
  it lands first.
- `package.json` gains `"test": "npm run build && node --test 'dist/**/*.test.js'"`.

Tests for this module: email validation, `createUser`/`findUserByEmail`
round-trip, `deriveUsername` sanitization + dedup, unified POST /login behavior
(registered vs unregistered) — route-level, in-memory db.

## Boundaries

- Always: `npm run lint` and `npm test` before committing; validate all form input.
- Ask first: new dependencies, CI changes, removing the dev cookie auth before
  sessions lands.
- Never: commit secrets; create host/admin accounts through any public route; log
  submitted emails at info level.

## Success Criteria

- [ ] `POST /login` with an unregistered email sends a signup
      link/code; consuming it creates a `role='user'` row with a derived username
      and `email_verified_at` set, landing on `/app/account`.
- [ ] Registered vs unregistered responses say which happened; both include a code
      input field.
- [ ] Derived usernames are ≤16 chars, ASCII `[a-z0-9_-]`, and unique.
- [ ] No code path outside migrations/seeds/SQL-promotion can set a role other than
      `'user'`.
- [ ] `npm test` exists and passes; `npm run lint` passes.

## Open Questions

Resolved: username = 1–16 printable ASCII; signup link lives on `/login`.

No open questions remain.
