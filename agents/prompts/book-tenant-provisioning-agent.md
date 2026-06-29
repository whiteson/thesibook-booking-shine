# Book Tenant Provisioning Agent (B4)

Implement workspace provisioning: create isolated EA database per workspace.

## Read first

- `agents/knowledge/book-control-plane-schema.md`
- `agents/reports/book-codebase-map.md`
- `agents/knowledge/book-architecture.md`

## Tasks

1. Scaffold `services/booking/` (or agreed path) with:
   - Control plane DB connection
   - `POST /workspaces` handler
2. Provisioner steps (idempotent where possible):
   - Validate slug unique
   - `CREATE DATABASE ea_{slug}` + dedicated DB user with least privilege
   - Run EA schema bootstrap (reuse migration path from B1 map)
   - Insert workspace admin (from registration payload)
   - Store encrypted credentials in control plane
   - Mark workspace `active`
3. Provide CLI for local test: `node services/booking/scripts/provision-test-tenant.mjs demo`
4. Document rollback on failure (drop DB, mark failed).

## Output

- Working provisioner + test tenant `demo` with own DB
- `agents/reports/book-provisioning.md` with test steps

## Gate

Test tenant DB exists; EA admin can log in at tenant URL (or path) with seeded credentials.

## Do not

- Share one EA admin across tenants
- Store plaintext DB passwords
