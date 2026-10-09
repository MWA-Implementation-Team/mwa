# Tasks: authorization system

Plan: `tasks/plan.md`. Specs: `SPEC-*.md` at repo root. Issue: #26.

## Phase 1: accounts

- [x] Task 1: Test plumbing
    - Acceptance: `MWA_DB_PATH` env overrides db path (default `db.sqlite`,
      `:memory:` works); `npm test` runs `node:test` over `dist/**/*.test.js`
    - Verify: a trivial test file passes under `npm test`
    - Files: `src/state.ts`, `package.json`

- [x] Task 2: Migration + user db functions
    - Acceptance: `users.email_verified_at TEXT NULL` exists;
      `createUser(email, username)` → `role='user'` row; `findUserByEmail`,
      `findUserById`, `markEmailVerified` work; duplicate email/username rejected
      by the UNIQUE constraints
    - Verify: `src/db/users.test.ts` passes
    - Files: `migrations/26_auth.sql`, `src/db/users.ts`,
      `src/db/users.test.ts`

- [x] Task 3: Signup page + routes
    - Acceptance: `GET /signup` renders form (redirects to /app when logged in);
      `POST /signup` validates + creates user or re-renders with error; duplicates
      give generic message; `/login` links
      to `/signup`
    - Verify: `src/routes/pages/signup.test.ts` passes; manual check in dev
    - Files: `src/routes/pages/signup.ts`, `src/client/pages/SignupPage.tsx`,
      `src/client/pages.ts`, `src/client/pages/LoginPage.tsx`, `src/main.ts`,
      `src/client/language.ts`

## Phase 2: sessions

- [x] Task 4: Auth tables + session db module
    - Acceptance: `login_tokens` + `sessions` tables exist; create/redeem token
      (single-use, expiry), create/lookup/delete session functions; tokens hashed
      at rest
    - Verify: `src/db/sessions.test.ts` passes
    - Files: `migrations/26_auth.sql`, `src/db/sessions.ts`,
      `src/db/sessions.test.ts`

- [x] Task 5: Mailer + POST /login sends link
    - Acceptance: `sendLoginEmail(to, url)` logs link to console; POST /login
      takes email, creates 15-min token, responds identically for known/unknown
      emails; resend cap 60s; new token invalidates old
    - Verify: route test; manual: POST → link in server console
    - Files: `src/mailer.ts`, `src/routes/pages/login.ts`,
      `src/client/pages/LoginPage.tsx`, `src/routes/pages/login.test.ts`

- [x] Task 6: Verify endpoint + session swap
    - Acceptance: `GET /auth/verify?token=` consumes token once → creates session,
      sets `mwa-session` (HttpOnly, SameSite=Lax, Secure in prod), marks
      `email_verified_at`, redirects via `safeGoto`; `currentUser` resolves via
      session; POST /app deletes session row + cookie; `mwa-username` cookie gone
    - Verify: tests + manual end-to-end login in dev
    - Files: `src/auth.ts`, `src/routes/pages/auth.ts`, `src/main.ts`,
      `src/routes/pages/app.ts`, `src/client/constants.ts`,
      `src/routes/pages/auth.test.ts`

- [x] Task 7: CSRF on mutating routes
    - Acceptance: `hono/csrf` applied; POST /login, /signup, /app still work
      same-origin
    - Verify: manual form posts in dev; lint
    - Files: `src/main.ts`

## Phase 3: role-gates

- [x] Task 8: Guards + route application
    - Acceptance: `requireUser`, `requireRole`, `requireApiUser`, `requireApiRole`
      in `src/auth.ts` (variadic roles); no `currentUser(` calls outside auth.ts;
      page guards redirect/403, API guards 401/403 JSON; behavior per policy table
    - Verify: `src/auth.test.ts` + route tests; grep routes for `currentUser(` → 0
    - Files: `src/auth.ts`, `src/auth.test.ts`, `src/routes/pages/app.ts`,
      `src/routes/pages/admin.ts`, `src/routes/api/users.ts`

## Phase 4: docs

- [x] Task 9: Docs rewrite
    - Acceptance: `docs/guides/auth.md` replaces `auth-in-dev.md` (real flow, dev
      console login, promote-to-host SQL); `file-map.md` + `add-a-page.md` +
      `add-an-api-endpoint.md` + README updated
    - Verify: docs match behavior; links resolve
    - Files: `docs/guides/auth*.md`, `docs/file-map.md`,
      `docs/guides/add-a-page.md`, `docs/guides/add-an-api-endpoint.md`, `README.md`
