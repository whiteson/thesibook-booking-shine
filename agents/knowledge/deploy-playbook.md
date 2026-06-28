# Deploy Playbook (v2)

**Production only.** For local Mac development use `agents/knowledge/local-dev-setup.md` instead.

Proven on Hetzner shared hosting (konsoleH). Adapt host/paths per project.

## One-command deploy

```bash
cp scripts/deploy/config.example.env scripts/deploy/.env
# Fill: SSH, DB, WP admin, API URL, NEXT_PUBLIC_SITE_URL
chmod +x scripts/deploy/deploy-hetzner.sh
./scripts/deploy/deploy-hetzner.sh
```

Preflight: `./scripts/deploy/deploy-hetzner.sh --check`

## What deploy-hetzner.sh does

1. Rsync `backend/` to server (`$DEPLOY_REMOTE_ROOT/webcode-elevate/backend/`)
2. Symlink `public_html/.../backend` → backend files (CMS URL under domain subpath)
3. WP bootstrap if fresh: `wp core install`, plugins, theme, permalinks, `wp webcode seed`
4. Build Next locally (`npm ci && npm run build` in `frontend/`)
5. Rsync Next **standalone** output to server `frontend/`
6. Write `.env.production` on server
7. Restart systemd `webcode-frontend` if present

## Partial deploy flags

```bash
DEPLOY_SKIP_FRONTEND=true ./scripts/deploy/deploy-hetzner.sh
DEPLOY_SKIP_BACKEND=true ./scripts/deploy/deploy-hetzner.sh
DEPLOY_WP_SETUP=false ./scripts/deploy/deploy-hetzner.sh
DEPLOY_YES=true ./scripts/deploy/deploy-hetzner.sh   # non-interactive (CI)
```

## Server layout (example)

```txt
/usr/home/USER/webcode-elevate/
  backend/          # WordPress files
  frontend/         # Next standalone
public_html/
  PROJECT/backend/  # symlink → backend (CMS at /PROJECT/backend/)
```

## Environment variables

| Variable | Purpose |
|----------|---------|
| `WORDPRESS_API_URL` | `https://domain/.../wp-json/webcode/v1` |
| `NEXT_PUBLIC_SITE_URL` | Public Next.js origin |
| `NEXT_RENDER_MODE` | `isr` (default), `ssr`, or `static` |
| `WP_DB_*` | MySQL for remote WP install |
| `DEPLOY_SSH`, `DEPLOY_SSH_PORT` | SSH access |

## Hosting: Node vs PHP

konsoleH often allows **one** of Node or PHP per domain apex.

**Recommended split:**

- Apex domain (`example.com`) — PHP (legacy apps + WordPress CMS path)
- `www` subdomain — Node.js (Next.js public site)

Document the chosen split in `scripts/deploy/GO-LIVE.md`.

## GitHub Actions

Template: `.github/workflows/deploy-hetzner.yml`  
Secrets: SSH key, remote root, DB, API URL, site URL.

## Agent tasks for deploy phase

1. Copy `scripts/deploy/` from reference repo.
2. Replace `webcode-elevate` path segment with new project slug.
3. Update `config.example.env` placeholders.
4. Document DNS + Node subdomain steps in `GO-LIVE.md`.
5. Never commit `.env` with real credentials.

## Reference

`webcode-elevate/scripts/deploy/README.md`, `GO-LIVE.md`, `deploy-hetzner.sh`
