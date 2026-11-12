# Free-Plan Attendant Cap Agent (E2)

Enforce the free-plan **5 attendant** limit inside Easy!Appointments. The dashboard bar is display-only today (`agents/reports/book-qa-report.md`).

## Read first

- `agents/knowledge/education-slice.md`
- `agents/knowledge/paypal-checkout.md`
- `frontend/src/lib/booking/plans.ts` — `planLimitFromId('free') === 5`
- `frontend/src/app/api/dashboard/route.ts` — `getTenantAttendantCount`
- `frontend/src/lib/booking/db.ts` — how count is queried
- `book/application/models/Appointments_model.php` — `save()` / `insert()`
- `book/application/controllers/Booking.php` — public create path
- `book/thesibook-bootstrap.php` — current tenant slug

## Tasks

1. Define **attendant** the same way as the dashboard (unique customers with at least one non-unavailability appointment, unless `getTenantAttendantCount` already uses a different rule — **match that function**, do not invent a second definition).
2. On **new** appointment create (public booking, class booking, REST API, admin add): if the workspace plan is `free` and count is already at `attendant_limit` (default 5), reject with a Greek customer message and an English admin/API message.
3. Resolve plan from control plane `cp_workspaces` for the current `thesibook_tenant` slug. If control plane is unreachable, fail **closed** for public booking on unknown tenants, or document a safe local fallback (e.g. setting `thesibook_attendant_limit` in tenant meta) — pick one and write it in the report.
4. Paid plans (`small`, `unlimited`) and `plan_expires_at` in the future: no cap. Expired paid → treat as free (same as billing should).
5. Updates/cancels of existing appointments do not consume a new attendant if the customer already exists.
6. Dashboard already shows the bar; keep numbers in sync (count refresh on create is enough if dashboard re-queries).
7. Add/adjust a Greek string in `application/language/greek/translations_lang.php` and English counterpart.
8. Document the hook in `book/PATCHES.md`.

## Verify (local)

- Free tenant at 5 attendants: 6th public booking fails; no new `ea_appointments` row.
- Paid tenant (or temporarily raised limit): 6th booking succeeds.
- Dashboard still shows `n / 5` for free.

Do not charge PayPal in this phase.

## Output

`agents/reports/education-attendant-cap.md` — enforcement point (file + function), count definition, how plan is read, test results.

Gate text must include `E2 PASS`.

## Do not

- Enforce only in Next.js
- Trust the client
- Change PayPal plan prices
