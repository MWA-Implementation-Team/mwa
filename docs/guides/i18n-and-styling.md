# Guide: translations and styling

## Translations

All UI text goes through `t()` from `ClientContext` — never hardcode strings in
components.

```tsx
import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';

const { t } = useContext(ClientContext);
// ...
<h1>{t('appWelcome', { name: user.username })}</h1>;
```

Keys and values live in `src/client/language.ts`. To add a string:

1. Add the key to the `Language` type (e.g. `headerBadges: string;`).
2. Add a value in **every** entry of `languages` — `Record<LanguageCode, Language>`
   makes a missing translation a compile error, so `npm run lint` catches it.
3. Placeholders are `{name}`-style and filled by `t(key, params)`.

Missing keys in a non-default language fall back to English
(`languages[lang]?.[key] || languages[defaultLanguage][key]`) — but since the type
forces all keys to exist, this mainly guards against future partial languages.

**Page titles** are translated via each page's `title(t, props, lang)` function — not
inside the component. It runs server-side for the `<title>` tag in `writePage`, and
`ClientContextWrapper` re-runs it in an effect whenever the language changes, so
`document.title` stays in sync.

**Switching language**: `LanguageToggle` writes the `mwa-language` cookie and calls
`updateLang`. `updateLang` re-renders all `t()` output instantly; the cookie makes the
_next_ SSR response (navigations, reloads) use the same language — `writePage` reads it
into `ctxInit.lang`.

## Styling

Two stylesheets load on every page (see `Root` in `src/pages.tsx`):

- `/oat.css` — the [Oat.](https://oat.ink) CSS framework: a classless-ish base theme with
  CSS variables. It's third-party and minified — **don't edit it**.
- `/style/main.css` — **your** stylesheet entry point
  (`static/style/main.css`). It imports tokens, base styles, and component styles.

The CSS layers are:

- `static/style/tokens.css` — shared design tokens and app-facing aliases for Oat
  variables;
- `static/style/base.css` — document-wide defaults, media rules, and the `#app`
  layout;
- `static/style/components/` — one stylesheet per reusable component or component
  family, imported by `main.css`.

See [css-architecture](css-architecture.md) for the full layering convention,
component examples, and how to override Oat styles without editing `oat.css`.

Since `static/` changes trigger a browser reload without a server restart, CSS edits
show up immediately in dev.

**Theming**: oat.css colors everything through `light-dark()`. The `ThemeToggle` sets
the `mwa-theme-override` cookie and flips `document.body.style.colorScheme`; on the
next SSR render `Root` reads that cookie and inlines the same `color-scheme` on
`<body>` — so the choice survives reloads and matches on both server and client.

## How to verify

1. Add a key to the `Language` type only → `npm run lint` fails; add it to `en` and `lt`
   → passes.
2. Toggle the language selector — visible text and the tab title switch instantly, and
   a reload keeps the language (cookie).
3. Add a rule to `static/style/main.css`, save — the page reloads with it applied.
4. Click the theme toggle → colors flip; check the `mwa-theme-override` cookie in
   DevTools; reload → the theme sticks.
