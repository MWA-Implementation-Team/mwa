# Guide: change the database

The schema lives in numbered SQL files under `migrations/`. On every server start,
`migrateDatabase()` (`src/db/migrate.ts`, called from `src/state.ts` on import) applies
new files in numeric order inside a transaction and records progress in the
`migration_status` table. `npm run dev`, `npm start`, and `npm run seed` all trigger it.

There are no down-migrations — schema changes only move forward. In dev, deleting the
database file is your undo button.

## 1. Write the migration

Name the file after the issue your change belongs to —
`migrations/31_add_user_tagline.sql` for issue #31, **not** "the next number":

```sql
ALTER TABLE "users" ADD COLUMN "tagline" TEXT NOT NULL DEFAULT '';
```

The number before the first `_` is the version (`31` → 31). Migrations run in ascending
order, each in a transaction — a failing statement rolls the file back and crashes the
server loudly, never leaves it half-applied.

Issue numbers are deliberate: two parallel branches both creating "the next" `02_*.sql`
collide — different filenames, so git merges them cleanly, but the migrator runs only
one (see the watermark rule below). Owning the issue number makes collision impossible
and tells you which PR introduced the file.

**If the issue doesn't exist yet, create it first.** The issue is the work's tracking
point anyway, and the filename is born with the right number — no renaming. If you're
spiking without an issue, a placeholder like `99_draft_thing.sql` works, but rename it
before merge and `rm db.sqlite` once locally: an already-applied file under a new name
counts as a new migration — skipped if the new number is below your watermark, re-run
(and likely crashing on `CREATE TABLE`) if above.

The filename must start with digits. `draft_thing.sql` parses as `NaN` and breaks the
migrator's version bookkeeping — any numeric prefix is valid, only text isn't.

**Watermark rule:** `migration_status` records the highest applied version; files at or
below it are skipped. Gaps are fine — `20`, `27`, `31` all apply in order on a fresh
db. The one edge case: if a _lower_-numbered migration merges after a higher one (`20_`
lands after `27_` is already applied), a dev's existing db skips it and usually crashes
later with `no such table`. Fix: delete `db.sqlite` and restart — see step 4.

## 2. Apply it

Restart the dev server (Ctrl+C, `npm run dev`). You'll see `[migrate] applied
31_add_user_tagline.sql` in the console.

Note: `dev.js` watches `dist/` and `static/`, **not** `migrations/` — adding a `.sql`
file alone won't restart anything. You must restart (or change a source file so the
rebuild restarts it).

## 3. Update the code

- `src/db/users.ts` — add `tagline: string;` to the `User` type. `SELECT *` queries pick
  the column up automatically; queries listing columns need the new field added.
- `src/seed.ts` — seed the new field if sample data should have it.

## 4. Reset entirely (dev only)

```shell
rm db.sqlite
npm run dev     # or: npm run seed — migrations run on import either way
```

Deleting `db.sqlite` is safe: the next start recreates every table from `migrations/`,
then `npm run seed` refills it. (`npm run seed` refuses to run while the `users` table
has rows — deleting the file is also how you reseed.)

## How to verify

1. Server log shows `[migrate] applied 31_add_user_tagline.sql` (files already applied
   are skipped silently — `current_version` gates them).
2. `sqlite3 db.sqlite "SELECT current_version FROM migration_status;"` → `31`.
3. `sqlite3 db.sqlite ".schema users"` → the new column is listed.
4. `npm run lint` — confirms the `User` type and its consumers agree.
