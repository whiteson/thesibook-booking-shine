# Easy!Appointments — ThesiBook reference

Upstream: https://github.com/alextselegidis/easyappointments  
Local path: `book/`  
License: GPL-3.0

## Stack

- PHP 8.2+ (CodeIgniter-style structure under `application/`)
- MySQL 8
- jQuery + Bootstrap frontend assets (`assets/`, built via `npm run build`)
- REST API documented in `book/openapi.yml`

## Key paths

| Path | Purpose |
|------|---------|
| `book/index.php` | Front controller |
| `book/config.php` | DB + BASE_URL (from `config-sample.php`, gitignored) |
| `book/application/` | Controllers, models, views |
| `book/storage/` | Writable cache, logs, sessions, backups |
| `book/docker-compose.yml` | Local dev: nginx, php-fpm, mysql, mailpit, swagger |
| `book/openapi.yml` | OpenAPI 3 spec for `/index.php/api/v1/` |

## Local dev (Docker)

```bash
./scripts/install-book.sh --up
```

Ports from `scripts/book.env` (defaults avoid WP conflicts):

- App: `8090`
- MySQL host port: `3307`
- phpMyAdmin: `8091`

Inside container, DB host is `mysql`, not `localhost`.

## Setup wizard

First browser visit runs install migrations and prompts for:

- Admin account (email, password)
- Company name
- Other basic settings

After setup, admin UI: `{BASE_URL}/index.php/backend`

## Roles (single tenant)

| Role | Scope |
|------|-------|
| Admin | Full system |
| Provider | Own calendar + services |
| Secretary | Manages providers |
| Customer | Books appointments (public) |

Multi-tenant mapping: each **workspace** gets its own EA install state with one **Admin**; providers/secretaries are sub-admins inside that workspace.

## REST API highlights

Base: `{BASE_URL}/index.php/api/v1/`

| Resource | Use for ThesiBook |
|----------|-------------------|
| `GET /availabilities` | Booking widget time slots |
| `POST /appointments` | Create booking |
| `GET /services` | Service list |
| `GET /providers` | Staff list |
| `GET /settings` | Company name, booking rules |
| API token | Settings → General → API (admin) |

Auth headers: `Authorization: Bearer {token}` or Basic.

## Database

Default DB name: `easyappointments`. Schema created by setup wizard / migrations in `application/migrations/` (verify in codebase map).

For multi-tenant: clone empty schema into `ea_{workspace_id}` during provisioning; run same migrations; seed admin user.

## Customization boundaries

**Prefer not to fork:**

- Control plane in `services/booking/` (Node/PHP separate service)
- Nginx routing + env injection for tenant config

**Acceptable small forks (document in PATCHES.md):**

- Read DB credentials from environment
- Hook after setup for provisioning callback
- Custom webhook on appointment created → notify ThesiBook frontend

**Avoid until necessary:**

- Editing core models for shared multi-tenancy

## Build assets (optional for dev)

```bash
docker compose exec app bash
npm install && composer install
npm start   # watch
npm run build
```

Docker `php-fpm` service may need `composer install` on first run if vendor/ missing.

## Version pinning

Track upstream commit in `agents/reports/book-setup.md`. Prefer release tags (e.g. `1.6.0`) for production.
