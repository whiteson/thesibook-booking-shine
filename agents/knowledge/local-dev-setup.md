# Local Dev Setup (Mac) — WordPress backend + Next.js frontend

Use this for **development on your PC**. Do **not** use `deploy-hetzner.sh` for local.

## Human prerequisites (agent cannot do these)

| # | You ensure | How |
|---|------------|-----|
| 1 | MySQL running | MAMP, `brew services start mysql`, or Docker |
| 2 | PHP served over HTTP | MAMP, Laravel Valet, or Apache docroot → your `www` folder |
| 3 | Project reachable at URL | e.g. `http://localhost/webcode-elevate/backend/` |
| 4 | `wp-cli` installed | `brew install wp-cli` (recommended) |
| 5 | Node 20+ | `node -v` |

Agent handles everything **after** MySQL is up and the project path is known.

## Credentials (defaults — override in `scripts/local.env`)

| Variable | Default | Notes |
|----------|---------|-------|
| `DB_NAME` | `{project_slug}_backend` | Created by install script |
| `DB_USER` | `root` | MAMP often `root` / `root` |
| `DB_PASSWORD` | `password` | **Change if yours differ** |
| `DB_HOST` | `localhost` | MAMP sometimes `127.0.0.1:8889` |
| `WP_ADMIN_USER` | `admin` | Only for `wp core install` |
| `WP_ADMIN_PASSWORD` | `admin` | **Pick your own** — local only |
| `WP_ADMIN_EMAIL` | `dev@localhost.test` | Any valid-looking email |

**Never commit** `scripts/local.env` with real passwords.

## Local URL pattern

```txt
WordPress:  http://localhost/{PROJECT_FOLDER}/backend/
API:        http://localhost/{PROJECT_FOLDER}/backend/wp-json/webcode/v1
WP Admin:   http://localhost/{PROJECT_FOLDER}/backend/wp-admin/
Next.js:    http://localhost:3002
MailHog UI: http://localhost:8025  (optional, for contact form)
```

`PROJECT_FOLDER` = repo folder name under your web root (e.g. `webcode-elevate` in `~/www/webcode-elevate`).

## Quick start (agent or you)

```bash
# 1. Copy local config
cp scripts/local.env.example scripts/local.env
# Edit DB_* and WP_LOCAL_URL if not using defaults

# 2. Install WP core + database (preserves backend/wp-content)
./scripts/install-wordpress.sh

# 3. WP-CLI bootstrap (install, plugins, theme, seed)
./scripts/wp-setup-local.sh

# 4. Frontend
cp frontend/.env.example frontend/.env.local
# Set WORDPRESS_API_URL to local API URL above
cd frontend && npm install && npm run dev:ssr
```

## What each script does

### `scripts/install-wordpress.sh`

- Downloads WordPress core into `backend/`
- **Preserves** existing `backend/wp-content/` (plugins, theme, ACF JSON)
- Creates MySQL database
- Writes `backend/wp-config.php` if missing

### `scripts/wp-setup-local.sh`

- Reads `scripts/local.env` (or env vars)
- `wp core install` if not installed
- Activates ACF Pro, `webcode-headless-api`, theme
- Sets permalinks `/%postname%/`
- Runs `wp webcode seed` + `wp webcode seed-options` on fresh install
- Sets `WEBCODE_FRONTEND_URL` for CORS

## Frontend `.env.local`

```bash
WORDPRESS_API_URL=http://localhost/PROJECT_FOLDER/backend/wp-json/webcode/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3002
NEXT_RENDER_MODE=ssr
```

Use `dev:ssr` while actively editing CMS content (no ISR cache delay).

## Verify

```bash
# API health
curl -s http://localhost/PROJECT_FOLDER/backend/wp-json/webcode/v1/health

# Pages
curl -s http://localhost/PROJECT_FOLDER/backend/wp-json/webcode/v1/pages/home | head

# Settings (nav)
curl -s http://localhost/PROJECT_FOLDER/backend/wp-json/webcode/v1/settings | head
```

## MAMP notes

- DB host may be `127.0.0.1:8889` (check MAMP preferences)
- Apache port often `8888` → URL `http://localhost:8888/PROJECT_FOLDER/backend/`
- Set `WP_LOCAL_URL` and `WORDPRESS_API_URL` to match

## MailHog (optional)

`backend/wp-content/mu-plugins/webcode-mailhog-smtp.php` sends mail to `127.0.0.1:1025`.

```bash
brew install mailhog
mailhog   # UI at http://localhost:8025
```

## Local vs production

| | Local | Production |
|---|-------|------------|
| Config | `scripts/local.env` | `scripts/deploy/.env` |
| Bootstrap | `wp-setup-local.sh` | `deploy-hetzner.sh` |
| WP URL | `http://localhost/.../backend` | `https://domain/.../backend` |
| Next | `npm run dev:ssr` :3002 | systemd / Node on server |

## Agent checklist

When user says "set up local backend":

1. Ask or infer: MySQL creds, `PROJECT_FOLDER`, web server URL (MAMP port?).
2. Write `scripts/local.env` from `local.env.example` (never commit secrets).
3. Run `./scripts/install-wordpress.sh` with env from `local.env`.
4. Run `./scripts/wp-setup-local.sh`.
5. Write `frontend/.env.local` with matching `WORDPRESS_API_URL`.
6. Verify health endpoint with `curl`.
7. Document chosen URLs in `agents/reports/local-dev.md`.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Cannot connect to MySQL | Start MySQL; check `DB_HOST` / MAMP port |
| 404 on backend URL | Apache docroot must parent `PROJECT_FOLDER`; check symlink/path |
| API 404 | `wp rewrite flush`; permalinks → Post name |
| CORS errors from Next | `WEBCODE_FRONTEND_URL` in wp-config extra-php; plugin CORS settings |
| Empty pages | Run `wp webcode seed`; check ACF active |
| Next shows mock only | `WORDPRESS_API_URL` wrong or API down — check `.env.local` |
