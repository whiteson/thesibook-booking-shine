# Book Frontend Integration

Date: 2026-06-29

## Routes

| Path | Purpose |
|------|---------|
| `/register` | Sign up + auto workspace provisioning |
| `/login` | Platform login |
| `/dashboard` | Workspace list, plan usage, EA admin links |

## API

| Method | Path |
|--------|------|
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |
| POST | `/api/auth/logout` |
| GET | `/api/dashboard` |

## Env (`frontend/.env.local`)

- `BOOKING_DB_*` — control plane MySQL
- `BOOKING_JWT_SECRET`
- `NEXT_PUBLIC_EA_BASE_URL`

## WordPress

Marketing site still from WP CMS. Registration is **Next.js control plane**, not WP users.

## Test result

Registration E2E curl: **PASS** — workspace `demo-salon-athens` provisioned.
