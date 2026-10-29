# Guide: CSS architecture

Two stylesheets load on every page (see `Root` in `src/pages.tsx`):

- `/oat.css` (`static/oat.css`) — our fork of the [Oat](https://oat.ink) framework. It
  holds the theme (colours, font, radius, spacing scale) and the look of plain
  elements: links, buttons, inputs, tables, `.card`, dialogs.
- `/style/main.css` (`static/style/main.css`) — the app's own styles, split into
  tokens, base and components.

All of Oat's rules sit inside `@layer`. The app CSS is not layered, so it always wins
over Oat. You never need `!important` or extra selectors to beat Oat.

The approach is **Oat first**: style plain HTML through Oat, and write app CSS only for
things Oat doesn't have.

## Where a style goes

Go down this list and stop at the first match:

1. **A theme value** that plain elements use (a colour, the font, a radius, the
   spacing scale) → change the variable in `oat.css`, `@layer theme { :root { … } }`.
2. **How a plain element looks everywhere** (every button, every input, every link)
   → edit Oat's rule for it in `oat.css`.
3. **A value only app components use** (panel header background, note colours,
   transaction bar colours) → add a token to `static/style/tokens.css`.
4. **A component Oat doesn't have** → a file in `static/style/components/`.
5. **The page frame** (`.mwa` root, backdrop, skip link, `.mwa-frame`, logo) →
   `static/style/base.css`.

Before you write a new class, check whether Oat markup already does the job:

| Need                     | Use                                                                        |
| ------------------------ | -------------------------------------------------------------------------- |
| Primary button           | a plain `<button>` (every button is primary by default)                    |
| Destructive / quiet one  | `data-variant="danger"` / `data-variant="secondary"`, `.outline`, `.ghost` |
| Link that looks a button | `<a class="button">`                                                       |
| Table with h-scroll      | `<div class="table"><table>…</table></div>`                                |
| Card surface             | `.card`                                                                    |

## Editing `oat.css`

`oat.css` is a fork, so editing it is allowed, but every edit has to be easy to find:

- Mark each edit with a `/* mwa: <reason> */` comment on the line or directly above
  the block. `grep -n "mwa:" static/oat.css` must list every change we made.
- Prefer changing a variable to changing a rule.
- Keep Oat's structure. Don't reformat, reorder or delete Oat rules you aren't
  changing, so upstream updates stay mergeable.
- The site is dark-only for now: `:root` has `color-scheme: dark`. Change the
  **second** (dark) argument of `light-dark()`. Leave the first (light) argument at
  Oat's value; it gets real values when the light theme lands.
- stylelint doesn't check `oat.css`. Review its diffs by hand.

## Files

| File                       | Contains                                                          |
| -------------------------- | ----------------------------------------------------------------- |
| `static/oat.css`           | forked Oat: theme variables + plain-element styles                |
| `static/style/main.css`    | `@import`s only — the one place `@import` is allowed              |
| `static/style/tokens.css`  | app-only tokens; the only app file that may contain raw colours   |
| `static/style/base.css`    | `@font-face` for Montserrat, `.mwa` frame, skip link, logo        |
| `static/style/components/` | one file per component family (`panel`, `note`, `tx`, `landing`…) |
| `static/fonts/`            | self-hosted `.woff2` files                                        |
| `static/img/`              | self-hosted images (backdrop, activity card art)                  |

`main.css` imports tokens, then base, then the components in a fixed order. A new
component file goes at the end of the list, unless it has to override an earlier one.

## Tokens

Use Oat's variables first:

- `--background`, `--foreground` — page background and body text
- `--card` — panel surface; `--muted` — lighter inset surface (notes, menu items)
- `--muted-foreground` — secondary text; `--primary` — links and emphasised text
- `--border` — panel borders; `--ring` — focus outline and button border
- `--danger`, `--success`, `--warning` — status colours

Add an app token to `tokens.css` only when none of those fits. Name it for what it's
for (`--note-error-bg`), not for what it looks like (`--dark-red`).

Sizes come from Oat's scales:

- spacing: `--space-1` (4px) … `--space-18`; for a 2px nudge use
  `calc(var(--space-1) / 2)`
- text: `--text-8` (12px), `--text-7` (14px), `--text-regular` (15px, body),
  `--text-6` (16px), `--text-5` … `--text-1`
- radius: `--radius-small`, `--radius-medium`

`font-size`, `padding`, `margin`, `gap` and `border-radius` must not use `px`. Border
widths, shadow offsets, layout widths and heights, and media query breakpoints may.

When the light theme arrives, the colours in `tokens.css` become `light-dark()` pairs.
Nothing else should need to change, which is why components may not contain raw
colours.

## Components

- **Naming:** kebab-case. `mwa-<block>`, `mwa-<block>-<part>`, `mwa-<block>--<modifier>`
  (`mwa-note`, `mwa-panel-head`, `mwa-note--error`). The landing sidebar uses
  `landing-*`; activity font classes are the activity's folder name.
- **Selectors:** keep them flat. One class is best. No IDs, specificity at most
  `0,3,1`, nesting at most one level.
- **Don't scope under the `.mwa` wrapper:** write `.mwa-panel`, not
  `.mwa .mwa-panel`. App CSS already beats Oat, so the extra ancestor only adds
  specificity. This is about the wrapper selector, not the `mwa-` start of class
  names, which is the required naming. The one exception is the
  `.mwa :where(h1, …)` margin reset in `base.css`; `:where()` keeps it at zero
  specificity.
- **No inline styles:** no `style=` in `src/client/` components. Activity card art in
  `src/client/activities/` is exempt for now. Emails (`src/emails/`) need inline
  styles, so they're exempt too.
- **No dead classes:** when you remove the last use of a class, delete its CSS. Lint
  fails on a CSS class that `src/` doesn't use, and on a class that `src/` uses but
  no stylesheet defines.
- **Comments:** explain why a rule exists when it isn't obvious. Delete a comment
  when it stops being true.

Adding a component:

1. Create `static/style/components/badge-list.css`:

    ```css
    .mwa-badge-list {
        display: flex;
        gap: var(--space-2);
        color: var(--muted-foreground);
        font-size: var(--text-7);
    }
    ```

2. Add `@import './components/badge-list.css';` to the end of `main.css`.
3. Use it: `<ul class="mwa-badge-list">…</ul>`.
4. Run `npm run lint`.

## Fonts and images

- No external URLs in CSS. Fonts and images are served from `static/`.
- Fonts: `.woff2` files in `static/fonts/` with an `@font-face` per file
  (`font-display: swap`, plus `unicode-range` when a family is split into latin and
  latin-ext files). Put the `@font-face` in the stylesheet of the only component that
  uses the font, or in `base.css` for the site font.
- Images: put them in `static/img/` and compress them first. Convert animated GIFs to
  WebP (`gif2webp -mixed -q 75 -m 6`). Keep images no wider than twice their largest
  on-screen size.

## Lint

`npm run lint` runs `npm run lint:css` last. That runs:

- **stylelint** on `static/style/**/*.css` (config: `stylelint.config.mjs`). It rejects
  `!important`, raw colours outside `tokens.css`, `px` in the properties listed above,
  external `url()`s, `@import` outside `main.css`, IDs, deep selectors and names that
  break the naming pattern.
- **`scripts/check-css-usage.mjs`** — unused and undefined classes, and inline
  `style=` in `src/client/`.

When lint fails, fix the CSS. Don't loosen `stylelint.config.mjs`, don't add
`stylelint-disable` comments, and don't add exceptions to the usage script.

## Finding the rule to change

1. Right-click the element and choose **Inspect**.
2. In the **Styles** panel, find the rule that sets the property, and note which file
   it comes from.
3. Go back to [Where a style goes](#where-a-style-goes) and decide where the change
   belongs. That isn't always the file the current rule lives in.

Changes under `static/` reload the browser automatically in development.
