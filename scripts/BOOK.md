# Easy!Appointments in ThesiBook

`book/` is **not in git**. Install on each machine (dev Mac, production server) with:

```bash
./scripts/install-book.sh              # clone upstream into book/
./scripts/install-book.sh --native     # + MySQL database + config.php + composer
./scripts/install-book.sh --native --install  # + CLI seed (admin user)
./scripts/install-book.sh --serve      # PHP dev server on port 8090
```

Copy `scripts/book.env.example` → `scripts/book.env`. Reuses MySQL credentials from `scripts/local.env` when present.

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
