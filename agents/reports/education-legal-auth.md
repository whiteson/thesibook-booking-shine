# E4 — Privacy, terms, platform password reset

**Date:** 2026-11-12  
**Gate:** E4 PASS

## Legal pages

Static Greek App Router pages, not CMS sections:

- `/privacy` — Πολιτική απορρήτου
- `/terms` — Όροι χρήσης

`legalNav` defaults point at those paths. A WordPress legal link whose href is `#` is rewritten to `/privacy` or `/terms`. Homepage footer has zero `href="#"`. Both routes are in `sitemap.ts`.

CMS follow-up: if legal copy should be edited in WordPress later, add pages with those slugs. The App Router routes win over `[slug]` until that is intentional.

## Password reset

Platform owners only (`cp_users`). Not Easy!Appointments `Recovery.php`.

| Piece | Path |
|------:|------|
| SQL | `services/booking/sql/009_password_resets.sql` |
| Request link | `POST /api/auth/forgot` |
| Set password | `POST /api/auth/reset` |
| UI | `/forgot-password`, `/reset-password`, link on the login form |
| Mail | `frontend/src/lib/booking/mail.ts` (nodemailer). Local default `127.0.0.1:1025` |

Token is 32 random bytes, stored as SHA-256, single use, expires in 1 hour. Unknown emails get the same success JSON as known emails.

## Local proof

- Footer and both legal pages return 200.
- Forgot-password for the QA owner arrived in MailHog in Greek, with a one-hour link.
- Reset succeeded. Replaying the same token returned 400.
- Login with the new password succeeded. Password was then restored to the existing QA password and that login succeeded again.
- Wrong password still returns 401. Duplicate registration returns 409.

`cd frontend && npm run lint && npm run typecheck` — PASS.
