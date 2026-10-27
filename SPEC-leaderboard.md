# Spec: Leaderboard — boards × scopes rework

## Objective

Rework `/app/leaderboard` into a **board × scope matrix**: three boards
(activity, gambling, combined), each viewable as _players_ or _groups_.
Replaces the current two tabs (`team`, `group`).

| Board    | Players                              | Groups                                           |
| -------- | ------------------------------------ | ------------------------------------------------ |
| activity | lifetime earned (minted kinds)       | coins earned while members belonged to the group |
| gambling | net gambling win/loss + games played | members' net gambling while in the group         |
| combined | net balance (all kinds, all deltas)  | net of all deltas earned while in the group      |

Group scores are attributed at transaction time via a `group_id` stamp on
`child_transactions`, so switching groups never moves past earnings — the
anti-abuse property behind this rework.

Only `role = 'user'` accounts appear on the player boards — admins and hosts
are excluded from rankings (their grants/purchases shouldn't compete).
Group boards are unaffected: they rank groups, not people.

### Board definitions

- **activity** — coins _minted into the economy_: positive `balance_delta` whose
  parent kind is in the allowlist `('system', 'host_grant')`. Never counts
  `transfer`, `purchase`, or `gambling_*` (player-to-player movement and
  zero-cost stat pumping). Allowlist, not denylist: future kinds are excluded
  by default.
- **gambling** — net of `gambling_deduction` + `gambling_winnings` (signed, can
  be negative). Ranked by net desc; every user with ≥1 gambling delta is listed
  and a games-played column is shown (users with ≥N games aren't privileged —
  the count just gives readers context).
- **combined** — net of **all** deltas: the player's actual balance; for
  groups, the sum of everything stamped to them. Zero-sum actions can't
  inflate it (transfers/gambling just move coins), which is worth stating in
  docs.

### The `host_grant` kind

Hosts will get "send money" (scan user QR → grant) and "send money to group"
actions. Those grants are the primary activity-score source and must be
distinguishable from player `transfer`s → dedicated parent kind `host_grant`.
Nothing emits it yet — added now so scoring is complete when the feature lands.

When send-to-group ships, it creates **N individual `host_grant` records** via
the same code path as a single-user grant — indistinguishable from manual
grants. Chosen over one parent + N children for simplicity; the trade-off is
losing batch identity (a group grant can't later be listed or voided as one
action — acceptable today, a nullable `batch_id` column retrofits it if needed).

## Tech Stack

Existing: Hono + Preact SSR (`writePage` props → `#ssr-data`), `node:sqlite`
STRICT tables, numbered SQL migrations in `migrations/`, `node:test` on `dist/`.

## Commands

```
Build: npm run build
Test:  npm test            (rebuilds dist, runs node --test on dist/**/*.test.js)
Lint:  npm run lint        (tsc --noEmit + prettier --check)
Dev:   npm run dev         (:3000)
Seed:  npm run seed        (delete db.sqlite first to reseed)
```

## Changes

### Migration `migrations/08_leaderboard.sql`

- `ALTER TABLE child_transactions ADD COLUMN group_id INTEGER REFERENCES groups(id)`
  — nullable, no backfill. Coins before this ships (or while groupless) count
  for no group.
- Rebuild `parent_transactions` to extend the `kind` CHECK with `'host_grant'`
  (same rebuild pattern as `06_gambling.sql`).

### `src/db/transactions.ts`

- `TransactionKind` += `'host_grant'`.
- `insertTransaction` looks up the user's group (`findUserGroup`) at insert
  time and stamps `child_transactions.group_id` — every call site gets
  attribution automatically.

### `src/db/leaderboard.ts` — rewritten

Shared constant `EARNING_KINDS = ['system', 'host_grant']`. Queries:

- `listPlayerLeaderboard(state, board)` → all `role = 'user'` users with
  `score` = per-board SUM over `child_transactions`:
    - activity: positive deltas, kind in `EARNING_KINDS`
    - gambling: all deltas, kinds in `('gambling_deduction','gambling_winnings')`,
      plus `gamesPlayed` = count of the user's `gambling_deduction` child rows
      (one per session they staked in); users with zero gambling rows are
      omitted from this board
    - combined: all deltas (net balance)
    - order `score DESC, username` (username column is already NOCASE)
- `listGroupLeaderboard(state, board)` → all groups with `memberCount` and
  `score` = SUM over `child_transactions` **stamped to that group**
  (`ct.group_id = groups.id`), same per-board delta/kind filter;
  order `score DESC, name COLLATE NOCASE`. Groups with no stamped rows show 0.
- Delete the old per-group member `listGroupLeaderboard(state, groupId)` — the
  players scope replaces it.

### `src/routes/pages/app.ts`

- Params: `?board=activity|gambling|combined` (default `activity`) and
  `?scope=players|groups` (default `players`); unknown values fall back to
  defaults.
- Props: `{ board } & ({ scope:'players', rows, groupId } | { scope:'groups', groups })`
  — `groupId` is the viewer's group id or `null`, used only to highlight
  groupmate rows on player boards.

### `LeaderboardPage.tsx`

- Board switcher (3 options) + scope switcher (players/groups) in the existing
  `mwa-tabbar` style; both preserve each other in the links.
- Player rows: rank, username, score; gambling adds games-played; self →
  `mwa-row--self` + "You" tag; other groupmates → `mwa-row--group`.
- Group rows: rank, name, member count, score.
- Props stay a per-scope union (existing pattern).

### `static/style/shell.css`

- `.mwa-row--group` — subtler than `--self` (e.g. accent border/text tint).

### Language, docs, seed

- Keys: `leaderboardActivity`, `leaderboardGambling`, `leaderboardCombined`,
  `leaderboardPlayers`, `leaderboardGroups`, `leaderboardGames` (LT:
  "aktyvumas"/"lošimai"/"viskas", "žaidėjai"/"grupės", "žaidimai");
  `leaderboardTeam`/`leaderboardGroup` removed. Keep `leaderboardYou`,
  `leaderboardMemberCount`, `leaderboardNoGroup` (still used when the viewer
  has no group for highlighting), `leaderboardNoGroups`.
- Rewrite `## Leaderboard` in `docs/architecture.md`: board matrix, earned
  allowlist, `group_id` stamping, why zero-sum boards can't be inflated.
- `src/seed.ts`: stamp `group_id` on seeded children where the user has a
  group.

## Code Style

Match `src/db/leaderboard.ts`: prepared queries, snake_case→camelCase mapping,
`as` casts on `SQLOutputValue`, terse comments only where the why isn't obvious.

## Testing Strategy

`node:test` + `assert/strict` in `src/**/*.test.ts`.

- `src/db/leaderboard.test.ts` — rewritten per board:
  activity excludes transfer/purchase/gambling and negatives; gambling nets
  wins/losses signed, counts games, omits never-gamblers; combined = net
  balance; group stamping: earnings before joining count for no group, leaving
  doesn't move past earnings; ordering + NOCASE ties; zero-score groups listed.
- `src/routes/pages/leaderboard.test.ts` — rewritten:
  auth redirect; board/scope param parsing + defaults; player order; groupmate
  vs self classes; games column on gambling; group rows; no email/phone leaks.
- Mutation check on the kind filters before merge.

## Boundaries

- **Always:** tests + lint green before commit; docs and both locales updated
  in the same PR; small scoped commits (repo style: lowercase imperative).
- **Ask first:** schema changes (approved here per request), new transaction
  kinds beyond `host_grant`, widening `EARNING_KINDS`.
- **Never:** count transfer/gambling/purchase toward activity; backfill
  `group_id`; let team switching move past earnings.

## Success Criteria

- [ ] `/app/leaderboard` shows the matrix: board switcher + scope toggle, both
      preserved in URLs, sane defaults.
- [ ] Activity board: only `system`/`host_grant` positives count — transfer and
      gambling ping-pong moves nothing on it.
- [ ] Gambling board: signed net per user + games played, all gamblers listed.
- [ ] Combined board: player = current balance; group = stamped net.
- [ ] Group switching moves no stamped coins; ungrouped coins count nowhere.
- [ ] `npm test`, `npm run lint` green; docs + both locales updated.

## Deferred: abuse detection (return later)

Not in this change — recorded so it isn't lost. The data already supports it:
transfer/gambling deltas share a `parent_id`, and `gambling_sessions` stores
`p1`/`p2`. Candidate detections: transfer ping-pong (high pair count, ~zero
net), one-way mule feeding (inflow concentrated on 1–2 counterparties),
gambling ping-pong (same pair, many sessions, alternating winners). Planned
shape: `src/db/abuse.ts` pure query functions (pair, count, volume, net,
concentration) → rendered as a flagged-pairs table on `/app/admin` (preferred)
or `console.warn` logging as a cheaper interim. Note the boards are already
inflation-resistant: zero-sum kinds can't move net boards, and the activity
allowlist excludes them entirely — detection is for spotting _collusion_, not
arithmetic inflation.

## Open Questions

1. `system` QR earnings count on the activity board (assumed yes — event-minted
   activity coins; nothing emits them yet anyway).
2. `host_grant` kind added now vs. when send-money ships — assumed add now, one
   migration covers both.
3. ~~Boards list all users~~ — resolved: `role = 'user'` only; admins/hosts excluded.
4. Gambling group scope = members' stamped nets — reasonable default under the
   matrix; could also hide the scope toggle there.
5. `gamesPlayed` = count of `gambling_deduction` rows (sessions staked) —
   assumed; alternative is joining `gambling_sessions` for ended-only.
6. Out of scope: host send-money/group-grant actions, abuse detection.
