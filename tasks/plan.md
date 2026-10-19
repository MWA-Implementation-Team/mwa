# Plan: Personal QR → Interact Page

Spec: `SPEC-interact.md` (approved). Dependency-ordered build:

1. **Dep** — `npm install uqr` (backend-only, zero transitive deps, ESM `renderSVG`).
2. **Data** — `migrations/05_interact_tokens.sql` → `src/db/interactions.ts`
   (`getOrCreateInteractToken`, `findUserByInteractToken`) + `interactions.test.ts`.
   Verify: `npm test` (db tests).
3. **Page + i18n** — `InteractPage.tsx` holds the interaction sections as
   conditional JSX (`send-money` stub for all, profile detail when the route
   populated `detail`), registered as `interact` in `pages.ts`; all
   `interact*`/`titleInteract`/`dashQr*` keys in `language.ts` (en+lt).
4. **Routes** — `GET /app` gains QR (`renderSVG` of absolute interact URL from
   request origin); new `GET /app/interact/:token` resolves token, populates
   `detail` only for host/admin scanners, self-scan gets `self: true`.
   Verify: `interact.test.ts` (redirect, 404, self-scan, role filtering).
5. **Docs** — glossary entries (interact token, interaction registry) +
   file-map client section.

Sequential throughout — each layer types against the previous. Checkpoint:
`npm test && npm run lint` before docs.
