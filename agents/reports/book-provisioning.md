# Book Provisioning — Implemented

Date: 2026-06-29

## Flow

```txt
POST /api/auth/register (frontend)
  → cp_users + cp_workspaces (status=provisioning, plan=free)
  → services/booking/scripts/provision-tenant.sh
  → book/tenants/{slug}/meta.json
  → EA CLI install + admin email/password sync
  → cp_workspace_databases + status=active
  → JWT session cookie → /dashboard
```

## Manual test

```bash
./scripts/setup-control-plane.sh
curl -X POST http://localhost:3010/api/auth/register \
  -H 'content-type: application/json' \
  -d '{"name":"Test User","email":"test@local.test","password":"password123","companyName":"Test Salon"}'
```

## Files

- `frontend/src/app/api/auth/register/route.ts`
- `frontend/src/lib/booking/provision.ts`
- `services/booking/scripts/provision-tenant.sh`
- `book/thesibook-bootstrap.php`
