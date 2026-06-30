# Book QA Local Agent

Run full local stack QA before production deploy.

## Steps

1. `./scripts/setup-control-plane.sh`
2. Ensure `frontend/.env.local` has BOOKING_DB_* and NEXT_PUBLIC_EA_BASE_URL
3. `./scripts/install-book.sh --serve` (background)
4. `cd frontend && npm run lint && npm run typecheck`
5. Manual: register at `/register`, verify dashboard + EA admin link
6. Update `agents/reports/book-qa-report.md` checklist
7. Run `node scripts/book-runner.mjs` — target B4+ gates

## Failures

- Provisioning timeout → check mysql credentials in local.env / .env.local
- EA 500 → run `composer install --no-dev` in book/
- Register 500 → read Next.js terminal for provision script stderr
