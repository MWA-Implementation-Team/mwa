# mwa deploy ops — run `just <recipe>` from the repo root.
# Prereqs: just, ansible-core, your GitHub key in ssh-agent (ssh-add -l).

# user@host read straight out of the inventory — never drifts
vm := `awk '/ansible_host:/{h=$2} /ansible_user:/{u=$2} END{print u "@" h}' deploy/inventory.yml`
compose := "docker compose -f /opt/mwa/deploy/compose.prod.yaml"
# deploy/.vault_pass is gitignored + local-only — use it when present, prompt otherwise
vault_flag := `if [ -f deploy/.vault_pass ]; then echo "--vault-password-file deploy/.vault_pass"; else echo "--ask-vault-pass"; fi`
playbook := "ansible-playbook -i deploy/inventory.yml deploy/playbook.yml " + vault_flag

default:
    @just --list

# provision the VM from scratch + deploy (full playbook)
provision:
    {{ playbook }}

# deploy new code on main: pull, rebuild, recreate (~seconds of downtime)
deploy:
    {{ playbook }} --tags app

# dry run — show what would change, apply nothing
check:
    {{ playbook }} --check --diff

# shell on the VM — -A keeps git pull working (clone auths via your agent)
ssh:
    ssh -A {{ vm }}

# container status + health
ps:
    ssh {{ vm }} "{{ compose }} ps"

# follow logs — `just logs` for app, `just logs caddy` for the proxy
logs service="app":
    ssh {{ vm }} "{{ compose }} logs -f {{ service }}"

# bounce the app container — no rebuild, won't pick up new code
restart:
    ssh {{ vm }} "{{ compose }} restart app"

# edit the encrypted secrets (smtp credentials)
vault:
    ansible-vault edit deploy/group_vars/all/vault.yml {{ vault_flag }}

# seed the prod db with sample data — no-op if users already exist
seed:
    ssh {{ vm }} "{{ compose }} exec -T app /nodejs/bin/node dist/seed.js"

# consistent db snapshot to your laptop (VACUUM INTO is atomic on a live db)
db-pull file="dump.sqlite":
    echo "const { DatabaseSync } = require('node:sqlite'); new DatabaseSync('/data/db.sqlite').exec(\"VACUUM INTO '/data/dump.sqlite'\")" \
        | ssh {{ vm }} "{{ compose }} exec -T app /nodejs/bin/node"
    scp {{ vm }}:/opt/mwa/data/dump.sqlite {{ file }}

# ad-hoc SELECT on the live db — just db-query 'SELECT COUNT(*) c FROM users'
# (SQL lands inside a JS string — keep quotes out of it)
db-query sql:
    echo "const { DatabaseSync } = require('node:sqlite'); console.table(new DatabaseSync('/data/db.sqlite').prepare('{{ sql }}').all())" \
        | ssh {{ vm }} "{{ compose }} exec -T app /nodejs/bin/node"

# dbgate web UI on the live db, read-write — open http://localhost:5050,
# Ctrl-C closes the tunnel. edits land directly on the app's db.
dbgate:
    ssh {{ vm }} "{{ compose }} --profile tools up -d dbgate"
    @echo "dbgate on http://localhost:5050 — Ctrl-C to close the tunnel"
    ssh -N -L 5050:localhost:5050 {{ vm }}

# stop the dbgate container on the VM
dbgate-down:
    ssh {{ vm }} "{{ compose }} --profile tools stop dbgate"
