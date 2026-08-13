# Book QA — Local Full Stack

**Date:** 2026-08-13  
**Verdict:** Local booking QA **PASS**. Ready to proceed to production deploy after the go-live checklist below.

## Stack used

| Layer | Status |
|-------|--------|
| Next.js `http://localhost:3010` | Running (`npm run dev`) |
| Easy!Appointments `http://127.0.0.1:8090` | Started with `php -S 127.0.0.1:8090` in `book/` |
| Control plane MySQL `thesibook_control` | OK |
| WordPress `/wp-json/webcode/v1/health` | 200 |
| `cd frontend && npm run lint && npm run typecheck` | PASS |
| `node scripts/book-runner.mjs` B0–B7 | PASS |

## QA account (free plan)

Created via `POST /api/auth/register` (same path as `/register`).

| Field | Value |
|-------|--------|
| Name | QA Free Owner |
| Email | `thesibook.qa.20260813@gmail.com` |
| Password | `QaLive2026!` |
| Company | QA Free Studio |
| Workspace | `qa-free-studio` (status **active**, plan **free**) |
| Login | http://localhost:3010/login |
| Dashboard | http://localhost:3010/dashboard |
| Admin (SSO) | http://localhost:3010/api/booking/admin?slug=qa-free-studio |
| Public booking | http://127.0.0.1:8090/?thesibook_tenant=qa-free-studio |

## Checklist

- [x] `http://localhost:3010/register` — form loads (ThesiBook styling)
- [x] Register new business → workspace provisioned, session cookie set, dashboard API returns workspace
- [x] Login with same email/password works; wrong password → 401
- [x] Dashboard shows workspace **QA Free Studio**, plan **Δωρεάν**, status **Ενεργό**
- [x] Attendant count after one booking: **1 / 5**
- [x] Duplicate email registration → **409**
- [x] «Διαχείριση booking» SSO → EA calendar (`/index.php/calendar?thesibook_tenant=qa-free-studio`) without a second password
- [x] Admin: Calendar, Services, Weekly Lessons, General Settings, Booking Settings (including class-oriented toggle)
- [x] Public booking wizard: service auto-selected, slots shown, customer form, confirm
- [x] Customer **Maria Papadopoulos** booked Service with Jane Doe on 13/08/2026 15:30 Athens (stored `2026-08-13 12:30:00` UTC)
- [x] Success page: “Your appointment has been successfully registered!”
- [x] Appointment visible on admin calendar (Maria / 12:30)
- [x] Control plane: `cp_workspaces.slug=qa-free-studio`, `status=active`, `plan=free`

```sql
SELECT slug, status, plan, attendant_limit FROM cp_workspaces;
-- qa-free-studio | active | free | 5
```

## Bugs found and fixed

1. **Session warnings broke HTML** — `thesibook-bootstrap.php` started the session, then `index.php` called `ini_set('session.gc_*')` and printed warnings. SSO redirects would fail with `display_errors` on. Fixed: set GC *before* `session_start`, skip `ini_set` if a session is already active.
2. **SSO secret missing locally** — wrote gitignored `book/thesibook-sso-secret.php` matching `BOOKING_JWT_SECRET` in `frontend/.env.local`.
3. **Dashboard badge «Δωρεάν — Δωρεάν»** — free plan name + “free” price label. Now shows **Δωρεάν**.
4. **Register URL preview** was `thesibook.gr/book/{slug}`; actual URL is `thesibook.gr/book/?thesibook_tenant={slug}`.
5. **New tenants defaulted to UTC / English / example.org** — provision now sets `Europe/Athens`, Greek UI language, Monday week start, 24h time, `company_link=https://thesibook.gr`.
6. **Deploy would rsync local tenant DBs + local SSO secret to production** — `deploy-hetzner.sh` now excludes `tenants/*`, `thesibook-sso-secret.php`, `thesibook-email-config.php`, and writes the production SSO secret from `BOOKING_JWT_SECRET`.
7. **Local control-plane setup skipped SQL 005 + 007** — `scripts/setup-control-plane.sh` now applies them (same as remote).

## Known limits (not blockers for this QA)

| Item | Notes |
|------|--------|
| Free-plan **5 attendant cap** | Displayed on the dashboard; **not enforced** inside EA. A sixth customer can still book until we add a server-side check. |
| Booking confirmation email | Success page claims an email was sent. Local PHP `mail()` / SMTP may not deliver; production needs `WEBCODE_SMTP_*` in deploy `.env`. |
| This QA tenant timezone | Still UTC (created before the provision default change). **New** signups get Europe/Athens. |
| EA PHP server | Must be running on `:8090` locally (`./scripts/install-book.sh --serve` or `php -S 127.0.0.1:8090` in `book/`). |
| PayPal upgrade | Buttons render on the dashboard; live card payment was **not** charged in this QA. |
| Class-oriented mode | Toggle is in Booking Settings; default is off (classic wizard). Weekly Lessons admin page loads. |

## Production go-live (required)

1. `scripts/deploy/.env`: set `BOOKING_JWT_SECRET` (strong, unique), `BOOKING_DB_*`, `NEXT_PUBLIC_EA_BASE_URL`, `WEBCODE_SMTP_PASSWORD`, PayPal/Viva as needed.
2. `EA_PROVISION_MODE=pool` + `scripts/deploy/db-pool.json` if the host cannot `CREATE DATABASE`.
3. Deploy: `./scripts/deploy/deploy-hetzner.sh --check` then deploy. Confirm `book/thesibook-sso-secret.php` exists on the server and matches frontend `BOOKING_JWT_SECRET`.
4. Smoke on live: register a throwaway free user → dashboard → SSO admin → one public booking → email arrives.

## Agents

- Orchestrator: `agents/prompts/book-orchestrator.md`
- This QA: `agents/prompts/book-qa-local-agent.md`
