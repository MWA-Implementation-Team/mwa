# Deploy

One Ansible playbook turns a fresh Ubuntu 24.04 VM into the running app:
Docker + `app`/`caddy` containers behind Caddy TLS, secrets from an
encrypted vault, nightly sqlite backups. Spec: [../SPEC-deploy.md](../SPEC-deploy.md).

## Prerequisites

- ansible-core ≥ 2.17 on your machine (`ansible --version`)
- `ansible-galaxy collection install -r deploy/requirements.yml`
- A VM: Ubuntu 24.04, reachable over ssh **with key auth** —
  `ssh root@<ip>` must work non-interactively. Operators install their
  own keys on the VM by hand (e.g. `ssh-copy-id`).
- DNS: A/AAAA record for `domain` → the VM's IP, done at your registrar.
  Do this **before** the first run — Caddy can't issue a cert until it
  resolves.
- A GitHub ssh key **in your local agent** — `ssh -T git@github.com`
  works, `ssh-add -l` lists it. The VM clones the private repo through
  agent forwarding (`ansible_ssh_extra_args` in inventory.yml).
- The vault password (ask the other operator)

## Fill in the real values

- `deploy/inventory.yml` — `ansible_host`, `ansible_user`
- `deploy/group_vars/all/vars.yml` — `domain`, `ssh_public_keys`,
  `smtp_host`/`smtp_port`, `mail_from`
- `deploy/group_vars/all/vault.yml` — `smtp_user`, `smtp_pass`, then:

    ```shell
    ansible-vault encrypt deploy/group_vars/all/vault.yml
    ```

## First run

```shell
ansible-playbook -i deploy/inventory.yml deploy/playbook.yml --ask-vault-pass
```

After it converges:

1. Confirm `https://<domain>` loads (cert issuance can take a minute).
2. Confirm both operators can still ssh in with their keys.
3. Set `ssh_lockdown: true` in `vars.yml` and rerun with `--tags base` —
   password auth gets disabled.

Re-running the playbook is safe; a healthy second run reports no changes.

## Everyday ops

```shell
# converge everything (idempotent)
ansible-playbook -i deploy/inventory.yml deploy/playbook.yml --ask-vault-pass

# dry run — see what would change, apply nothing
ansible-playbook -i deploy/inventory.yml deploy/playbook.yml --check --diff --ask-vault-pass

# one layer only
... --tags app        # base | docker | app | backup

# on the VM
cd /opt/mwa && docker compose -f deploy/compose.prod.yaml ps
docker compose -f deploy/compose.prod.yaml logs -f app
```

## Deploying a new version

The playbook tracks `repo_ref` (`main`). To ship, merge to main and:

```shell
ansible-playbook -i deploy/inventory.yml deploy/playbook.yml --ask-vault-pass --tags app
```

This pulls the clone, rebuilds the image, and recreates the container.
Auto-deploy on push is deliberately not built yet (see SPEC-deploy.md).

## Rotating secrets

```shell
ansible-vault edit deploy/group_vars/all/vault.yml
ansible-playbook -i deploy/inventory.yml deploy/playbook.yml --ask-vault-pass --tags app
```

The `.env` re-render changes the container config → compose recreates it.

## Restoring a backup

Nightly snapshots live in `/opt/mwa/backups` (newest 14 kept). Restore:

```shell
cd /opt/mwa
docker compose -f deploy/compose.prod.yaml stop app
docker run --rm -v mwa_mwa-data:/data -v /opt/mwa/backups:/b alpine \
    cp "/b/<file>.sqlite" /data/db.sqlite
docker compose -f deploy/compose.prod.yaml start app
```

## Feature states

`.env` on the VM carries `MWA_FEATURES` (from `mwa_features` in vars.yml).
`landing` = landing page only; `landing,auth,app,admin,api` = everything.
Change vars.yml → rerun with `--tags app`. See SPEC-feature-gating.md.
