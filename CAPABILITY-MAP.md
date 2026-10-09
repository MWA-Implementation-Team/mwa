# Capability Map: Authorization

Replaces the dev-only cookie auth (`mwa-username` plaintext cookie) with real
passwordless authentication and centralized role enforcement.

| Module id  | Responsibility                                                  | Depends on |
| ---------- | --------------------------------------------------------------- | ---------- |
| accounts   | Self-signup (email + username), user record, email verification | —          |
| sessions   | Email-link login, session tokens, logout, `currentUser()`       | accounts   |
| role-gates | `requireRole` middleware, route policy, 401/403 handling        | sessions   |

Build order: accounts → sessions → role-gates

Module specs:

- [SPEC-accounts.md](SPEC-accounts.md)
- [SPEC-sessions.md](SPEC-sessions.md)
- [SPEC-role-gates.md](SPEC-role-gates.md)
