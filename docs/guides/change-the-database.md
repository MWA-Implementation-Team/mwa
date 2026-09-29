# Guide: change the database

The schema lives in numbered SQL files under `migrations/`. On every server start,
`migrateDatabase()` (`src/db/migrate.ts`, called from `src/state.ts` on import) applies
new files in numeric order inside a transaction and records progress in the
`migration_status` table. `npm run dev`, `npm start`, and `npm run seed` all trigger it.

There are no down-migrations — schema changes only move forward. In dev, deleting the
database file is your undo button.

## 1. Write the migration

Create the next numbered file — `migrations/02_add_user_tagline.sql`:

```sql
ALTER TABLE "users" ADD COLUMN "tagline" TEXT NOT NULL DEFAULT '';
```

The number before the first `_` is the version (`02` → 2). Migrations run in that order,
each in a transaction — a failing statement rolls the file back and crashes the server
loudly, never leaves it half-applied.

## 2. Apply it

Restart the dev server (Ctrl+C, `npm run dev`). You'll see `[migrate] applied
02_add_user_tagline.sql` in the console.

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

1. Server log shows `[migrate] applied 02_add_user_tagline.sql` (files already applied
   are skipped silently — `current_version` gates them).
2. `sqlite3 db.sqlite "SELECT current_version FROM migration_status;"` → `2`.
3. `sqlite3 db.sqlite ".schema users"` → the new column is listed.
4. `npm run lint` — confirms the `User` type and its consumers agree.
