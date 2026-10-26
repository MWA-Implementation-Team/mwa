# Guide: translations and styling

## Translations

All UI text goes through `t()` from `ClientContext` — never hardcode strings in
components.

```tsx
import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';

const { t } = useContext(ClientContext);
// ...
<h1>{t('homeWelcome', { name: user.username })}</h1>;
```

Keys and values live in `src/client/language.ts`. To add a string:

1. Add the key to the `Language` type (e.g. `headerBadges: string;`).
2. Add a value in **every** entry of `languages` — `Record<LanguageCode, Language>`
   makes a missing translation a compile error, so `npm run lint` catches it.
3. Placeholders are `{name}`-style and filled by `t(key, params)`.

For JSX placeholders, use `Trans` from `src/client/ui/Trans.tsx`, e.g.
`<Trans id="gamblingCoinFlipBetOutcome" values={{ amount: <strong>10</strong> }} />`.
It inserts Preact children without parsing HTML; missing placeholders stay literal.

Missing keys in a non-default language fall back to English
(`languages[lang]?.[key] || languages[defaultLanguage][key]`) — but since the type
forces all keys to exist, this mainly guards against future partial languages.

**Page titles** are translated via each page's `title(t, props, lang)` function — not
inside the component. It runs server-side for the `<title>` tag in `writePage`, and
`ClientContextWrapper` re-runs it in an effect whenever the language changes, so
`document.title` stays in sync.

Pages with live titles can set `customTitle: true` to skip the wrapper's title
effect and manage it themselves, as `GamblingSessionPage` does for session updates.

**Switching language**: `LanguageToggle` writes the `mwa-language` cookie and calls
`updateLang`. `updateLang` re-renders all `t()` output instantly; the cookie makes the
_next_ SSR response (navigations, reloads) use the same language — `writePage` reads it
into `ctxInit.lang`.

## Server responses and emails

Server code uses `translate(getRequestLanguage(ctx))` from
`src/client/language.ts` and `src/utils.ts` for plain-text responses such as a
malformed login request. For errors rendered in a page, pass a translation key
instead of a translated string: login routes pass `errorKey: 'loginInvalidEmail'`,
and `LoginPage` renders `t(errorKey)`. This keeps SSR and hydration consistent and
lets the language selector update an existing error without a reload.

Login emails receive `lang` from the request cookie. `loginSubject(lang)`,
`LoginEmail(props)`, and `loginText(props)` use the same dictionary for the subject,
HTML, and plain text, including console-mailer output. Email content stays in the
language selected when it was sent.

API error identifiers (`unauthorized`, `forbidden`) and server diagnostics remain
stable identifiers/logs. Translate the user-facing message where it is displayed.

## Styling

Two stylesheets load on every page (see `Root` in `src/pages.tsx`):

- `/oat.css` — the [Oat.](https://oat.ink) CSS framework: a classless-ish base theme with
  CSS variables. It's third-party — edit only if absolutely necessary.
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
