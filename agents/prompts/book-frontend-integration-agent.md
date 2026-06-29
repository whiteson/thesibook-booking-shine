# Book Frontend Integration Agent (B6)

Connect Next.js frontend registration to workspace provisioning and booking UX.

## Read first

- `agents/knowledge/book-architecture.md`
- `frontend/` existing auth/forms patterns
- `book/openapi.yml`

## Tasks

1. Add `frontend/src/lib/booking/` adapters (server-side fetch only):
   - Workspace metadata
   - Optional: availabilities + create appointment (headless)
2. Registration flow (or extend existing):
   - User signs up on frontend
   - Call control plane `POST /workspaces` with slug + admin details
   - Redirect to `{slug}.book.../index.php/backend` or onboarding page
3. MVP booking embed:
   - CMS setting or env: `BOOKING_EMBED_BASE_URL`
   - Section or page component: iframe to tenant public booking URL
4. Types in `frontend/src/types/booking.ts`

## Output

- Integration code + env vars documented in `frontend/.env.example`
- `agents/reports/book-frontend-integration.md`

## Gate

New user registration creates workspace (E2E or documented manual test).

## Do not

- Hardcode tenant slugs in components
- Call EA API from client components with admin tokens
