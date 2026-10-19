# Capability Map: Deployment & release control

| Module id      | Responsibility                                                                                                   | Depends on |
| -------------- | ---------------------------------------------------------------------------------------------------------------- | ---------- |
| deploy         | Ansible VM provisioning, Docker runtime, prod compose, DNS/TLS via Caddy, secrets via vault→.env, sqlite backups | —          |
| feature-gating | Env-driven feature switches limiting app surface per release stage                                               | —          |

Build order: independent — either can land first. `deploy` writes the
`.env` that will carry `MWA_FEATURES`, but neither module blocks the other.

Specs: [SPEC-deploy.md](SPEC-deploy.md), [SPEC-feature-gating.md](SPEC-feature-gating.md)
