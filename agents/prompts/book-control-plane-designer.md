# Book Control Plane Designer (B3)

Design the ThesiBook **control plane** for multi-tenant workspaces (database-per-tenant).

## Read first

- `agents/knowledge/book-architecture.md`
- `agents/reports/book-codebase-map.md` (must exist)

## Tasks

1. Define control plane database schema:
   - `users` (platform accounts)
   - `workspaces` (slug, status, ea_base_path or subdomain)
   - `workspace_databases` (encrypted credentials, host, db_name)
   - `workspace_members` (owner, role)
2. Define provisioning state machine: `pending → provisioning → active → suspended → deleted`
3. Choose service location: `services/booking/` (Node or PHP — match team preference; default Node/TS alongside frontend).
4. Define API contracts:
   - `POST /api/workspaces` — create workspace (auth required)
   - `GET /api/workspaces/:slug` — metadata
   - Internal: provisioner creates MySQL DB + runs EA migrations
5. Document subdomain strategy: `{slug}.book.{domain}`.
6. Security: encryption for DB passwords, audit log for provision/deprovision.

## Output

`agents/knowledge/book-control-plane-schema.md` with SQL-ish table defs, API shapes, and sequence diagram (mermaid ok).

## Gate

Schema file exists and references DB-per-tenant explicitly.

## Do not

- Implement provisioning yet (B4)
- Modify EA core in this phase
