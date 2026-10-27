# Tasks: Leaderboard rework

## Task 1: Migration + transaction stamping

**Description:** Add `migrations/08_leaderboard.sql` — `ALTER TABLE
child_transactions ADD COLUMN group_id INTEGER REFERENCES groups(id)` +
rebuild `parent_transactions` adding `'host_grant'` to the kind CHECK.
Update `TransactionKind` and stamp `group_id` inside `insertTransaction` via
`findUserGroup`.

**Acceptance criteria:**

- [ ] `child_transactions.group_id` exists, nullable, references groups
- [ ] `parent_transactions` accepts `'host_grant'`
- [ ] Every new child row carries the user's current group id (or NULL)

**Verification:** `npm test`; migration runs against existing db.sqlite

**Files:** `migrations/08_leaderboard.sql`, `src/db/transactions.ts`
**Scope:** S

## Task 2: Leaderboard db queries + tests

**Description:** Rewrite `src/db/leaderboard.ts`: `EARNING_KINDS` constant,
`listPlayerLeaderboard(state, board)` (role='user', per-board SUM, gambling
omits never-gamblers + returns gamesPlayed), `listGroupLeaderboard(state, board)`
(stamped sums + memberCount). Rewrite `src/db/leaderboard.test.ts` covering all
three boards, stamping immutability, and exclusions.

**Acceptance criteria:**

- [ ] Activity counts only positive `system`/`host_grant` deltas
- [ ] Gambling = signed net + gamesPlayed; zero-gambling users omitted
- [ ] Combined = net balance (players) / stamped net (groups)
- [ ] Group stamping: pre-join and post-leave coins count for no group

**Verification:** `npm test` green; mutation check on kind filter

**Files:** `src/db/leaderboard.ts`, `src/db/leaderboard.test.ts`
**Depends on:** Task 1 — **Scope:** M

## Task 3: Route params + matrix UI + translations + CSS

**Description:** `?board=activity|gambling|combined` + `?scope=players|groups`
with defaults; props union per scope; LeaderboardPage gets a board switcher +
scope toggle (both preserved in links); `.mwa-row--group` CSS; language keys
renamed/added for both locales.

**Acceptance criteria:**

- [ ] All six board×scope combos render correctly
- [ ] Self → `mwa-row--self` + You tag; groupmates → `mwa-row--group`
- [ ] Gambling board shows games-played; group rows show member count + score
- [ ] Links preserve board/scope across switches

**Verification:** `npm run lint` clean; page renders via route test

**Files:** `src/routes/pages/app.ts`, `src/client/pages/app/LeaderboardPage.tsx`,
`src/client/language.ts`, `static/style/shell.css`
**Depends on:** Task 2 — **Scope:** M

## Task 4: Route tests rewrite

**Description:** Rewrite `src/routes/pages/leaderboard.test.ts`: auth redirect,
param parsing/defaults, player ordering, self vs groupmate classes, games
column, group ordering, no email/phone leaks.

**Acceptance criteria:**

- [ ] Each board×scope combo has at least one assertion
- [ ] Defaults and unknown-param fallback covered

**Verification:** `npm test` green

**Files:** `src/routes/pages/leaderboard.test.ts`
**Depends on:** Task 3 — **Scope:** S

## Task 5: Docs + seed

**Description:** Rewrite `## Leaderboard` in `docs/architecture.md` (matrix,
allowlist, stamping, conservation argument). Stamp `group_id` in `src/seed.ts`
where the seeded user has a group.

**Acceptance criteria:**

- [ ] Docs describe all three boards and the stamping rule
- [ ] Seed produces nonzero group scores

**Verification:** `npm run seed` on fresh db; spot-check page

**Files:** `docs/architecture.md`, `src/seed.ts`
**Depends on:** Task 2 — **Scope:** S
