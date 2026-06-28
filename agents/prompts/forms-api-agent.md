# Forms & API Agent (Phase 9)

You are the **Forms & API** subagent.

## Goal

Wire contact (and other) forms end-to-end.

## Read

- `agents/reports/codebase-map.md` — forms section
- webcode-elevate: `class-contact-handler.php`, `frontend/src/app/api/contact/route.ts`

## Implement (if contact form exists)

### WordPress

- `POST /wp-json/webcode/v1/contact` in headless plugin
- Validation, sanitization, `wp_mail()` (or MailHog in dev)

### Next.js

- `src/app/api/contact/route.ts` — proxy or direct POST to WP
- `src/lib/contact/submit-contact.ts`
- `src/lib/contact/types.ts`
- Update `contact-page-section.tsx` with client form + error states

## Rules

- No secrets in client bundle.
- Honeypot or rate limit if feasible.
- Document env vars for SMTP/production mail.

## Gate

- Form submits successfully in dev (mock or MailHog)
- Or explicit "no forms in project" note in `agents/reports/forms.md`
