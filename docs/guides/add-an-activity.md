# Guide: add an activity

An activity is an irl station — it shows up as a card on `/app/activities` and gets a
detail page at `/app/activities/<slug>`. Unlike [adding a page](add-a-page.md), there is
**no route, no migration, no page registration**: the registry entry is all the wiring
an activity needs.

Two things to create/edit: a folder under `src/client/activities/`, and one line in
`registeredActivities`.

## 1. Create the station folder

Copy an existing station folder — `src/client/activities/<slug>/` holds three files:
`Card.tsx`, `Detail.tsx`, and `activity.ts`, which wires them into an `Activity`:

```ts
// src/client/activities/my-station/activity.ts
import type { Activity } from '#src/client/activities.js';
import { MyStationCard } from './Card.js';
import { MyStationDetail } from './Detail.js';

export const myStationActivity: Activity = {
    name: 'My Station',
    Card: MyStationCard,
    Detail: MyStationDetail,
};
```

```tsx
// src/client/activities/my-station/Card.tsx
import type { ActivityProps } from '#src/client/activities.js';

export function MyStationCard({}: ActivityProps) {
    return (
        <article class="card">
            <h2>My Station</h2>
            <p>A short pitch for the station goes here.</p>
        </article>
    );
}
```

```tsx
// src/client/activities/my-station/Detail.tsx
import type { ActivityProps } from '#src/client/activities.js';

export function MyStationDetail({ slug }: ActivityProps) {
    return (
        <>
            <h1>My Station</h1>
            <p>Unique decorations for {slug} go here.</p>
        </>
    );
}
```

Name the folder after the slug (`activities/miciaus-paradise/`) so url, folder, and
db row all spell the same thing.

What each field does:

- `name` — the station's display name. Used for the browser `<title>` and anywhere the
  app refers to the station generically. It's a proper noun — not translated.
- `Card` — rendered **inside an `<a>` link** on the activities list, so it doesn't need
  (or want) its own navigation.
- `Detail` — the whole page body below `<Header />` on `/app/activities/<slug>`. This is
  where the station's unique design lives.

Both components receive `ActivityProps` — currently just `{ slug }`. Shared data
(queue length, completions) will arrive through the same props for **every** station at
once; you never write per-station data loading.

## 2. Register the slug

In `src/client/activities.ts`, import the activity and add it:

```ts
import { myStationActivity } from '#src/client/activities/my-station/activity.js';

export const registeredActivities = {
    // ...existing stations,
    'my-station': myStationActivity,
} satisfies Record<string, Activity>;
```

The key is the **slug**: it's the url segment (`/app/activities/my-station`) _and_ the
row's primary key in the `activities` table. Rules:

- kebab-case — it's user-visible in urls.
- Not a bare number — integer-like keys (`'2028'`) sort to the front of
  `Object.entries`, which would move the station to the top of the list page
  regardless of where you put it in the registry. Prefix it (`'year-2028'`).
- The list page renders cards in registry order — place the entry where the station
  belongs in the lineup.
- Pick it once, keep it forever. Queue and badge rows will reference it; renaming a
  slug orphans them (slugs are inserted, never deleted).

`satisfies Record<string, Activity>` checks every entry at compile time — a missing
`Card` or a typo'd field is a lint error, not a runtime surprise.

## What you get for free

- a linked card on `/app/activities`,
- the detail page at `/app/activities/<slug>` (the generic route resolves the registry;
  an unknown slug is a 404),
- a row in the `activities` table — inserted by `syncActivities()` on the next server
  start, so queue/badge rows can foreign-key it,
- login redirect already works — `/app/activities/` is in `allowedGotoPrefixes`
  (`src/routes/pages/login.ts`).

## How to verify

1. `npm run lint` — catches unregistered/misconfigured entries.
2. `npm run dev`, log in as `alice`, open http://localhost:3000/app/activities — your
   card appears; clicking it lands on your detail page with tab title `MWA | My Station`.
3. `sqlite3 db.sqlite "SELECT slug FROM activities"` — your slug is a row.
4. http://localhost:3000/app/activities/not-a-station → 404.
