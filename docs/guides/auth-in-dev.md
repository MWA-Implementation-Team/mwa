# Guide: auth in dev

This template has **dev-only cookie auth**: the `mwa-username` cookie holds a plaintext
username, and "logged in" means that username exists in the `users` table. There is no
password, no signing, no expiry. **Do not ship this** — it's scaffolding so every page
and endpoint can be built and tested before real auth exists.

## The pieces

- **The cookie name** lives in `src/client/constants.ts` (`mwa-username`), shared by
  server and client.
- **`currentUser(ctx)`** (`src/auth.ts`) is the single place "who is logged in" is
  decided: read the cookie, look up the user, return `User | null`. The comment in that
  file is the migration plan — real auth swaps the cookie read for session-token
  verification, and the `User | null` signature plus every call site stay identical.
- **Login**: `POST /login` (`src/routes/pages/login.ts`) checks the submitted username
  exists, `setCookie`s it, and redirects to `?goto=` (filtered through the
  `allowedGotos` allowlist) or `/app`.
- **Page routes** bounce logged-out visitors:
  `if (!currentUser(ctx)) return goLogin(ctx)` → `/login?goto=<original path>`.
- **API routes** return `ctx.json({ error: 'unauthorized' }, 401)` instead of
  redirecting — fetch calls can't follow a login redirect usefully.
- **Logout**: `POST /app` deletes the cookie and 303-redirects to `/login`.

## What's dev-only (and why that's OK here)

- No password — knowing a username _is_ the credential.
- The cookie is unsigned and not `HttpOnly`: you can impersonate anyone from the browser
  console with `document.cookie = 'mwa-username=alice'` — handy for testing, hopeless
  for security.
- No CSRF protection on `POST /login`.
- The cookie never expires.

For local development these are features: instant user switching, readable state,
nothing to configure. The work needed for real auth is deliberately concentrated in one
function.

## How to verify

1. `npm run seed` (if you haven't), `npm run dev`, log in as `alice` — the header shows
   `App (alice)`.
2. DevTools → Application → Cookies → `localhost:3000`: the `mwa-username` cookie is
   there with value `alice`.
3. Console: `document.cookie = 'mwa-username=bob'`, reload — you're now bob. That's the
   whole auth system.
4. **Logout** → cookie deleted, you're back at `/login`.
5. Incognito: open `/app` → redirected to `/login?goto=%2Fapp`; after login you land on
   `/app`.
6. `curl -i http://localhost:3000/api/users` → `401`; add
   `-b 'mwa-username=alice'` → `200` with JSON.
