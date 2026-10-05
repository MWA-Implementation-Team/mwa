# Guide: add a page

Worked example: a `/app/badges` page that will list badges. This guide gets the page on
screen with static content; [load-data-in-a-page](load-data-in-a-page.md) puts real data
on it.

A page needs four things: a component, a `registeredPages` entry, a route, and a nav
link (plus translations and, for pages under `/app`, a `goto` allowlist entry).

## 1. Create the component

Create `src/client/pages/app/BadgesPage.tsx`:

```tsx
import Header from '#src/client/ui/Header.js';
import { Page } from '#src/client/pages.js';

type BadgesPageProps = {};

export const badgesPage: Page<BadgesPageProps> = {
    Component: BadgesPage,
    title: (t) => t('titleBadges'),
};

function BadgesPage({}: BadgesPageProps) {
    return (
        <>
            <Header />

            <h1>Badges</h1>
            <p>TODO: list badges here.</p>
        </>
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

```ts
export const registeredPages = {
    landing: landingPage,
    login: loginPage,
    home: homePage,
    casino: casinoPage,
    badges: badgesPage,
    error: errorPage,
} satisfies Record<string, Page<any>>;
```

The key (`badges`) is the page id you'll pass to `writePage`. It's typechecked — a typo
is a compile error, not a 404.

## 3. Add the route

In `src/routes/pages/app.ts`, next to the other `/app/*` routes:

```ts
app.get('/app/badges', async (ctx) => {
    if (!currentUser(ctx)) return goLogin(ctx);

    return writePage(ctx, 'badges', {});
});
```

`goLogin` is the existing helper that redirects logged-out visitors to
`/login?goto=<path>`.

## 4. Add a nav link

In `src/client/ui/Header.tsx`, inside the `<ul>`:

```tsx
<li>
    <a href="/app/badges">{t('headerBadges')}</a>
</li>
```

## 5. Add translations

In `src/client/language.ts`, add the keys to the `Language` type:

```ts
titleCasino: string;
titleBadges: string;
titleError: string;
```

then to `headerBadges` in the same type, and finally a value in **both** `en` and `lt`
(`Record<LanguageCode, Language>` forces completeness — forgetting one is a compile
error):

```ts
// en
titleBadges: 'MWA | Badges',
headerBadges: 'Badges',

// lt
titleBadges: 'MWA | Ženkleliai',
headerBadges: 'Ženkleliai',
```

## 6. Allow it as a login redirect

In `src/routes/pages/login.ts`, add the path to `allowedGotos`:

```ts
const allowedGotos = new Set<string>(['/app', '/app/casino', '/app/badges']);
```

Without this, a logged-out visitor who clicked `/app/badges` gets sent to `/login`, but
the `goto` parameter is dropped — after logging in they'd land on `/app` instead of
back on the badges page.

## How to verify

1. `npm run lint` — catches unregistered ids, missing translation keys, unused imports.
2. `npm run dev`, log in as `alice`, open http://localhost:3000/app/badges — the page
   renders and the browser tab shows `MWA | Badges`.
3. `curl -s -b 'mwa-username=alice' http://localhost:3000/app/badges` and search the HTML
   for `"pageId":"badges"` inside the `<script id="ssr-data">` tag — that confirms the
   right page id was serialized for hydration.
4. Click the **Badges** nav link — a full page load lands on the new page.
5. In an incognito window, open `/app/badges` — you're redirected to
   `/login?goto=/app/badges`; after logging in you land back on `/app/badges`.
6. Toggle the language selector — the nav label and tab title switch without reload.

Next: [put real data on the page](load-data-in-a-page.md).
