# Implementation Plan: Leaderboard — boards × scopes rework

## Overview

Rework `/app/leaderboard` into a board × scope matrix: three boards
(activity / gambling / combined) × two scopes (players / groups). Group
attribution comes from a new `child_transactions.group_id` stamped at insert
time. Spec: `SPEC-leaderboard.md`.

## Architecture Decisions

- **Earned = allowlist of minting kinds** (`system`, `host_grant`) — transfers,
  purchases, gambling never count on the activity board. Allowlist means new
  kinds are excluded by default.
- **`group_id` stamped inside `insertTransaction`** via `findUserGroup` — every
  call site (QR, gambling, transfers, future host grants) gets attribution
  automatically; stamping is immutable, so team-switching can't move coins.
- **New parent kind `host_grant`** added now (parent table rebuild, same
  pattern as `06_gambling.sql`) so future host grants count on activity.
- **`ALTER TABLE ... ADD COLUMN`** for `group_id` (nullable, no backfill) —
  no table rebuild needed for that column.
- **One board-filtered SUM** per query — `listPlayerLeaderboard(state, board)`
  and `listGroupLeaderboard(state, board)` share an `EARNING_KINDS`/kind-filter
  constant rather than three near-duplicate queries.
- **Players boards filter `role = 'user'`**; group boards rank groups.

## Task List

### Phase 1: Foundation

- [ ] Task 1: Migration + transaction stamping
- [ ] Task 2: Leaderboard db queries + db tests (all three boards)

### Checkpoint: Foundation

- [ ] `npm test` green, `npm run lint` clean

### Phase 2: Route + UI

- [ ] Task 3: Route params, props union, matrix UI, CSS, translations
- [ ] Task 4: Route tests rewrite

### Checkpoint: Route + UI

- [ ] `npm test` green; matrix renders all six board/scope combos

### Phase 3: Docs + seed

- [ ] Task 5: docs/architecture.md rewrite + seed `group_id` stamping

### Checkpoint: Complete

- [ ] All spec success criteria met; full suite + lint green

## Risks and Mitigations

| Risk                                              | Impact | Mitigation                                                                             |
| ------------------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| `parent_transactions` rebuild breaks gambling FKs | High   | Copy `06_gambling.sql` rebuild pattern exactly; run migration against seeded db.sqlite |
| Stamping inside `insertTransaction` misses a path | Med    | Single choke point by design; test asserts group_id on a fresh insert                  |
| `?type=` param change breaks old links            | Low    | Unknown values fall back to defaults (activity/players)                                |

## Open Questions

- None blocking — spec assumptions recorded in `SPEC-leaderboard.md`.
