# Book Routing Agent (B5)

Route incoming requests to the correct tenant Easy!Appointments instance.

## Read first

- `agents/knowledge/book-architecture.md`
- `agents/knowledge/book-control-plane-schema.md`
- `agents/reports/book-provisioning.md`

## Tasks

1. Implement tenant resolution:
   - Host: `{slug}.book.localhost` (dev) / `{slug}.book.domain` (prod)
   - Lookup workspace in control plane; load DB credentials
2. Inject config before EA bootstrap:
   - Preferred: env vars `EA_DB_HOST`, `EA_DB_NAME`, `EA_DB_USER`, `EA_DB_PASSWORD`, `EA_BASE_URL`
   - Minimal EA patch documented in `book/PATCHES.md` if needed
3. Nginx/Caddy config template in `scripts/book/nginx-tenant.conf.example`
4. Local proof: two tenants (`demo`, `demo2`) on different subdomains, isolated data.

## Output

- Routing config + patch list
- `agents/reports/book-routing.md`

## Gate

Two tenants show different company names / appointments (no cross-leak).

## Do not

- Use single shared `config.php` for all tenants in production
