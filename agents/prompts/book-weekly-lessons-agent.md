# Weekly Lessons + Class Mode Agent (E1)

Finish weekly class scheduling so education tenants can publish a week calendar and take bookings.

## Read first

- `agents/knowledge/education-slice.md`
- `book/PATCHES.md`
- `book/application/controllers/Weekly_lessons.php`
- `book/application/models/Weekly_lessons_model.php`
- `book/assets/js/pages/weekly_lessons.js`
- `book/application/libraries/Class_schedule.php`
- `book/application/migrations/070_add_class_oriented_booking_setting.php`
- `book/application/migrations/071_create_weekly_lessons_table.php`
- `services/booking/scripts/provision-tenant.sh`
- `agents/reports/book-qa-report.md`

## Local first

1. Confirm EA is up: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8090/` (expect 200/302). Start with `./scripts/install-book.sh --serve` if down.
2. Confirm `ea_weekly_lessons` exists on the QA tenant (and default tenant). Migrate with `php index.php console migrate` — **never** `console install` on a DB with data.
3. Fix admin CRUD: save/update/delete, weekday + `HH:MM` time, service + provider, capacity, active flag, Greek/English toasts. Keep `?thesibook_tenant=` on AJAX (`assets/js/utils/url.js`).
4. **New tenants:** `provision-tenant.sh` sets `class_oriented_booking=1` (and keep Europe/Athens + Greek already there). Existing tenants stay as-is unless the user asks to flip them.
5. Public booking: with class mode on and at least one active lesson, `/` (or class booking view) shows the week calendar; click-to-book creates an appointment on that slot; occupancy respects lesson/service capacity.
6. Empty state: class mode on + no lessons → clear admin-facing empty copy, not a blank calendar.
7. Update `book/PATCHES.md` for any new EA files.

## Hetzner book deploy

Only if the user asked or `EDUCATION_DEPLOY=true`. Use `./scripts/deploy/book-deploy.sh` (excludes secrets). Then run `php index.php console migrate` **per tenant** on the server — never `migrate fresh`. Log SKIP if not deployed.

## Verify

- Admin: `http://127.0.0.1:8090/index.php/weekly_lessons?thesibook_tenant=qa-free-studio` (or current QA slug) — create, edit, delete one lesson.
- Public: class calendar lists that lesson; one test booking appears on the admin calendar.
- New provision (or dry-run of the SQL in `provision-tenant.sh`) includes `class_oriented_booking=1`.

## Output

`agents/reports/education-weekly-lessons.md` — files changed, how to test, Hetzner deploy status (done/SKIP), risks.

Gate text must include `E1 PASS` or `SKIP_HETZNER` plus a local PASS note.

## Do not

- Wipe `ea_*` tables
- Commit tenant `meta.json` or default-tenant secrets
- Change shared-schema / `tenant_id` strategy
