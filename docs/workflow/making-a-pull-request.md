# Making a pull request

## Branch

Branch names are `<type>/<short-description>` in kebab-case. Common types:

- `feature/...` — new functionality: `feature/user-profiles`, `feature/badge-shop`
- `fix/...` — bug fixes: `fix/login-redirect`, `fix/seed-crash`
- `docs/...` — documentation: `docs/initial`, `docs/migration-guide`
- `chore/...` — tooling, deps, cleanup: `chore/upgrade-preact`

```shell
git checkout -b feature/user-profiles
```

## Commits

Style (see the git log and `AGENTS.md`):

- **Short, lowercase, imperative-ish**: `remove rng slop`,
  `switch to hono from node http server`, `add docs skeleton`.
- **Small and scoped to one change.** Prefer several tiny commits over one mixed commit
  — "add badges endpoint" and "add badges page" are two commits.

## Formatting

Prettier is already installed as a dev dependency — `npm run format` formats the whole
repo. Better still: enable **format-on-save** in your editor so files are always
formatted and lint never fails on style. In VS Code: install the Prettier extension,
set it as the default formatter, and turn on `editor.formatOnSave`.

## Before pushing

```shell
npm run lint
```

This is exactly what CI runs on PRs to `main` (typecheck + prettier check). If it's
clean locally, CI is green.

## Open the PR — via the GitHub UI

No extra tooling needed beyond `git` itself:

1. Push the branch: `git push -u origin feature/user-profiles`
2. Open the repo on github.com — a yellow **"Compare & pull request"** banner appears
   at the top. Click it.
    - No banner? Go to **Pull requests → New pull request**, set **base: `main`** and
      **compare: your branch**.
3. Fill in the title and description, click **Create pull request**.

### Checking CI in the UI

Once the PR is open, GitHub Actions runs `npm run lint` automatically. Watch it without
the CLI:

- Scroll to the bottom of the PR page — the checks box shows each job's status.
- Click **Details** next to a check to open the Actions log and see the exact error.
- The **Checks** tab at the top of the PR shows the same runs.

(The equivalent CLI flow is `gh pr create --fill` + `gh pr checks` if you prefer.)

## How to verify

- `npm run lint` is clean locally.
- The PR's CI check is green in the checks box before requesting review.
