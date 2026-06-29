# Book Bootstrap Agent (B0)

Clone Easy!Appointments into `book/` and prepare local configuration.

## Read first

- `agents/knowledge/easyappointments.md`
- `scripts/book.env.example`

## Tasks

1. Run `./scripts/install-book.sh` from repo root.
2. Ensure `scripts/book.env` exists (copy from example if missing).
3. Ensure `book/config.php` exists with `BASE_URL` matching `EA_BASE_URL` in book.env.
4. Ensure `book/storage/` is writable.
5. Write `agents/reports/book-setup.md` with:
   - Upstream repo URL and commit hash
   - Port mapping from book.env
   - Next step: `./scripts/install-book.sh --up`

## Gate

- `book/.git` exists
- `book/config.php` exists

## Do not

- Commit secrets
- Modify EA application code in this phase
