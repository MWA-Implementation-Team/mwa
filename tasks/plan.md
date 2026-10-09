# Implementation Plan: Authorization system

## Overview

Three modules from [CAPABILITY-MAP.md](../CAPABILITY-MAP.md), implemented in
dependency order: **accounts** → **sessions** → **role-gates** (all tracked in #26).
Specs: `SPEC-accounts.md`, `SPEC-sessions.md`, `SPEC-role-gates.md`. Task list:
`tasks/todo.md` in this directory. Branch: `feature/real-auth-implementation`.

## Architecture decisions

- Passwordless: email link → single-use `login_tokens` row → `sessions` row →
  `mwa-session` cookie. Tokens are random 32B, stored as sha256 — never raw.
- `currentUser(ctx)` keeps its `User | null` signature; internals swap cookie-username
  for session-token lookup. All call sites untouched.
- Mailer is a `sendLoginEmail(to, url)` seam in `src/mailer.ts` — console impl now,
  SMTP (`nodemailer` + `MWA_SMTP_*`) a follow-up.
- Tests: `node:test` + `node:assert`, files as `src/**/*.test.ts` compiled to `dist/`,
  `npm test` = `npm run build && node --test 'dist/**/*.test.js'`. `state.ts` gains
  `MWA_DB_PATH` so tests run on `:memory:`.
- Migrations are issue-numbered (PR #38): one `26_auth.sql` for the whole effort.

## Task list

### Phase 1: accounts

- Task 1: Test plumbing — `MWA_DB_PATH` in state.ts, `npm test` script
- Task 2: Migration `26_auth.sql` (email_verified_at part) + db functions
  (`createUser`, `findUserByEmail`, `findUserById`, `markEmailVerified`)
- Task 3: Signup page + routes (`GET/POST /signup`, T&C modal, login-page link)

### Phase 2: sessions

- Task 4: Migration `26_auth.sql` (tables part) + `src/db/sessions.ts` token/session queries
- Task 5: `src/mailer.ts` (console impl) + login route sends link
- Task 6: `GET /auth/verify` → session + cookie; `currentUser` swaps to sessions;
  logout deletes server-side
- Task 7: CSRF middleware on mutating routes; delete `mwa-username` machinery

### Phase 3: role-gates

- Task 8: `requireUser`/`requireRole`/`requireApiUser`/`requireApiRole` in auth.ts;
  apply to all routes per policy table

### Phase 4: docs + wrap-up

- Task 9: Rewrite `auth-in-dev.md` → `auth.md`; update file-map + guides; update
  README login instructions

## Risks and mitigations

| Risk                                               | Impact | Mitigation                                         |
| -------------------------------------------------- | ------ | -------------------------------------------------- |
| Signup lands before sessions — no way to log in    | Low    | Dev cookie auth stays until Task 6 removes it      |
| Migration order vs watermark (39 < 40, sequential) | Low    | Same branch merges both; fresh dbs apply in order  |
| `hono/csrf` blocking legit form posts              | Med    | Verify POST /login, /signup, /app manually in dev  |
| Test db shared across tests in one process         | Low    | Unique usernames/emails per test; tests sequential |

## Checkpoint: after each phase

- `npm run lint` + `npm test` green, flow verified manually in dev, small commit.
