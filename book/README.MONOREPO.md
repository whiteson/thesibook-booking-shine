# Easy!Appointments in ThesiBook monorepo

`book/` is **part of this repository** — commit and push to **your** GitHub (`thesibook-booking-shine`).

**Do not** push changes to [alextselegidis/easyappointments](https://github.com/alextselegidis/easyappointments). That is upstream open source; we only borrowed the starting code.

## What goes in git

| Track in our repo | Gitignored (local/server only) |
|-------------------|--------------------------------|
| EA source under `book/` | `book/config.php` (DB passwords) |
| Our patches in `book/` | `book/vendor/` (run `composer install`) |
| `scripts/book/` templates | `book/storage/*` runtime |
| `services/booking/` | `scripts/book.env` |

## Install / update

```bash
./scripts/install-book.sh --native --install
./scripts/install-book.sh --serve
```

Fresh clone uses `install-book.sh` once; it removes `book/.git` so EA is not a nested repo.

To pull upstream EA releases: download a release tag manually or merge files carefully — never add their remote as a push target.

## Production

```bash
./scripts/deploy/book-deploy.sh   # rsync book/ to your server
```

See `scripts/BOOK.md` and `agents/knowledge/book-architecture.md`.
