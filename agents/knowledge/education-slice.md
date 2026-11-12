# Education Slice — Weekly Classes on Local + Hetzner Staging

Product goal: education businesses can run **weekly classes** on local staging and Hetzner staging.

B0–B7 are done. This slice does **not** replace the booking pipeline.

## Environments

| Name | What it is | URLs |
|------|------------|------|
| **Local staging** | This Mac | Next `http://localhost:3010`, EA `http://127.0.0.1:8090`, WP local API |
| **Hetzner staging** | `thesiu@dedi3543` — same host as intended production | `www.thesibook.gr`, `book.thesibook.gr`, CMS under `/thesibook-booking-shine/backend/` |

There is **no second Hetzner stack**. Treat `thesibook.gr` as pre-prod: live PayPal, live SMTP, real tenant DBs. Do not rsync local `book/tenants/*` or SSO/email secret files.

## Phases (E1–E4)

| Phase | Outcome |
|------:|---------|
| E1 | Weekly lessons CRUD works; **new** tenants default to class-oriented mode; public week calendar books from those slots |
| E2 | Free plan **5 attendants** blocked inside EA (not only the dashboard bar) |
| E3 | Booking + reset + contact mail proven on Hetzner SMTP |
| E4 | Privacy + Terms pages; Next.js platform forgot-password |

**Local first** for E1 and E2. One `book-deploy.sh` after E1+E2 (orchestrator), then E3. E4 can run in parallel with E1/E2.

## Key files

| Area | Paths |
|------|--------|
| Weekly lessons | `book/application/controllers/Weekly_lessons.php`, `models/Weekly_lessons_model.php`, `assets/js/pages/weekly_lessons.js`, `libraries/Class_schedule.php`, migrations `070`, `071` |
| Class default | `services/booking/scripts/provision-tenant.sh` (`ea_settings.class_oriented_booking`) |
| Cap | `book/application/models/Appointments_model.php` + public `Booking.php`; plan lives in `cp_workspaces` |
| SMTP | Local: MailHog `127.0.0.1:1025` (UI http://localhost:8025). Hetzner: `WEBCODE_SMTP_*` in `scripts/deploy/.env` + `thesibook-email-config.php` |
| Legal | `frontend/src/lib/wordpress/settings.ts` (`legalNav` still `#`), CMS pages |
| Platform auth | `frontend/src/lib/booking/auth.ts`, `frontend/src/app/api/auth/*`, `login-form.tsx` |

## Hard rules

- Document EA forks in `book/PATCHES.md`.
- Never `php index.php console install` on a tenant with data (`migrate fresh` wipes).
- Never commit `book/config.php`, `thesibook-sso-secret.php`, `thesibook-email-config.php`, tenant `meta.json`.
- Do not invent SSH/`wp` loops — use `scripts/deploy/book-deploy.sh`, `deploy-hetzner.sh`, `setup-book-web.sh`.
- Greek UI for owner-facing and customer-facing errors.

## Related

- `agents/reports/book-qa-report.md` — known limits (cap not enforced, mail unproven)
- `agents/knowledge/book-architecture.md`
- `agents/knowledge/paypal-checkout.md` — free = 5 attendants
- `scripts/deploy/GO-LIVE.md`
