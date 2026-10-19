# Spec: Deployment — single VM, Ansible + Docker

Traces to module `deploy` in [CAPABILITY-MAP.md](CAPABILITY-MAP.md).

## Objective

One command turns a fresh Ubuntu 24.04 VM into a running MWA instance:
Ansible installs Docker, clones the repo, writes config, and brings up
`app` + `caddy` containers. Caddy terminates TLS for the domain; the app
container is never publicly exposed. Secrets ship encrypted in the repo
(ansible-vault) and land as a root-owned `.env` on the VM.

Operators: two people, both trusted — hardening is baseline (ufw, SSH
keys), not a fortress.

Success = fresh VM → `ansible-playbook deploy/playbook.yml` →
`https://<domain>` serves the app and login emails arrive via
authenticated SMTP.

Deferred (explicitly out of scope): auto-deploy on `main` changes
(mechanism TBD — cron pull vs CI-built image vs webhook), staging
environment, off-site backups, monitoring beyond container healthchecks.

## Tech Stack

- Target: Ubuntu 24.04 LTS VM, SSH + sudo, ~1–2 GB RAM.
- ansible-core ≥ 2.17 run from a dev machine — no agent on the VM.
- Docker Engine + compose plugin from Docker's official apt repo.
- `caddy:2-alpine` — automatic Let's Encrypt, ~5 lines of config.
- App: existing production [Dockerfile](Dockerfile) (distroless
  nodejs24), built on the VM from a git checkout.
- SQLite file in a named docker volume — no external DB.

## Commands

Provision (vault password prompted):

    ansible-playbook -i deploy/inventory.yml deploy/playbook.yml --ask-vault-pass

Dry run / diff before applying:

    ansible-playbook -i deploy/inventory.yml deploy/playbook.yml --check --diff --ask-vault-pass

Edit secrets:

    ansible-vault edit deploy/group_vars/all/vault.yml

Syntax check (runs in lint/CI alongside prettier):

    ansible-playbook --syntax-check deploy/playbook.yml

On the VM:

    cd /opt/mwa && docker compose -f deploy/compose.prod.yaml ps
    docker compose -f deploy/compose.prod.yaml logs -f app

## Project Structure

    deploy/
        inventory.yml          → one host: the VM (real ansible_host, committed)
        playbook.yml           → full provisioning; tags for partial runs
        group_vars/all/
            vars.yml           → domain, VM host, repo url/ref, smtp
                                 host/port — real values, committed plaintext
            vault.yml          → smtp_user, smtp_pass, … (ansible-vault)
        templates/
            env.j2             → MWA_* env vars → /opt/mwa/.env (mode 0600)
            Caddyfile.j2       → "<domain> { reverse_proxy app:3000 }"
        compose.prod.yaml      → app + caddy services (static file, not templated)
        files/backup.sh        → nightly sqlite backup (see Backups)
        README.md              → operator runbook: prereqs, first run, DNS step

App change (lands as its own small commit, prerequisite for real SMTP):

    src/state.ts               → MWA_SMTP_USER / MWA_SMTP_PASS → nodemailer auth
    src/state.test.ts          → env→config coverage (pure config fn)

## Layout on the VM

    /opt/mwa/          → git clone of this repo (read-only deploy key or https)
    /opt/mwa/.env      → rendered from vault, mode 0600, owner root
    /opt/mwa/backups/  → nightly sqlite dumps, last 14 kept

Compose project `mwa` (deploy/compose.prod.yaml):

    app    build: .            image built from ./Dockerfile
           env_file: .env      MWA_DB_PATH=/data/db.sqlite
           volumes: mwa-data:/data
           no published ports — internal compose network only
           restart: unless-stopped

    caddy  image: caddy:2-alpine
           ports: 80, 443
           volumes: ./Caddyfile, caddy-data, caddy-config
           restart: unless-stopped

## Secrets

- `vault.yml` holds smtp_user/smtp_pass (+ anything later). Encrypted
  with `ansible-vault encrypt`; vault password lives in each operator's
  password manager and is supplied via `--ask-vault-pass`. No password
  file in the repo.
- Playbook renders `templates/env.j2` → `/opt/mwa/.env`, mode 0600.
- Vault ciphertext is the only secret material ever committed.

## DNS / TLS / network

- Manual prerequisite (documented in deploy/README.md): A/AAAA record for
  the domain → VM IP, done once at the registrar. Caddy issues certs
  automatically once DNS resolves; the playbook never touches DNS APIs.
- ufw: allow 22, 80, 443; default deny incoming.
- SSH: key auth for both operators installed by the playbook, then
  `PasswordAuthentication no` — gated behind a var (`ssh_lockdown`) so it
  only flips after both keys are confirmed working.

## Backups

- cron.daily on the VM runs `files/backup.sh`: `docker compose exec` into
  the app container and `node -e` a `VACUUM INTO '/data/backups/<ts>.sqlite'`
  (node:sqlite is in the app image; no sqlite3 CLI needed). Writes under
  /opt/mwa/backups, keeps the last 14.
- Local-only for v1 — the VM is a single point of failure by design, but
  the DB survives a botched deploy or corrupted container.

## Code Style

- YAML/MD in `deploy/` is prettier-checked (`npm run lint` already covers
  it); Ansible tasks use FQCN (`ansible.builtin.apt`, not `apt`).
- One task per concern, `name:` on everything, handlers for service
  restarts, `changed_when` on raw `command:` calls — playbook output must
  be honest about idempotency.
- App-side changes follow existing style: env parsing in `src/state.ts`,
  pure/testable config extraction.

## Testing Strategy

- `ansible-playbook --syntax-check` + `--check --diff` before every apply.
- Real verification is convergence: run against a fresh VM (or a wiped
  one) and confirm the success criteria below by hand.
- `src/state.test.ts`: `MWA_SMTP_USER`/`MWA_SMTP_PASS` set → transport
  config gains `auth`; unset → no `auth` key (mailpit/local still works).
- No molecule/vagrant harness for v1 — two operators, one VM; the
  playbook is small enough that a real run is the test.

## Boundaries

- Always: `--syntax-check` + `npm run lint` before commit; `--check --diff`
  before applying; vault-encrypt any new secret; deploy docs in the same PR.
- Ask first: new ansible collections or apt packages, ports beyond
  22/80/443, Dockerfile changes, flipping `ssh_lockdown`.
- Never: plaintext secrets or the vault password committed; app port
  published to the host; manual edits on the VM not folded back into the
  playbook (no snowflake config).

## Success Criteria

- [ ] Fresh Ubuntu 24.04 VM + one playbook run → `https://<domain>`
      serves the app with a valid Let's Encrypt cert
- [ ] Login magic-link email sends via authenticated SMTP and arrives
- [ ] `db.sqlite` persists across `docker compose down/up` and rebuilds
- [ ] Second playbook run reports zero changes (idempotent)
- [ ] Only ports 22/80/443 reachable externally; app port unpublished
- [ ] `.env` on the VM is 0600; no plaintext secrets in git
- [ ] Nightly backup produces a restorable sqlite file
- [ ] `deploy/README.md` runbook + `docs/` updated in the same PR(s)

## Open Questions

Resolved — no blockers:

- Real values are committed to the repo: domain/VM host/smtp host+port in
  `inventory.yml` + `vars.yml` (plaintext — not secrets), smtp credentials
  in `vault.yml` (encrypted). The only thing outside git is the vault
  password itself.
- Auto-deploy — deferred; revisit once v1 is live.
- Off-site backups — out of scope for v1 (local-only).
