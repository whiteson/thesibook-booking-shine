# E1 — Weekly lessons + separate events

**Date:** 2026-11-12  
**Gate:** E1 PASS (local). Hetzner book deploy: pending in the go-live step, not part of this file's local proof.

## What works

- Admin weekly lessons: weekday, `HH:MM`, service, provider, optional capacity, active flag. Empty table copy is Greek/English.
- New tenants: `provision-tenant.sh` sets `class_oriented_booking=1` only on a fresh EA install. Existing studios stay as they are.
- Public class page shows the week calendar from those lessons. Click-to-book creates an appointment.
- One-off events are a separate list (`studio_events`), not a weekly repeat. Local proof on `qa-free-studio`:
  - Hatha Yoga, Wednesday 19:00, capacity 12, 1 seat booked (Maria Papadopoulos, 18 Nov 2026).
  - Εργαστήριο αναπνοής, 21 Nov 2026 11:00, capacity 15, 1 seat booked (Nikos Testopoulos). The event is not copied onto every week.

## Files

- `book/application/migrations/072_create_studio_events_table.php`
- `book/application/controllers/Studio_events.php`, `Weekly_lessons.php` (capacity field)
- `book/application/models/Studio_events_model.php`, `Weekly_lessons_model.php`
- `book/application/libraries/Class_schedule.php`
- `book/application/controllers/Booking.php` (`get_events`, event slot check)
- `book/assets/js/pages/class_booking.js`, `studio_events.js`, `weekly_lessons.js`
- `services/booking/scripts/provision-tenant.sh`
- `book/application/config/app.php` cache token `TSB1112` so browsers load the new calendar script

## How to test

1. Open the public booking URL with `?thesibook_tenant=qa-free-studio`.
2. Weekly grid: Hatha Yoga on Wednesday 19:00.
3. Section **Εκδηλώσεις** (Greek UI): Εργαστήριο αναπνοής, separate from the week grid.
4. Admin (after SSO): Services → Εβδομαδιαία μαθήματα and Εκδηλώσεις. Both pages redirect to login when signed out.

## Risks

- An existing studio stays in classic wizard mode until Booking Settings → class-oriented booking is on. New signups get class mode.
- Event card dates use Moment's default English `LL` format. FullCalendar weekday labels follow the studio language.
