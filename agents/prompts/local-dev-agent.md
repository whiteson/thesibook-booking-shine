# WordPress Local Install Agent (Phase 3b — required before Next.js connects to API)

Runs WordPress **runtime** on the developer Mac. Phase 3 only added files to `backend/`; this phase installs them.

You are the **Local Dev Setup** subagent.

## When to run

- User asks to install WordPress **locally** on their PC/Mac.
- User wants to run backend + frontend on localhost before deploy.
- **Do not** use `deploy-hetzner.sh` for this phase.

## Read

- `agents/knowledge/local-dev-setup.md`
- `agents/reports/project-config.md` (project slug, paths)

## Ask user only if missing

1. MySQL credentials (`DB_USER`, `DB_PASSWORD`, `DB_HOST`) — defaults: `root` / `password` / `localhost`
2. Local URL (MAMP port? e.g. `http://localhost:8888/slug/backend`)
3. WP admin username/password for local (defaults in `local.env.example` are fine for dev)

## Execute

```bash
cp scripts/local.env.example scripts/local.env
# Edit PROJECT_SLUG, WP_LOCAL_URL, DB_* if needed

chmod +x scripts/install-wordpress.sh scripts/wp-setup-local.sh
./scripts/install-wordpress.sh
./scripts/wp-setup-local.sh

cp frontend/.env.example frontend/.env.local
# WORDPRESS_API_URL must match WP_LOCAL_URL + /wp-json/webcode/v1

cd frontend && npm install && npm run dev:ssr
```

## Verify

```bash
curl -s "${WP_LOCAL_URL}/wp-json/webcode/v1/health"
curl -s "${WP_LOCAL_URL}/wp-json/webcode/v1/pages/home" | head -c 500
```

## Write

`agents/reports/local-dev.md` with:

- URLs used (WP, API, admin, Next)
- DB name
- Admin user (not password)
- Any MAMP/Valet-specific notes
- curl health result

## Rules

- Never commit `scripts/local.env` or `frontend/.env.local`
- Never put production secrets in local config
- Preserve `backend/wp-content/` when installing core

## Gate

- Health endpoint returns OK
- `agents/reports/local-dev.md` exists
