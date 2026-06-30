# Easy!Appointments in ThesiBook

`book/` lives **in this repo** — push to **your** GitHub only, never to upstream EA.

```bash
./scripts/install-book.sh              # config + deps (first time)
./scripts/install-book.sh --native     # + MySQL database + composer
./scripts/install-book.sh --native --install  # + CLI seed (admin user)
./scripts/install-book.sh --serve      # PHP dev server on port 8090
```

Copy `scripts/book.env.example` → `scripts/book.env`. Reuses MySQL credentials from `scripts/local.env` when present.

## Git policy

- **Yes:** commit `book/` source to `thesibook-booking-shine`
- **No:** push to `github.com/alextselegidis/easyappointments`
- **No:** commit `book/config.php`, `book/vendor/`, or `scripts/book.env`

## Production (no Docker)

On the server after rsync or clone of **this monorepo** (without `book/`):

```bash
./scripts/install-book.sh --native --install
./scripts/deploy/book-setup-remote.sh   # nginx + PHP-FPM paths (one-time)
```

EA is deployed via **rsync from your machine**, not published as a public GitHub fork.

## Docs

- Architecture: `agents/knowledge/book-architecture.md`
- Pipeline: `node scripts/book-runner.mjs`
- Skill: `.cursor/skills/wcproject-booking-platform/SKILL.md`
