# E2 — Free-plan attendant cap

**Date:** 2026-11-12  
**Gate:** E2 PASS

## Enforcement

`Appointments_model::save()` calls `Thesibook_plan::assert_can_add_new_attendant()` before insert, and before an update that switches the appointment to a customer who has never booked.

An attendant is `COUNT(DISTINCT id_users_customer)` on `ea_appointments` where `is_unavailability = 0`. Same definition as `getTenantAttendantCount` in `frontend/src/lib/booking/db.ts`.

## Plan source

Current `thesibook_tenant` slug → control plane `cp_workspaces` (`plan`, `attendant_limit`, `plan_expires_at`). Credentials come from `book/thesibook-control-plane.php` if present, otherwise `BOOKING_DB_*` in the environment or `frontend/.env.local`.

- `free`: cap is `attendant_limit` (default 5).
- `small` / `unlimited` with `plan_expires_at` in the future, or a paid plan with a null expiry: no cap.
- Paid plan whose `plan_expires_at` is in the past: treated as free, limit 5 (not the stored unlimited number).
- No tenant slug (plain single-tenant EA): no cap.
- Slug set but the control plane cannot be read: new attendants are blocked (fail closed).

Customer-facing booking gets the Greek message. Admin and API gets English. Updates and unavailability blocks do not consume a seat.

## Local proof (`qa-free-studio`, 3 existing attendants)

1. Limit temporarily set to 3. A new email on an open lesson returned HTTP 500 with: «Το δωρεάν πλάνο δέχεται έως 3 συμμετέχοντες…». No appointment row was created.
2. Maria, who already had a booking, could still book another slot.
3. Plan set to `small` with expiry one year ahead, limit column left at 3. A new person booked the yoga class (appointment created, then removed).
4. Plan restored to `free`, limit `5`. Dashboard reads `3 / 5`.

PayPal was not charged.
