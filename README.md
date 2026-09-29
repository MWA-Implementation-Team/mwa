## Requirements

Node.js v24. Check that you have it, not an older version:

```shell
$ node --version
v24.19.0
```

## Quickstart

```shell
npm install
npm run seed   # optional: sample data (users alice, bob, carol, admin, host)
npm run dev
```

Visit http://localhost:3000/ — log in as `alice` (no password; this is dev-only cookie
auth, see [docs/guides/auth-in-dev.md](docs/guides/auth-in-dev.md)).

## Commands

| command          | what it does                                                             |
| ---------------- | ------------------------------------------------------------------------ |
| `npm run dev`    | build, serve on :3000, restart on changes, auto-reload browser tabs      |
| `npm run build`  | compile `src/` → `dist/` with tsc                                        |
| `npm start`      | run the compiled server (`dist/main.js`, production mode)                |
| `npm run seed`   | fill `db.sqlite` with sample data (no-op if the users table isn't empty) |
| `npm run lint`   | typecheck + prettier check — what CI runs                                |
| `npm run format` | auto-format everything with prettier                                     |

## Documentation

- [docs/architecture.md](docs/architecture.md) — how a request becomes a hydrated page
  (**advanced** — read only if you want deep understanding; the guides don't require it)
- [docs/file-map.md](docs/file-map.md) — what the important files and folders are for
- Guides (one worked example — a badges feature — runs through all of them):
    - [docs/guides/add-a-page.md](docs/guides/add-a-page.md)
    - [docs/guides/add-an-api-endpoint.md](docs/guides/add-an-api-endpoint.md)
    - [docs/guides/load-data-in-a-page.md](docs/guides/load-data-in-a-page.md)
    - [docs/guides/change-the-database.md](docs/guides/change-the-database.md)
    - [docs/guides/auth-in-dev.md](docs/guides/auth-in-dev.md)
    - [docs/guides/i18n-and-styling.md](docs/guides/i18n-and-styling.md)
- [docs/workflow/making-a-pull-request.md](docs/workflow/making-a-pull-request.md)
- [docs/troubleshooting.md](docs/troubleshooting.md) — real errors and their fixes
- [docs/glossary.md](docs/glossary.md) — hydration, SSR, importmap, and friends
