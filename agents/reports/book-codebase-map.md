# Easy!Appointments Codebase Map (ThesiBook)

Version: **1.6.0** (from `application/config/app.php`)  
Commit: `e46b4c6` on `main`

## 1. Directory map

```txt
book/
├── index.php                 # CodeIgniter front controller
├── config.php                # Root Config class (BASE_URL, DB) — gitignored locally
├── config-sample.php         # Template
├── openapi.yml               # REST API OpenAPI 3 spec
├── application/
│   ├── config/
│   │   ├── app.php           # EA version, BASE_URL from Config::
│   │   ├── database.php      # DB from Config::DB_* constants
│   │   ├── routes.php        # Web + api/v1/* routing
│   │   └── migration.php     # Migration config
│   ├── controllers/          # Web UI controllers (Booking, Calendar, Settings…)
│   ├── controllers/api/v1/   # REST API controllers (*_api_v1)
│   ├── core/                 # EA_* extended CI classes
│   ├── models/               # Data layer (ea_ table prefix)
│   ├── migrations/           # 001–069 sequential migrations
│   ├── libraries/            # Api, Accounts, Permissions, Webhooks…
│   └── views/
├── storage/                  # Writable: cache, logs, sessions, backups
└── docker-compose.yml        # nginx, php-fpm, mysql, mailpit, swagger
```

## 2. Configuration bootstrap

1. `index.php` loads root `config.php` defining class `Config`.
2. `application/config/database.php` reads `Config::DB_HOST`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`.
3. `application/config/app.php` reads `Config::BASE_URL`, `DEBUG_MODE`.
4. Table prefix: **`ea_`** (all tenant data in prefixed tables).

### Minimal env patch (recommended for multi-tenant)

Replace constants in root `config.php` with env fallbacks:

```php
const DB_HOST = getenv('EA_DB_HOST') ?: 'mysql';
const DB_NAME = getenv('EA_DB_NAME') ?: 'easyappointments';
// … same for USER, PASSWORD, BASE_URL
```

Document in `book/PATCHES.md`. No model changes required.

## 3. Database schema

- Created via **web setup wizard** on first visit, then maintained by **69 migrations** in `application/migrations/`.
- Core entities (tables prefixed `ea_`):
  - `users`, `roles`, `user_settings`
  - `services`, `service_categories` (categories)
  - `appointments`
  - `settings` (key/value incl. API token, company name)
  - `webhooks`, `blocked_periods`, `consents`, etc.

### Provisioning implication

For each workspace:

1. `CREATE DATABASE ea_tenant_{slug}`
2. Point EA at that database
3. Run setup/migrations (wizard or CLI — verify `Console.php` controller for migrate commands during B2)
4. Seed admin user via wizard or API

**No tenant_id column exists** — isolation = separate database per workspace.

## 4. REST API

**Base URL:** `{BASE_URL}/index.php/api/v1/`

Routing defined in `application/config/routes.php` via `route_api_resource()` helper.

| Resource | Methods |
|----------|---------|
| appointments, admins, customers, providers, secretaries | index, show, store, update, destroy |
| services, service_categories, unavailabilities, webhooks, blocked_periods | same |
| settings | GET index/show, PUT update |
| availabilities | GET (query: providerId, serviceId, date) |

**Auth:** Bearer token or Basic — token from Settings → General → API (`api_token` in settings table, migration 017).

**OpenAPI:** `book/openapi.yml` — Swagger UI on port 8092 when Docker stack runs.

## 5. Routes (web)

| URL pattern | Controller | Purpose |
|-------------|------------|---------|
| `/` (default) | `Booking` | Public booking wizard |
| `/index.php/backend` | Admin area | Calendar, settings, users |
| `/booking/{hash}` | Booking | Appointment-specific booking link |

Security headers in `routes.php` include `X-Frame-Options: SAMEORIGIN` — adjust for cross-origin iframe embed from ThesiBook frontend if needed.

## 6. Roles (single tenant)

Stored in `ea_users` + `ea_roles`:

- Admin — full access
- Provider — own schedule
- Secretary — manages providers
- Customer — public booking identity

Each **ThesiBook workspace** = one EA instance with one primary Admin created at registration.

## 7. Extension points

| Mechanism | Use for ThesiBook |
|-----------|-------------------|
| **Webhooks** (`webhooks` API) | Notify control plane on appointment created |
| **REST API** | Headless booking in Next.js |
| **Settings API** | Read company/branding per tenant |
| **CORS** (`CORS_ALLOWED_ORIGINS` constant) | Allow frontend origin |
| **Console controller** | Possible migration/maintenance CLI |

Avoid modifying `EA_Model` / shared controllers until env-based config is proven.

## 8. Multi-tenant impact

| Concern | Assessment |
|---------|------------|
| Shared schema + tenant_id | **High cost** — every model/query must change |
| DB per workspace | **Recommended** — matches EA design |
| Container per workspace | Possible at scale; heavy for MVP |
| Config injection | **Required** — dynamic DB + BASE_URL per request |
| Session isolation | Automatic with separate DB + subdomain |
| GPL compliance | Fork + publish patches if EA core modified |

## 9. Next actions (B2)

1. `./scripts/install-book.sh --up`
2. Complete setup wizard
3. Generate API token; test `GET /index.php/api/v1/services`
4. Inspect `application/controllers/Console.php` for migration CLI
5. Proceed to B3 control plane design
