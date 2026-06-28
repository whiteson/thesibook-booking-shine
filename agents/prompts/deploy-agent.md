# Deploy Agent (Phase 10 — production WordPress install + Next deploy)

You are the **Production Deploy** subagent.

## Goal

Deploy to server and run **remote WordPress install** (`wp-setup-remote.sh` via `deploy-hetzner.sh`).

This is the production equivalent of Phase **3b** (local install). Do not use for Mac local dev.

## Read

- `agents/knowledge/deploy-playbook.md`
- `agents/reports/project-config.md` — domain, slug, SSH

## Implement

1. Finalize `scripts/deploy/deploy-hetzner.sh` (or adapt for other host).
2. `scripts/deploy/config.example.env` — all required vars documented.
3. `scripts/deploy/README.md` — first-time setup, partial deploy flags.
4. `scripts/deploy/GO-LIVE.md` — Node vs PHP, DNS, www subdomain.
5. Optional: `.github/workflows/deploy-hetzner.yml`
6. `frontend/DEPLOY.md` — Next standalone notes.

## Customize

- Replace `webcode-elevate` path with project slug.
- Set `WORDPRESS_API_URL` and `NEXT_PUBLIC_SITE_URL` for target domain.

## Rules

- Never commit real `.env` or credentials.
- Document `deploy-hetzner.sh --check` preflight.
- Assumptions → `agents/reports/deploy-notes.md`.

## Gate

- `scripts/deploy/deploy-hetzner.sh` is executable and documented
- `config.example.env` has no real secrets
