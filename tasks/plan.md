# Implementation Plan: Deployment & feature gating

Specs: [SPEC-deploy.md](../SPEC-deploy.md), [SPEC-feature-gating.md](../SPEC-feature-gating.md)
Map: [CAPABILITY-MAP.md](../CAPABILITY-MAP.md)

## Overview

Two independent modules. **feature-gating** is pure app code — env-driven
route allowlist — fully verifiable locally. **deploy** is an Ansible
playbook + prod compose that turns a fresh Ubuntu VM into the running app,
plus one small app change (SMTP auth) it depends on for email verification.

Build order: feature-gating first (locally testable, lands immediately),
then deploy's app-side prerequisite, then the playbook bottom-up, ending
with a live run on the real VM.

## Architecture Decisions

- **feature-gating before deploy** — it's the only module that changes
  request behavior; get it green while infra is still unwritten.
- **Playbook builds up in layers** — base OS → Docker → runtime files →
  app deploy → backups. Each layer is independently runnable via tags.
- **App image builds on the VM** from a git checkout at `/opt/mwa` — no
  registry for v1.
- **Backups via `node -e` inside the app container** — distroless has no
  sqlite3 CLI, but it has `node:sqlite`.
- **Secrets: ansible-vault → templated `.env` (0600)** — ciphertext is the
  only secret material in git.
- **No molecule/vagrant** — playbook is small; a real run is the test.

## Task List

See [todo.md](todo.md) for full acceptance criteria and verification.

### Phase 1: feature-gating (module `feature-gating`)

- [ ] Task 1: `src/features.ts` — FEATURE_IDS, FeatureId, parseFeatures + tests
- [ ] Task 2: wire `state.features` + guard `register*Routes` in main.ts + route tests
- [ ] Task 3: `init.features` into `#ssr-data`; hide gated UI; docs

### Checkpoint: app code green

- [ ] `npm test` + `npm run lint` pass
- [ ] `MWA_FEATURES=landing npm start` → `/` 200, `/login` `/app` `/api/*` 404

### Phase 2: deploy prerequisites

- [ ] Task 4: SMTP auth — `MWA_SMTP_USER`/`MWA_SMTP_PASS` in state.ts + test

### Phase 3: playbook foundation

- [ ] Task 5: deploy skeleton + base OS (inventory, vars, vault, ufw, ssh keys)
- [ ] Task 6: Docker Engine + compose plugin install

### Checkpoint: playbook foundation

- [ ] `--syntax-check` clean, `npm run lint` green, `--check` runs against target

### Phase 4: runtime + deploy

- [ ] Task 7: prod runtime files — compose.prod.yaml, env.j2, Caddyfile.j2
- [ ] Task 8: playbook deploy tasks — clone /opt/mwa, render config, compose up
- [ ] Task 9: backups — files/backup.sh + cron.daily

### Phase 5: ship it

- [ ] Task 10: deploy/README.md runbook + docs/ sync
- [ ] Task 11: live run on real VM — verify every SPEC-deploy success criterion

### Checkpoint: live

- [ ] https://\<domain\> serves the app with valid cert; login email arrives;
      db survives restart; second playbook run reports zero changes

## Risks and Mitigations

| Risk                                     | Impact                       | Mitigation                                                                                                  |
| ---------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| DNS not pointed at VM when playbook runs | Caddy can't issue cert       | Runbook documents DNS as a manual prerequisite; Caddy retries until it resolves — app still serves on retry |
| SSH password lockout                     | Lose VM access               | `ssh_lockdown` var default `false`; flip only after both operators' keys verified                           |
| No shell in distroless image             | Can't exec debugging tools   | Backups/ops via `node -e`; `docker compose logs` for inspection                                             |
| Playbook idempotency drift               | Second run mutates or breaks | Modules over `command:`, `changed_when` where unavoidable, `--check --diff` habit                           |
| Small VM OOMs during image build         | Deploy fails                 | Acceptable for v1 — app is tiny; if it happens, prebuild elsewhere later                                    |
| Wrong SMTP creds discovered late         | Login email silently fails   | Explicit "send a login email" step in Task 11 verification                                                  |

## Open Questions

None blocking. Real VM/domain/SMTP values are committed to the repo —
non-secrets in `inventory.yml`/`vars.yml`, secrets in `vault.yml`
(ansible-vault). Operator supplies the actual values at Task 5 time and
the vault password at run time.
