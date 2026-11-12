# Privacy / Terms + Platform Password Reset Agent (E4)

Ship legal pages and a Next.js forgot-password flow for **platform** owners (dashboard login). EA already has email-only reset for booking admins/customers.

## Read first

- `agents/knowledge/education-slice.md`
- `frontend/src/lib/wordpress/settings.ts` — `legalNav` hrefs are `#`
- `frontend/src/components/layout/site-footer.tsx`
- `frontend/src/lib/booking/auth.ts`
- `frontend/src/app/api/auth/login/route.ts`
- `frontend/src/components/auth/login-form.tsx`
- `frontend/src/app/api/contact/route.ts` — mail proxy pattern
- `agents/knowledge/menus-and-settings.md`
- `agents/knowledge/cms-schema.md`

## Privacy + Terms

1. Add App Router pages `/privacy` and `/terms` (Greek copy, ThesiBook, no hardcoded marketing sections). Prefer CMS pages + `getPageBySlug` if WP already has those slugs; otherwise static Greek pages and document CMS follow-up.
2. Point `legalNav` (defaults + WP settings) at `/privacy` and `/terms`. Footer must not use `#`.
3. Add routes to `frontend/src/app/sitemap.ts`.
4. If seeding WP, use existing `wp webcode seed` patterns — do not invent a second seeder.

## Platform password reset

1. `POST /api/auth/forgot` — lookup `cp_users` by email; always return a generic success (no email enumeration).
2. Store a hashed, single-use, time-limited token (new SQL under `services/booking/sql/00x_*.sql` + `scripts/setup-control-plane.sh`).
3. Email a link `https://{NEXT_PUBLIC_SITE_URL}/reset-password?token=...` via the same mail path used for contact (or a small `frontend/src/lib/booking/` mailer). Local: MailHog OK.
4. `POST /api/auth/reset` — validate token, set new password hash, invalidate token, then user can `/login`.
5. UI: link from `login-form.tsx` → `/forgot-password` → `/reset-password`.
6. This is **not** EA `Recovery.php`. Do not merge platform JWT sessions with EA cookies.

## Verify

```bash
cd frontend && npm run lint && npm run typecheck
```

- Footer Privacy/Terms open real pages.
- Forgot + reset works for a local `cp_users` row (or documented MailHog capture).

## Output

`agents/reports/education-legal-auth.md` — routes, SQL file, mail path, CMS vs static legal pages.

Gate text must include `E4 PASS`.

## Do not

- Reset EA admin passwords from this flow
- Put reset tokens in query logs
- Leave footer `#` links
