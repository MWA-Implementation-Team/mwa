# Troubleshooting

Errors that have actually bitten people on this repo.

## `Error: listen EADDRINUSE: address already in use :::3000`

Something still holds the port — usually a dev server that didn't die (or a second
`npm run dev` in another terminal). Find what's holding it and kill it:

**macOS / Linux**

```shell
lsof -i :3000        # note the PID
kill <PID>
```

**Windows — PowerShell**

```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
Stop-Process -Id <PID>
```

**Windows — cmd.exe**

```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Same error on port **3001** means `dev.js`'s reload server — kill the whole `npm run
dev` process (it owns both ports), don't just kill node.

## `npm run seed` prints "Database already has N user(s)" and exits

Working as designed — `src/seed.ts` refuses to run on a non-empty `users` table. To
reseed:

```shell
rm db.sqlite
npm run seed
```

Deleting `db.sqlite` is safe: `migrateDatabase()` recreates the schema from
`migrations/` on the next start (see
[change-the-database](guides/change-the-database.md)).

## Server crashes with `no such table` right after switching branches

Your `db.sqlite` was built by a different set of migrations than this branch has.
`migration_status` only stores the highest applied version number, so a migration file
numbered _below_ that watermark gets skipped even though it's new — then some
`db/*.ts` module prepares a query against a table that was never created and crashes
at startup.

`db.sqlite` is disposable dev data — recreate it:

```shell
rm db.sqlite
npm run dev        # migrations rebuild the schema
npm run seed       # optional: refill sample data
```

This is the known trade-off of issue-numbered migration filenames — see the watermark
rule in [change-the-database](guides/change-the-database.md).

## The page renders but buttons do nothing / toggles don't work

Hydration failed. Open the browser console.
