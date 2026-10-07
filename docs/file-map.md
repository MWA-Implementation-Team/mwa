# File map

What the important files are for — deliberately **not** every file. This map lists the
**stable skeleton**: files that rarely change and define how the app is wired. Files
you'll add and edit routinely — page components, db domain modules, route files, UI
components — aren't listed individually; they churn too fast for a map to stay accurate,
so each directory entry describes what goes inside instead. Self-explanatory files
(images, `robots.txt`) are skipped entirely.

```
.
├── dev.js                     dev launcher: build, run server, watch+restart, browser reload
├── package.json               npm scripts + "#src/*" → "./dist/*" import alias for Node
├── tsconfig.json              strict TS, JSX → preact, "#src/*" → "./src/*" for tsc
├── Dockerfile                 two-stage build: compile TS, run dist/main.js
├── AGENTS.md                  project conventions — read before contributing
├── .github/workflows/ci.yml   CI: npm ci + npm run lint
│
├── migrations/                numbered SQL files, applied in order on every server start
│                              (run by src/db/migrate.ts, progress tracked in migration_status database table)
│
├── static/                    files served as-is
│   ├── oat.css                Oat CSS framework — third-party, editable if needed
│   ├── oat.js                 Oat CSS framework JS, minified, don't edit
│   ├── style/main.css         stylesheet entry point; imports tokens, base, components
│   ├── style/tokens.css       design tokens and Oat variable overrides
│   ├── style/base.css         document-wide defaults and app shell layout
│   ├── style/components/      one stylesheet per reusable component or component family
│   └── reload.js              dev-only auto-reload client
│
└── src/
    ├── main.ts                Hono app: registers routes, static serving, 404/500 handlers
    ├── pages.tsx              writePage() + Root: the SSR document shell, importmap, ssr-data
    ├── state.ts               isDevMode flag + shared db handle; runs migrations on import
    ├── auth.ts                currentUser(ctx): mwa-username cookie → User | null
    ├── seed.ts                `npm run seed` — sample data; refuses if users exist
    │
    ├── db/                    one module per domain: row type + prepared statements + functions
    │   └── migrate.ts         the migrator — reads migrations/*.sql, applies what's new
    ├── routes/                one file per route group, each exporting register*Routes(app)
    │   ├── pages/             HTML routes — handlers end in writePage()
    │   └── api/               JSON routes — handlers end in ctx.json()
    └── client/                code that also runs in the browser
        ├── bootstrap.tsx      browser entry: reads #ssr-data, hydrates #app
        ├── pages.ts           registeredPages: page id → { Component, title }
        ├── activities.ts      registeredActivities: activity slug → { name, Card, Detail }
        ├── context.tsx        ClientContext: lang, updateLang, t(), user
        ├── language.ts        translations (en, lt) + translate() / t()
        ├── constants.ts       cookie names (mwa-username, mwa-language, mwa-theme-override)
        ├── api/               fetch wrappers + type-only re-exports of db types
        ├── activities/        one slug-named folder per station (Card + Detail + activity.ts)
        ├── pages/             one component per page, each a Page<P> object
        └── ui/                shared components (header, toggles, icons)

Generated, gitignored:  dist/   tsc output — served to the browser at /client/*
                        db.sqlite   local database, created on first run
```

## Conventions worth knowing

- `src/client/` is shared by server render and browser hydration — that's why "client"
  files import from `src/db/*` only via `import type` (see `client/api/users.ts`).
