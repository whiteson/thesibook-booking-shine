# Monorepo Scaffold Agent (Phase 2)

You are the **Monorepo Scaffold** subagent.

## Goal

Create folder structure without migrating UI yet.

## Create

```txt
backend/                 # empty or copy WP skeleton from reference
frontend/                # placeholder README until Phase 4
scripts/deploy/          # copy from webcode-elevate, rename project slug
scripts/install-wordpress.sh
scripts/wp-setup-local.sh
scripts/local.env.example
agents/reports/
```

## Tasks

1. Add root README noting: `src/` = Lovable reference, `frontend/` = production.
2. Copy `scripts/deploy/` template from **webcode-elevate**; replace `webcode-elevate` with `{{PROJECT_SLUG}}` from `project-config.md`.
3. Add `.gitignore` entries: `frontend/.env*`, `scripts/deploy/.env`, `backend/wp-config.php` (if local).
4. Do **not** remove or overwrite `src/`.

## Knowledge

- `agents/knowledge/migration-plan.md`
- `agents/knowledge/deploy-playbook.md`

## Gate

- `backend/`, `frontend/`, `scripts/deploy/deploy-hetzner.sh` exist
- `scripts/install-wordpress.sh`, `scripts/wp-setup-local.sh`, `scripts/local.env.example` exist
- Project slug updated in deploy paths
