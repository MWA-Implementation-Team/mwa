# Spec: sessions

Module of the [authorization capability map](CAPABILITY-MAP.md).
Depends on: [accounts](SPEC-accounts.md) (user records, `markEmailVerified`).

## Objective

Replace the plaintext `mwa-username` cookie with real passwordless auth: users enter
their email, receive a one-time login link, click it, and get a session cookie that
proves identity until it expires or they log out. `currentUser(ctx)` keeps its exact
signature (`Context → User | null`) — every existing call site keeps working
unchanged.

User stories:

- As a participant, I enter my email on `/login` and get a link that logs me in.
- As a participant, my login survives browser restarts for weeks, and "log out"
  actually ends the session server-side.
- As an attacker, I can't forge a session (unguessable token, hashed at rest),
  replay a used/expired login link, or enumerate registered emails from the login
  response.

## Tech Stack

Hono 4 (`hono/cookie`, `hono/csrf`), `node:crypto` (`randomBytes`, `createHash`),
`node:sqlite`, issue-numbered migrations (`<issue>_<name>.sql` — PR #38
convention). **No new dependencies** — SMTP delivery is deferred (see Mailer
below); the mailer is an interface with a console implementation for now.

## Commands

```
Build: npm run build
Test:  npm test            (node:test — introduced by accounts module)
Lint:  npm run lint
Dev:   npm run dev
```

## Project Structure

New/changed files:

```
migrations/26_auth.sql             sessions + login_tokens + email_verified_at
                                   (issue #26, shared with accounts)
src/db/sessions.ts                 session + login-token queries (domain module)
src/auth.ts                        currentUser() swaps cookie lookup → session verify
src/mailer.tsx                     sendLoginEmail() — console impl, or SMTP when
                                   MWA_SMTP_* env is set
src/routes/pages/login.ts          POST /login sends link; GET unchanged shape
src/routes/pages/auth.ts           GET /auth/verify — registerAuthRoutes(app)
src/routes/pages/app.ts            POST /app (logout) deletes session + cookie
src/client/pages/LoginPage.tsx     email input instead of username
src/client/pages/CheckEmailPage?   or render "check your email" inline on login page
src/client/constants.ts            mwa-username → mwa-session
src/client/api/users.ts            no change (fetch carries the cookie automatically)
src/main.ts                        + registerAuthRoutes(app), csrf middleware on POSTs
docs/guides/auth-in-dev.md         rewritten → docs/guides/auth.md (real auth + dev workflow)
docs/file-map.md                   update auth.ts line + new entries
```

## Data model (migration `26_auth.sql`)

```sql
CREATE TABLE login_tokens (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  expires_at TEXT NOT NULL,
  used_at TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  token_hash TEXT NOT NULL UNIQUE,
  code_hash TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL
) STRICT;

CREATE TABLE sessions (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  expires_at TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL REFERENCES users(id)
) STRICT;
CREATE INDEX login_tokens_index_email ON login_tokens (email);
-- (token_hash is already indexed by its UNIQUE constraint)
```

Tokens: 32 bytes from `crypto.randomBytes`, base64url-encoded into the link/cookie,
stored only as `sha256(token)` — a DB leak can't be replayed.

Each token row also gets a **short human code** (8 chars from a 32-char unambiguous
alphabet — no `0/O/1/I/L`), stored as `sha256` in `code_hash`. The email contains
both the link and the code; the "we sent it" page has a paste field posting to
`/auth/verify`. Codes are brute-forceable, so `attempts` caps wrong-code guesses
(5 strikes → the token is dead). `user_id` is gone — rows carry `email` instead:
a token is "login" if the email is registered at consume-time, "signup" if not.

## Behavior

- `GET /login` — unchanged shape: logged-in → `/app`, else render form (now asking
  for **email**).
- `POST /login` — accepts `email`. Response
  says which thing happened — "we sent a login link" vs "we sent a signup link"
  (registration state is deliberately not hidden) — and renders a code-input form
  posting to `/auth/verify`. If a user exists for the email:
    - Refuse silently (same page) if a token was sent <60s ago — resend cap.
    - Create a `login_tokens` row expiring in 15 min; email link + code.
      If no user exists: same token machinery with the email stored
      for account creation.
    - Only after the email sends successfully: invalidate the email's other
      live tokens (newest link wins). A failed send discards the new row, so
      the previous link stays alive and the resend cap doesn't arm.
- `GET /auth/verify?token=&goto=` and `POST /auth/verify` (form field `code`) —
  same consume path. Look up `sha256(token)` or `sha256(UPPER(code))`; require
  unused + unexpired. On success: mark `used_at`; if the email is registered,
  `markEmailVerified(user_id)` (accounts interface), else create the user via
  accounts' `deriveUsername` + `createUser` (born verified). Then create a session
  (30-day expiry), `setCookie('mwa-session', token)`, and redirect — existing
  users → `safeGoto` → `/app` default; **new users → `/app/account`** default so
  they can fix their derived username. On failure: login page with "link expired
  or invalid" / "wrong code" — wrong codes increment `attempts`, 5+ kills the
  token.
- Session cookie: `HttpOnly`, `SameSite=Lax`, `Secure` when not `isDevMode`,
  `Max-Age` matching session expiry, `Path=/`.
- `currentUser(ctx)` — read `mwa-session`, hash, look up unexpired session → join
  `users` → `User | null`. Signature unchanged; all 9 existing call sites untouched.
- `POST /app` (logout) — delete the session row **and** the cookie, 303 → `/login`.
  (Today it only deletes the cookie, which dev auth made equivalent — not anymore.)
- CSRF — `SameSite=Lax` already blocks cross-site POSTs carrying the cookie; add
  `hono/csrf` (built-in, no dep) on mutating routes for defense in depth.
- Mail transport: `sendLoginEmail(to, url, code)` in `src/mailer.tsx`. Console
  implementation by default; real SMTP delivery (`nodemailer` + `MWA_SMTP_*` env
  vars, mailpit in the compose dev stack) activates when the env vars are set.
  The function signature is the seam, so transport changes touch `mailer.tsx`
  and nothing else.
- Dev convenience: the `mwa-username` cookie mechanism is **deleted**. Dev login =
  POST /login → click the link printed in server logs. `docs/guides/auth.md`
  documents this.
- Expired sessions are ignored on read (lazy cleanup — no sweeper process; a
  `DELETE ... WHERE expires_at < now` on login is enough).

## Testing Strategy

`node:test` (setup from accounts). Tests: token create/redeem lifecycle
(single-use, expiry), `currentUser` with forged/expired/valid cookie values,
anti-enumeration (same response for known/unknown emails), resend cap, logout
invalidates server-side, `safeGoto` stays intact. Route tests run against an
in-memory `MWA_DB_PATH`; mailer is injected/stubbed in tests.

## Boundaries

- Always: `npm run lint` + `npm test` before commits; tokens hashed at rest; never
  reveal email registration state in responses.
- Ask first: adding dependencies (nodemailer arrives with the SMTP follow-up, not
  this module); SMTP credentials provisioning; changing CI.
- Never: commit secrets or API keys; store raw tokens in the DB; log tokens or
  session values; keep any `mwa-username` fallback path in prod code.

## Success Criteria

- [ ] `document.cookie = 'mwa-username=alice'` no longer logs anyone in — only a
      valid `mwa-session` does.
- [ ] Full flow works in dev with no credentials: POST /login → link + code in
      server console → click OR paste the code → logged in; header shows
      `App (alice)`.
- [ ] A login link/code works exactly once and expires after 15 min; 5 wrong code
      entries kill the token.
- [ ] Logout → the same session cookie value is rejected server-side afterward.
- [ ] `curl /api/users` → 401 without session, 200 with one (unchanged contract).
- [ ] POST /login responses say whether the email was registered (login vs signup
      link copy) and both include the code field.
- [ ] `docs/guides/auth-in-dev.md` rewritten for the new flow; `file-map.md`
      updated.

## Open Questions

Resolved: session 30 days / login link 15 min; links work cross-device (session
binds to whichever browser clicks). Email delivery is deferred — the mailer logs
links to the console now; SMTP (`nodemailer` + `MWA_SMTP_*` env vars) lands as a
follow-up once host/port/TLS/credentials/From details exist.

No open questions remain.
