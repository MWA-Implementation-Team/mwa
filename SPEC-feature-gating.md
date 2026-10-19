# Spec: Feature gating — release-stage app surface

Traces to module `feature-gating` in [CAPABILITY-MAP.md](CAPABILITY-MAP.md).

## Objective

The app's exposed surface is controlled by one env var so each published
state of the project exposes only what's meant to be used. First deploy:
landing page only — `/login`, `/app/*`, `/admin`, `/api/*` don't exist
as far as the outside world can tell. Later states flip features on by
editing `.env` on the VM (or vault → redeploy), no code change needed.

This is abuse/exploration prevention, not a permissions system: role
checks still govern what a logged-in user can do.

## Tech Stack

No new dependencies. Env parsing in `src/state.ts`, route registration
guards in `src/main.ts`, feature list shared with the client through the
existing `init` payload in `writePage`.

## Commands

Same as today — `npm run dev`, `npm test`, `npm run lint`. Manual check:

    MWA_FEATURES=landing npm start   # then: / 200, /login 404, /app 404

## Mechanism

`MWA_FEATURES` — comma-separated allowlist of feature ids, parsed by a
pure `parseFeatures(env)` in `src/features.ts` into `state.features: Set<FeatureId>`.

    MWA_FEATURES unset or 'all'  → everything on (dev default, no surprises)
    MWA_FEATURES=landing         → landing + static assets only
    MWA_FEATURES=landing,auth,app,admin,api → full site

Feature ids gate route groups in `main.ts`:

| id        | gates                                                                               |
| --------- | ----------------------------------------------------------------------------------- |
| `landing` | `/` and static/`/client/*` serving — always on in practice, listed for completeness |
| `auth`    | `/login`, `/auth/*` (magic-link flow)                                               |
| `app`     | `/app/*` (home, interact, activities, badges)                                       |
| `admin`   | `/admin/*`                                                                          |
| `api`     | `/api/*`                                                                            |

- Guarded routes fall through to `app.notFound` → existing 404 page.
  A gated route is indistinguishable from one that was never built.
- `init.features` is serialized into `#ssr-data` so client components can
  hide gated UI (nav links, QR block) instead of rendering dead links.
- `parseFeatures` is lenient: unknown ids are ignored (warn to stderr),
  so a typo fails safe-ish rather than crashing boot. Empty/whitespace
  entries are dropped.

Alternative considered: a stage enum (`MWA_STAGE=landing|full` mapping to
presets). Rejected — an allowlist is the same one string in `.env` but
doesn't need a code change when a weird intermediate state shows up.

## Project Structure

    src/features.ts          → FEATURE_IDS const, FeatureId type, parseFeatures()
    src/features.test.ts     → parsing: unset, 'all', subsets, unknown ids
    src/state.ts             → state.features populated from env
    src/main.ts              → register*Routes calls guarded by feature id
    src/pages.tsx            → init.features into ctxInit / #ssr-data
    client nav/home          → hide links/QR when feature off

## Testing Strategy

`node:test` as usual:

- `parseFeatures`: unset → all ids; `landing` → only landing; unknown id
  ignored + warning; `auth,app` parses order-free.
- Route-level: build state with `features={'landing'}` → `GET /` 200,
  `GET /login` 404, `GET /app` 404, `GET /api/users` 404 — through the
  real Hono app, same style as existing route tests.
- `init.features` present in rendered `#ssr-data`.

## Boundaries

- Always: `npm test` + `npm run lint` before commits; docs updated in the
  same PR; gated UI hidden, not just unrouted.
- Ask first: new feature ids beyond the table, gating anything inside a
  route group (e.g. a single `/app` page) — that's a different mechanism.
- Never: gate on anything but env config (no DB flags, no per-user
  overrides), leave gated routes returning 403 — 404 only.

## Success Criteria

- [ ] `MWA_FEATURES=landing npm start`: `/` renders, `/login`, `/app`,
      `/admin`, `/api/*` all 404
- [ ] Unset `MWA_FEATURES` → full app, identical to today
- [ ] `init.features` in `#ssr-data`; gated nav links/QR not rendered
- [ ] Feature flip = edit `.env` + restart container — no rebuild
- [ ] Tests cover parse + route gating; `npm run lint` green

## Open Questions

Resolved — no blockers:

- Release states → decided at deploy time via `.env`; prod ships
  `MWA_FEATURES=landing` until the deadline flips it.
- Feature deps → explicit allowlist, no implied deps (`admin` does not
  auto-enable `auth`/`app`; operators list sensible combos).
