# Spec: Personal QR → Interact Page

## Objective

Every user gets a permanent, unguessable personal link rendered as a QR code
on their home page (`/app`). Scanning it opens `/app/interact/:token`, which
shows the scanner the set of actions their role permits against the token
owner — gated by which props the route serializes for the scanner's role.

Story: Alan opens `/app`, shows Daniel his QR. Daniel scans with his phone
camera → `/app/interact/<token>` → logs in if needed → sees the actions his
role allows on Alan's account.

In scope: token mint/storage, QR rendering (SSR'd SVG), interact route + page,
role-gated interaction sections, self-scan easter egg, translations.
Deferred (explicitly out of scope): real balance transfers, pending/confirm
flow, notifications, any actual mutation of the target's account.

## Tech Stack

Hono + node:sqlite + SSR Preact (renderToString + importmap, no bundler).
QR: `uqr` npm package (`renderSVG(url)`), backend-only — never shipped to the
browser. (`qrcode` is the fallback.) No new frontend dependencies.

## Commands

Dev: npm run dev # :3000
Build: npm run build
Test: npm test # rebuilds, node --test on dist/**/*.test.js
Lint: npm run lint # tsc --noEmit + prettier --check
Seed: npm run seed

## Project Structure

migrations/05_interact_tokens.sql → interact_tokens table
src/db/interactions.ts → token mint/resolve, prepared statements
src/client/pages/app/InteractPage.tsx → scanner view; interactions are
conditional sections in this file, gated by which props the route
populated for the scanner's role
src/client/pages/app/HomePage.tsx → + QR block
src/routes/pages/app.ts → + GET /app/interact/:token
src/db/interactions.test.ts → token tests
src/routes/pages/interact.test.ts → route auth/404/self-scan/role tests
docs/ → glossary + file-map updates

## Data Model

```sql
CREATE TABLE interact_tokens (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  token TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id)
) STRICT;
```

- Token: `randomBytes(32).toString('base64url')`, embedded only in the QR URL.
- Stored raw — same convention as `system_qr_codes.secret`, and required in
  practice: the QR is re-rendered on every `/app` load, so the raw value must
  be retrievable. (Revised during implementation — an earlier draft said
  hash-at-rest, which makes re-rendering impossible.) Safe because the token
  _identifies_ the target; it authorizes nothing — the scanner's own session
  and role gate the actions.
- Minted lazily: first `/app` render calls `getOrCreateInteractToken(userId)`.
  One token per user, never rotated.

## Interactions

Conditional sections inside `InteractPage` — no registry. (Revised during
review: a registry was over-engineered for two stubs; it can graduate to one
when the list grows.) Role gating stays data-driven: the route serializes
elevated props only for roles that should see them.

v1 sections:

- `send-money` → all roles — UI stub only
- `view-profile-detail` → host/admin — shows target's email, balance, join
  date; proves gating. The route populates the `detail` prop only when
  `scanner.role` is host/admin, so regular scanners never receive those
  fields in `#ssr-data`.

## Behavior

- `GET /app/interact/:token` → `requireUser`. Logged-out scanners hit the
  existing `/login?goto=` redirect — the magic-link flow works on phones.
- Valid token → InteractPage: target's display info + the sections the
  scanner's role permits.
- Scanner == owner → translated joke message ("easter egg"), no actions.
- Invalid token → `writeErrorPage` 404.
- QR on `/app` encodes the absolute URL built from the request origin.

## Code Style

Prettier: 4-space indent, single quotes, semicolons, trailing commas.
Prepared statements in db/*.ts with typed wrappers; routes only check auth
and serialize. Registries are `satisfies` maps for compile-time checking.
`import type` only when client code references `src/db/*` types.

## Testing Strategy

node:test in src/**/*.test.ts (run from dist). Cover: token mint/resolve/
uniqueness/lazy-mint idempotency, route auth (redirect when logged out, 404
bad token, easter egg self-scan), interaction role filtering incl. detail
field presence/absence in rendered HTML.

## Boundaries

- Always: `npm test` + `npm run lint` before commits; `t()` entries for every
  new user-facing string; `docs/` updated in the same PR.
- Ask first: frontend dependencies, schema changes beyond the one migration,
  auth flow changes.
- Never: secrets committed, failing tests removed.

## Success Criteria

- [ ] Every user gets a stable unguessable token; `/app` renders a scannable QR
- [ ] `/app/interact/:token` resolves owner; actions filtered by scanner role
- [ ] `send-money` stub visible to all; `view-profile-detail` only to host/admin
- [ ] Self-scan → easter egg; bad token → 404; logged-out → login redirect
- [ ] `npm test` + `npm run lint` green; docs updated in same PR

## Open Questions

None — all resolved during review.
