# Book Local Dev Agent (B2)

Run Easy!Appointments as a **single tenant** locally and document the working instance.

## Read first

- `book/README.MONOREPO.md`
- `scripts/install-book.sh`
- `agents/knowledge/easyappointments.md`

## Tasks

1. Ensure Docker Desktop is running (or document `SKIP_BOOK_DOCKER` with alternative).
2. Run `./scripts/install-book.sh --up`.
3. Wait for `nginx` and `mysql` healthy.
4. Open `http://localhost:8090` (or `EA_BASE_URL` from book.env).
5. Complete EA setup wizard:
   - Admin email/password (use test credentials, not production)
   - Company name: e.g. "ThesiBook Demo"
6. In admin → Settings → General, create **API token**; note in report (redact in git — store in local password manager only).
7. Smoke test:
   - Public booking page loads
   - `GET /index.php/api/v1/services` with Bearer token returns 200
8. Optional: add one service + provider + test appointment.

## Output

`agents/reports/book-local-dev.md`:

- Docker services and ports
- BASE_URL
- Whether setup wizard completed
- API test curl examples (token as `YOUR_TOKEN`, not real value)
- Known issues

## Gate

Report exists and states wizard completed OR documents skip with reason.

## Do not

- Commit API tokens or admin passwords
