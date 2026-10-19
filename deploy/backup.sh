#!/usr/bin/env bash
# Nightly sqlite backup, run from cron on the VM. VACUUM INTO inside the
# app container produces a consistent snapshot of the live db; the /backups
# bind mount lands the file in ./backups on the host. Keeps the newest 14.
set -euo pipefail

cd "$(dirname "$0")/.." # repo root — /opt/mwa on the VM

mkdir -p backups
name="db-$(date +%Y%m%d-%H%M%S).sqlite"

# -u root: distroless runs the app as nonroot; the bind-mounted host dir is
# root-owned, so the writer needs root inside the container.
docker compose -f deploy/compose.prod.yaml exec -T -u root app \
    node -e "import('node:sqlite').then(({DatabaseSync}) => new DatabaseSync('/data/db.sqlite').exec(\"VACUUM INTO '/backups/$name'\"))"

ls -1t backups/db-*.sqlite | tail -n +15 | xargs -r rm --
