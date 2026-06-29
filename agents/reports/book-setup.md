# Book Setup Report

Generated: 2026-06-29

## Upstream

| Field | Value |
|-------|-------|
| Repository | https://github.com/alextselegidis/easyappointments |
| Local path | `book/` |
| Commit | `e46b4c6` (main, shallow clone) |
| License | GPL-3.0 |

## Local configuration

| File | Status |
|------|--------|
| `book/config.php` | Created from sample |
| `scripts/book.env` | Copied from example |
| `scripts/install-book.sh` | Executable bootstrap script |

## Ports (scripts/book.env)

| Service | Port |
|---------|------|
| EA web (nginx) | 8090 |
| MySQL (host) | 3307 |
| phpMyAdmin | 8091 |
| Swagger UI | 8092 |
| Mailpit | 8026 |

`EA_BASE_URL=http://localhost:8090`

## Next steps

1. **Install Docker Desktop** (not detected on dev machine during bootstrap).
2. Run: `./scripts/install-book.sh --up`
3. Open http://localhost:8090 and complete setup wizard.
4. Run phase B1: `node scripts/book-runner.mjs --phase B1` (codebase map agent).
5. Read architecture: `agents/knowledge/book-architecture.md`

## Pipeline status

Run `node scripts/book-runner.mjs` for full gate list.

| Phase | Status |
|-------|--------|
| B0 Bootstrap | PASS |
| B1 Codebase map | PENDING |
| B2 Local run | PENDING (requires Docker) |

## Multi-tenant direction

**Recommended:** control plane DB + **database per workspace**. See `agents/knowledge/book-architecture.md`.

Registration on `frontend/` → provisioning API → isolated EA database + subdomain `{slug}.book.domain`.
