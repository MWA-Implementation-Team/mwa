# Project notes

## Commits

- Commit style: short, lowercase, imperative-ish (e.g. "remove rng slop", "switch to hono from node http server").
- Keep commits small and scoped to a single change — prefer several tiny commits over one mixed commit.
- Do NOT add any agent signatures, "Generated with" footers, or Co-Authored-By trailers to commits. User preference for this repo.
- NEVER force-push. If a push is rejected (non-fast-forward), stop and ask — do not rewrite remote history, even with `--force-with-lease`.

## Branches

- Branch naming: `<type>/<short-description>` in kebab-case — `feature/…`, `fix/…`, `docs/…`, `chore/…` (e.g. `docs/initial`, `feature/user-profiles`, `fix/login-redirect`).

## Documentation

- `docs/` must stay in sync with the code — a PR that changes documented behavior without updating the docs fails review.
- When revising agent-authored work before pushing, check which docs reference the changed code and update them in the same PR. If the user asks for a revision, remind them that fresh docs are a requirement, not optional.

## Commands

- `npm run lint` — typecheck (`tsc --noEmit --noUnusedLocals --noUnusedParameters`) + prettier check + `scripts/check-css-usage.mjs` (unused/undefined classes, inline `style=`)

## CSS

Full guide: `docs/guides/css-architecture.md`. Read it before touching any CSS. These rules are strict. If a task seems to need breaking one, stop and ask instead.

- **Oat first.** `static/oat.css` is our fork of Oat and holds the theme and plain-element styles. Use Oat markup (plain `<button>`, `data-variant`, `a.button`, `.table`, `.card`) before writing a new class.
- **Where a change goes:** theme value → Oat variable in `oat.css`; how a plain element looks everywhere → Oat's rule in `oat.css`; value only app components use → `static/style/tokens.css`; new component → its own file in `static/style/components/`, imported at the end of `main.css`; page frame → `base.css`.
- **Every `oat.css` edit carries a `/* mwa: <reason> */` comment.** Don't reformat or delete Oat rules you aren't changing. Theme the dark (second) `light-dark()` argument only; leave light values at Oat's defaults until the light theme exists.
- **Raw colours live only in `tokens.css` and `oat.css`.** Components use variables: Oat's (`--foreground`, `--muted`, `--border`…) first, an app token otherwise.
- **Sizes come from Oat's scales:** `--space-N`, `--text-N` / `--text-regular`, `--radius-*`. No `px` for `font-size`, `padding`, `margin`, `gap` or `border-radius`.
- **Never:** `!important`, IDs in selectors, scoping selectors under the `.mwa` wrapper (`.mwa .mwa-panel`, `.mwa button` — write `.mwa-panel`; the `mwa-` start of class names is required naming and is fine), `@import` outside `main.css`, external URLs in CSS (fonts go in `static/fonts/`, compressed images in `static/img/`), inline `style=` in `src/client/` (only `src/client/activities/` is exempt).
- **Class names:** kebab-case, `mwa-<block>`, `mwa-<block>-<part>`, `mwa-<block>--<modifier>`. Keep selectors flat.
- **Delete a class's CSS when you remove its last use**, and never ship a class that no stylesheet defines.
- **Never weaken the checks:** don't edit `scripts/check-css-usage.mjs` to make lint pass. Fix the CSS. If a rule seems genuinely wrong, ask the user.
- **Keep the CSS guide in sync:** if you change where styles live, a token's meaning or a lint rule, update `docs/guides/css-architecture.md` in the same PR.
- **Run `npm run lint` before every commit that touches CSS or markup.** For visual changes, tell the user which page and element changed so they can check it in the browser.
- `npm run dev` — dev server on :3000
- `npm run seed` — build + run `dist/seed.js`; fills db.sqlite with sample data (no-op if users table isn't empty — delete db.sqlite to reseed)
