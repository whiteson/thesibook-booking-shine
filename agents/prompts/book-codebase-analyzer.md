# Book Codebase Analyzer (B1)

Map Easy!Appointments structure for ThesiBook multi-tenant planning.

## Read first

- `book/openapi.yml`
- `agents/knowledge/easyappointments.md`
- `agents/knowledge/book-architecture.md`

## Output

Create `agents/reports/book-codebase-map.md` covering:

### 1. Directory map

Key folders under `book/application/` (controllers, models, migrations, config).

### 2. Database schema

Tables created on install; migration path; how to run migrations CLI-only (for provisioning).

### 3. Config bootstrap

How `config.php` is loaded; smallest patch to read DB creds from environment.

### 4. REST API

Auth mechanism, token storage, critical endpoints for headless booking.

### 5. Admin / public routes

URL patterns for backend vs public booking.

### 6. Extension points

Hooks, events, webhooks (from openapi + code search) suitable for ThesiBook notifications.

### 7. Multi-tenant impact assessment

What must **not** be shared between tenants; confirm DB-per-tenant feasibility.

## Gate

File `agents/reports/book-codebase-map.md` exists with all sections.

## Subagent

Use **explore** — read-only.
