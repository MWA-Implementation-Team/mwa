# Guide: auth

Passwordless email-link auth, with signup folded in. `/login` is the only entry:
enter an email, and you get a one-time link **and** a short code — click the link
or paste the code. If the email is registered it logs you in; if not, it creates
your account. There are no passwords — owning the email _is_ the credential.

Without `MWA_SMTP_HOST`, the mailer prints the link and code to the server console. To test with
real emails, run `docker compose up` — it runs `npm run dev` inside a container
(same hot-reload loop, and the bind mount shares the repo's `db.sqlite`)
alongside mailpit; the web inbox is at http://localhost:8025. Bare-metal
`npm run dev` without `MWA_SMTP_*` stays on the console mailer — see
`createDefaultMwaState` in `src/state.ts` for environment configuration and
`src/emails/mailer.tsx` for implementations. Dev startup and `npm run seed` attempt
to load `.env`; production startup uses the process environment.

The factory selects SMTP when `MWA_SMTP_HOST` is set. It also reads `MWA_SMTP_PORT`
(default `25`), `MWA_SMTP_SECURE` (`true` enables TLS), and `MWA_MAIL_FROM` (default
`mwa@localhost`). The login route calls
`ctx.var.mailer.sendLoginEmail(to, { lang, url, code })`. `getRequestLanguage(ctx)`
reads the language cookie, defaulting to English. The email subject, HTML body,
and plain-text fallback use that language through the shared translation system.
Login labels, confirmations, and errors are available in English and Lithuanian.
Routes pass typed error keys to the login page, so errors also update immediately
when the visitor switches language.

Tests inject a `Mailer` with `createTestMwaState({ mailer })` to capture sends or
simulate failures. Without an override, the test factory uses a no-op mailer.
There is no global transport setter.

## The pieces

- **`POST /login`** (`src/routes/pages/login.ts`) takes an email.
  It creates a `login_tokens` row: 15-minute expiry, only
  sha256 hashes stored, keyed by `email` (not `user_id` — a token can outlive
  "no account yet"). The response page says which happened — "login link" vs
  "signup link" — and renders a code field posting to `/auth/verify`.
  Revealing registration state is deliberate (the flow can't proceed without
  it anyway), not an oversight.
- **Two credentials per token.** The link carries a 43-char `token`; the email
  also shows an 8-char unambiguous-alphabet `code` for typing. Wrong codes count
  `attempts` on the row — 5 strikes kills it. Resends are capped at one per
  minute per email, and a successfully sent email invalidates the previous
  token (a failed send discards the new row, so the old link stays alive).
- **`GET /auth/verify?token=`** and **`POST /auth/verify` (`email` + `code`)**
  (`src/routes/pages/auth.ts`) share `logIn`: consume the token atomically
  (replays get an error page), then resolve the user — registered email →
  `markEmailVerified`; new email → `createUser` with a `deriveUsername`-derived
  name (local part sanitized to `[a-z0-9_-]`, deduped). A `sessions` row (30 days,
  sha256 at rest) becomes the `mwa-session` cookie (`HttpOnly`, `SameSite=Lax`,
  `Secure` in prod). Redirect: `safeGoto` accepts normalized same-origin paths and
  queries (no route allowlist), else `/app` — **new accounts
  default to `/app/account`** so the derived username can be fixed immediately.
- **`currentUser(ctx)`** (`src/auth.ts`) resolves `mwa-session` → `sessions` →
  `User | null`. It's the only place "who is logged in" is decided.
- **Route guards** (`src/auth.ts`) are how routes consume it:
  `requireUser` / `requireRole(ctx, ...roles)` for pages (anonymous → login
  redirect, wrong role → 403 page) and `requireApiUser` / `requireApiRole` for
  JSON routes (401/403 JSON). See the policy table below.
- **`POST /app` (logout)** deletes the session row _and_ the cookie — the token
  stops working server-side immediately.
- **CSRF**: `hono/csrf` runs on all form-encoded POSTs (see `src/main.ts`) —
  requests without a matching `Sec-Fetch-Site`/`Origin` get 403. Curl users add
  `-H 'Origin: http://localhost:3000'`.

## Roles

Accounts created through the flow are always `role='user'`. `host` and `admin`
are granted by hand:

```shell
sqlite3 db.sqlite "UPDATE users SET role = 'host' WHERE username = 'alice';"
```

## Route policy

| Route                                                            | Guard                                                   |
| ---------------------------------------------------------------- | ------------------------------------------------------- |
| `/`, `/login`, `/auth/verify`                                    | public                                                  |
| `GET /app`, `GET /app/*`                                         | `requireUser`                                           |
| `POST /app` (logout)                                             | session cookie                                          |
| `GET /admin`, `POST /admin/mint-coins`                           | admin in production; any logged-in user in dev          |
| `GET /api/users`                                                 | `requireApiUser`                                        |
| `GET /api/notifications`, `GET /app/gambling/sessions/:id/watch` | `requireApiUser`                                        |
| Gambling challenge/accept/reject POSTs                           | `requireUser`; accept/reject require the invited player |

`POST /admin/mint-coins` takes `username` and a positive safe-integer `amount`,
crediting a `system` transaction through `giveCoins`. In dev, any logged-in
user can visit `/admin` directly; the navigation link remains admin-only.

## How to verify (dev)

1. `npm run seed` (if you haven't), `npm run dev`.
2. On `/login` enter `alice@mwa.dev`, submit — the page says a login link was sent
   and shows a code field.
3. With the console mailer, look for `[console mailer] alice@mwa.dev` followed by
   the subject and email text containing the link and code. With SMTP/mailpit, open
   the web inbox instead. Open the link — you're logged in; the header shows
   `App (alice)`.
4. Or instead: submit again, then type the **code** into the field — same result.
5. A fresh email → "signup link" copy; the link creates the
   account and lands on `/app/account` with a derived username.
6. The same link/code a second time → "expired or already used".
7. **Logout** → back at `/login`; the old cookie value is dead.
8. For curl tests you need a real session cookie — mint one through the flow:

    ```shell
    curl -s -X POST localhost:3000/login -H 'Origin: http://localhost:3000' \
        -d 'email=alice@mwa.dev'
    # copy the link from the server console, then:
    curl -s -c cookies.txt 'http://localhost:3000/auth/verify?token=…'
    curl -s -b cookies.txt localhost:3000/api/users   # → 200 JSON
    ```

    `mwa-session` is an opaque token — you can't forge it in the browser console
    like the old `mwa-username` cookie.
