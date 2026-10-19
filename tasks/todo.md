# Todo: Deployment & feature gating

Plan: [plan.md](plan.md) · Specs: [SPEC-deploy](../SPEC-deploy.md), [SPEC-feature-gating](../SPEC-feature-gating.md)

## Phase 1: feature-gating

- [ ] Task 1: `src/features.ts` — feature ids + parser
    - Acceptance: `FEATURE_IDS` const + `FeatureId` type; `parseFeatures(env)` returns all ids when unset/`all`, subset for a comma list, ignores unknown ids (stderr warn), drops empties.
    - Verify: `npm test` — new `src/features.test.ts` cases pass.
    - Files: `src/features.ts`, `src/features.test.ts`

- [ ] Task 2: wire features into state + guard routes
    - Acceptance: `MwaState.features: Set<FeatureId>` populated from `MWA_FEATURES` in `createDefaultMwaState`; each `register*Routes` call in `main.ts` guarded; gated routes 404 via existing `notFound`.
    - Verify: `npm test` — route tests: features={landing} → `/` 200, `/login` `/app` `/admin` `/api/users` 404; unset → all 200s as today.
    - Files: `src/state.ts`, `src/main.ts`, a route-gating test file

- [ ] Task 3: expose features to client + hide gated UI
    - Acceptance: `init.features` serialized in `#ssr-data`; nav links / QR block hidden when their feature is off; `docs/` (file-map or architecture) updated.
    - Verify: `npm test` + `npm run lint`; manual `MWA_FEATURES=landing npm run dev` — no dead links on landing.
    - Files: `src/pages.tsx`, affected client component(s), docs file(s)

### Checkpoint: app code green — `npm test` + `npm run lint` pass; landing-only mode verified by hand

## Phase 2: deploy prerequisites

- [ ] Task 4: SMTP auth support
    - Acceptance: `MWA_SMTP_USER`/`MWA_SMTP_PASS` set → nodemailer transport gets `auth`; unset → no `auth` key (mailpit still works).
    - Verify: `npm test` — state/config test covers both branches.
    - Files: `src/state.ts`, `src/state.test.ts` (or existing mailer test)

## Phase 3: playbook foundation

- [ ] Task 5: deploy skeleton + base OS provisioning
    - Acceptance: `deploy/inventory.yml`, `group_vars/all/{vars,vault}.yml`, `playbook.yml` exist with real values committed (domain/VM host/smtp host+port plaintext; smtp creds via `ansible-vault encrypt`); playbook updates apt, installs base packages, configures ufw (22/80/443), installs both operators' ssh keys, `ssh_lockdown` var (default false) controls `PasswordAuthentication no`.
    - Verify: `ansible-playbook --syntax-check` clean; `npm run lint` (prettier) green.
    - Files: `deploy/inventory.yml`, `deploy/playbook.yml`, `deploy/group_vars/all/vars.yml`, `deploy/group_vars/all/vault.yml`

- [ ] Task 6: Docker install
    - Acceptance: playbook adds Docker's apt repo, installs docker-ce + compose plugin; `docker compose version` works on target; deploy user (or root) can run docker.
    - Verify: `--syntax-check` clean; `--check` against a reachable host shows expected changes.
    - Files: `deploy/playbook.yml`, `deploy/group_vars/all/vars.yml`

### Checkpoint: foundation — syntax-check clean, lint green, base+converge against a test VM or `--check` run

## Phase 4: runtime + deploy

- [ ] Task 7: prod runtime files
    - Acceptance: `deploy/compose.prod.yaml` (app builds from `./Dockerfile`, `env_file: .env`, `mwa-data:/data`, no published ports, restart unless-stopped; caddy on 80/443 with data+config volumes); `templates/env.j2`; `templates/Caddyfile.j2` (`<domain> { reverse_proxy app:3000 }`).
    - Verify: `npm run lint` green; `docker compose -f deploy/compose.prod.yaml config` renders without error locally.
    - Files: `deploy/compose.prod.yaml`, `deploy/templates/env.j2`, `deploy/templates/Caddyfile.j2`

- [ ] Task 8: playbook deploy tasks
    - Acceptance: playbook clones repo to `/opt/mwa` (deploy key/https), renders `.env` (0600) + `Caddyfile`, `docker compose -f deploy/compose.prod.yaml up -d --build`; handlers restart compose on config change.
    - Verify: `--syntax-check` + `--check --diff` clean.
    - Files: `deploy/playbook.yml`, `deploy/group_vars/all/vars.yml`

- [ ] Task 9: nightly sqlite backup
    - Acceptance: `files/backup.sh` runs `docker compose exec app node -e '…VACUUM INTO…'` → timestamped file in `/opt/mwa/backups`, prunes to last 14; installed as cron.daily.
    - Verify: `--syntax-check` clean; backup.sh runs against a live container in Task 11.
    - Files: `deploy/files/backup.sh`, `deploy/playbook.yml`

## Phase 5: ship it

- [ ] Task 10: docs
    - Acceptance: `deploy/README.md` runbook (prereqs, DNS step, first run, secrets rotation, backup restore); `docs/` + `README.md` updated in the same PR.
    - Verify: `npm run lint`; doc review.
    - Files: `deploy/README.md`, `README.md`, `docs/*` as needed

- [ ] Task 11: live run on the real VM
    - Acceptance: every SPEC-deploy success criterion — https://\<domain\> live with LE cert, login email via authenticated SMTP arrives, db.sqlite persists across `down/up`, second playbook run = zero changes, only 22/80/443 open, `.env` 0600, backup produces a file.
    - Verify: manual — runbook checklist executed on the production VM.
    - Files: none — real values already committed in Task 5

### Checkpoint: live — SPEC-deploy success criteria all checked; `MWA_FEATURES` set to `landing` in prod `.env`
