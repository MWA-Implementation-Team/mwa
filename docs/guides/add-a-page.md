# Guide: add a page

Worked example: a `/app/badges` page that will list badges. This guide gets the page on
screen with static content; [load-data-in-a-page](load-data-in-a-page.md) puts real data
on it.

A page needs four things: a component, a `registeredPages` entry, a route, and a nav
link (plus translations).

## 1. Create the component

Create `src/client/pages/app/BadgesPage.tsx`:

```tsx
import PageShell from '#src/client/pages/app/PageShell.js';
import { Page } from '#src/client/pages.js';

type BadgesPageProps = {};

export const badgesPage: Page<BadgesPageProps> = {
    Component: BadgesPage,
    title: (t) => t('titleBadges'),
};

function BadgesPage({}: BadgesPageProps) {
    return (
        <PageShell section="badges">
            <section class="mwa-wiki-panel">
                <div class="mwa-wiki-panel-head">
                    <h2>Badges</h2>
                </div>
                <div class="mwa-wiki-panel-body">
                    <p class="mwa-wiki-muted">TODO: list badges here.</p>
                </div>
            </section>
        </PageShell>
    );
}
```

Every page exports a `Page<P>` object: `Component` renders the body, and
`title(t, props, lang)` produces the `<title>` — it runs on the server (in `writePage`)
and again in the browser when the language changes.

## 2. Register the page id

In `src/client/pages.ts`, import the page and add it to `registeredPages`:

```ts
import { badgesPage } from '#src/client/pages/app/BadgesPage.js';
```

The key (`badges`) is the page id you'll pass to `writePage`. It's typechecked — a typo
is a compile error, not a 404.

## 3. Add the route

In `src/routes/pages/app.ts`, next to the other `/app/*` routes. Its registration
function accepts `MwaHono`, so handlers receive the `MwaContext` expected by guards
and `writePage`. For a new route module, use the same type and register it in
`main.ts` after `setupHonoState(app, state)`:

```ts
app.get('/app/badges', async (ctx) => {
    const user = requireUser(ctx);
    if (user instanceof Response) return user;

    return writePage(ctx, 'badges', {});
});
```

`requireUser` (from `src/auth.ts`) returns the logged-in `User`, or a login
redirect for anonymous visitors — `instanceof Response` picks between them. For
staff-only pages use `requireRole(ctx, 'admin')` instead — wrong roles get a 403
page. See [auth](auth.md) for the full guard list and route policy.

## 4. Add a nav link

In `src/client/pages/app/PageShell.tsx`, add `'badges'` to the `Section` union
type, then add an entry to the `navigation` array:

```tsx
{ section: 'badges', label: t('headerBadges'), href: '/app/badges' },
```

The `section` prop controls which link gets `aria-current="page"`.

## 5. Add translations

In `src/client/language.ts`, add the keys to the `Language` type:

```ts
titleGambling: string;
titleBadges: string;
titleError: string;
```

then to `headerBadges` in the same type, and finally a value in **both** `en` and `lt`
(`Record<LanguageCode, Language>` forces completeness — forgetting one is a compile
error):

```ts
// en
titleBadges: 'first years | Badges',
headerBadges: 'Badges',

// lt
titleBadges: 'first years | Ženkleliai',
headerBadges: 'Ženkleliai',
```

## 6. Login redirect — nothing to do

`safeGoto` (`src/routes/pages/login.ts`) accepts any normalized same-origin path,
so a logged-out visitor who clicked `/app/badges` is sent to `/login` with
`?goto=/app/badges` and lands back on the page after logging in. There's no
allowlist to update.

## How to verify

1. `npm run lint` — catches unregistered ids, missing translation keys, unused imports.
2. `npm run dev`, log in (see [auth](auth.md) — the link is in the server console),
   open http://localhost:3000/app/badges — the page renders and the browser tab
   shows `first years | Badges`.
3. `curl -s -b cookies.txt http://localhost:3000/app/badges` (mint `cookies.txt` via
   the verify flow in [auth](auth.md)) and search the HTML for `"pageId":"badges"`
   inside the `<script id="ssr-data">` tag — that confirms the right page id was
   serialized for hydration.
4. Click the **Badges** nav link — a full page load lands on the new page.
5. In an incognito window, open `/app/badges` — you're redirected to
   `/login?goto=/app/badges`; after logging in you land back on `/app/badges`.
6. Toggle the language selector — the nav label and tab title switch without reload.

Next: [put real data on the page](load-data-in-a-page.md).
