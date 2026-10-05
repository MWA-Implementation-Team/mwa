# Guide: CSS architecture

The app uses Oat as its base framework. App-specific styles live in
`static/style/` and are loaded after Oat, so they can override it.

## Where styles go

`static/style/main.css` is the entry point — it `@import`s `tokens.css`, `base.css`,
and every file in `components/`.

- `tokens.css` — shared colors, spacing, and other variables.
- `base.css` — page-wide defaults and layout rules.
- `components/` — styles for reusable components.
- `main.css` — imports the other style files.

Use tokens instead of repeating values:

```css
.btn-primary {
    background: var(--color-accent);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
}
```

For a new component:

1. Create a file in `static/style/components/`.
2. Import it from `main.css`.
3. Add the component class to the Preact markup.

Example:

```tsx
<button class="btn-primary">Save</button>
```

## Overriding Oat styles

Do not edit `static/oat.css`; it is a third-party file. Override it in your
own styles instead.

### Change a value everywhere

If Oat uses a CSS variable, change it in `tokens.css`:

```css
:root {
    --primary: #2563eb;
    --radius-medium: 8px;
}
```

This changes every Oat component that uses those variables.

### Change one component

For example, the `.btn-primary` rule in `static/style/components/button.css` overrides
Oat's default button styles. The class limits these changes to elements with
`class="btn-primary"`.
The values such as `--color-accent`, `--space-md`, and `--radius-md` come from
`tokens.css`, so they can be changed without rewriting the button rule.

If Oat's selector is more specific, make the override more specific:

```css
button.btn-primary {
    padding: var(--space-md) var(--space-md);
}
```

Because `main.css` loads after `oat.css`, this normally overrides Oat. If it
does not, inspect the element in DevTools and use a more specific selector.
Use `!important` only when the Oat rule also uses it:

```css
button.btn-primary {
    width: auto !important;
}
```

### Find the property to override

1. Right-click the element and choose **Inspect**.
2. Find the Oat rule in the **Styles** panel (usually on the very right side of the screen).
3. Note the property, such as `padding`, `background-color`, or
   `border-radius`.
4. Override the variable in `tokens.css` for a global change, or override the
   property in a component stylesheet for a local change.

Changes under `static/` reload automatically in development mode.
