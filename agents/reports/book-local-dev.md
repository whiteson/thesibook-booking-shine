# Book Local Dev — Native (no Docker)

Date: 2026-06-29  
Mode: **native** (PHP 8.2 + MariaDB on localhost)

## CLI install complete

```bash
./scripts/install-book.sh --native --install
```

- Database: `thesibook_ea` on `localhost`
- BASE_URL: `http://localhost:8090`
- EA default login: `administrator` / `administrator` (change in admin after first login)

## Run locally

```bash
./scripts/install-book.sh --serve
# → http://127.0.0.1:8090
# Admin: http://127.0.0.1:8090/index.php/backend
# Public booking: http://127.0.0.1:8090/
```

HTTP smoke test: **200** on `/index.php` via PHP built-in server.

## API token

After login: Settings → General → create API token for REST tests:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" \
  "http://127.0.0.1:8090/index.php/api/v1/services"
```

## Production path (no Docker)

1. `./scripts/deploy/book-deploy.sh` — rsync `book/` to server (never via public GitHub)
2. nginx: `scripts/deploy/book-nginx.conf.example`
3. `composer install --no-dev` on server PHP 8.2+

## Control plane (next)

```bash
mysql -u root -p < services/booking/sql/001_control_plane.sql
./services/booking/scripts/provision-tenant.sh demo-salon
```

See `agents/knowledge/book-control-plane-schema.md`.
