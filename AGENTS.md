# Project notes

## Commits

- Commit style: short, lowercase, imperative-ish (e.g. "remove rng slop", "switch to hono from node http server").
- Keep commits small and scoped to a single change — prefer several tiny commits over one mixed commit.
- Do NOT add any agent signatures, "Generated with" footers, or Co-Authored-By trailers to commits. User preference for this repo.

## Branches

- Branch naming: `<type>/<short-description>` in kebab-case — `feature/…`, `fix/…`, `docs/…`, `chore/…` (e.g. `docs/initial`, `feature/user-profiles`, `fix/login-redirect`).

## Documentation

- `docs/` must stay in sync with the code — a PR that changes documented behavior without updating the docs fails review.
- When revising agent-authored work before pushing, check which docs reference the changed code and update them in the same PR. If the user asks for a revision, remind them that fresh docs are a requirement, not optional.

## Commands

- `npm run lint` — typecheck (`tsc --noEmit --noUnusedLocals --noUnusedParameters`) + prettier check
- `npm run dev` — dev server on :3000
- `npm run seed` — build + run `dist/seed.js`; fills db.sqlite with sample data (no-op if users table isn't empty — delete db.sqlite to reseed)
