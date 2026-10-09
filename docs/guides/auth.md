# Guide: auth

Passwordless email-link auth, with signup folded in. `/login` is the only entry:
enter an email, and you get a one-time link **and** a short code — click the link
or paste the code. If the email is registered it logs you in; if not, it creates
your account. There are no passwords — owning the email _is_ the credential.

In dev, emails aren't sent: the link and code are printed to the server console
(see `src/mailer.ts` — real SMTP lands behind that seam later).

## The pieces

- **`POST /login`** (`src/routes/pages/login.ts`) takes an email.
  It creates a `login_tokens` row: 15-minute expiry, only
  sha256 hashes stored, keyed by `email` (not `user_id` — a token can outlive
  "no account yet"). The response page says which happened — "login link" vs
  "signup link" — and renders a code field posting to `/auth/verify`.
- **Two credentials per token.** The link carries a 43-char `token`; the email
  also shows an 8-char unambiguous-alphabet `code` for typing. Wrong codes count
  `attempts` on the row — 5 strikes kills it. Resends are capped at one per
  minute per email, and a new request invalidates the old token.
- **`GET /auth/verify?token=`** and **`POST /auth/verify` (`email` + `code`)**
  (`src/routes/pages/auth.ts`) share `logIn`: consume the token atomically
  (replays get an error page), then resolve the user — registered email →
  `markEmailVerified`; new email → `createUser` with a `deriveUsername`-derived
  name (local part sanitized to `[a-z0-9_-]`, deduped). A `sessions` row (30 days,
  sha256 at rest) becomes the `mwa-session` cookie (`HttpOnly`, `SameSite=Lax`,
  `Secure` in prod). Redirect: `safeGoto` allowlist, else `/app` — **new accounts
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

| Route                         | Guard                  |
| ----------------------------- | ---------------------- |
| `/`, `/login`, `/auth/verify` | public                 |
| `GET /app`, `GET /app/*`      | `requireUser`          |
| `POST /app` (logout)          | session cookie         |
| `GET /admin`                  | `requireRole('admin')` |
| `GET /api/users`              | `requireApiUser`       |

## How to verify (dev)

1. `npm run seed` (if you haven't), `npm run dev`.
2. On `/login` enter `alice@mwa.dev`, submit — the page says a login link was sent
   and shows a code field.
3. The server console shows `[mailer] login link for alice@mwa.dev:
http://localhost:3000/auth/verify?token=…  (code: …)`. Open the link — you're
   logged in; the header shows `App (alice)`.
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
