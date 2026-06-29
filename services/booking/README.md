# ThesiBook Booking Control Plane

Provisions **one Easy!Appointments database per workspace**. EA lives in `book/` (not in git).

## Setup control plane DB

```bash
mysql -u root -p < services/booking/sql/001_control_plane.sql
```

## Provision a test tenant

```bash
./scripts/install-book.sh --native   # ensures book/ + composer
./services/booking/scripts/provision-tenant.sh demo-salon
```

## Production

- Deploy `book/` via `./scripts/deploy/book-deploy.sh` (rsync, not GitHub)
- nginx: `scripts/deploy/book-nginx.conf.example`
- API service (`src/`) — TODO phase B4

See `agents/knowledge/book-control-plane-schema.md`.
