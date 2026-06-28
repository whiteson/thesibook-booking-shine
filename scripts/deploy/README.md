# Automated deploy (webcode.gr / your-server.de)

**One command** deploys WordPress (files + DB install + plugins + seed) and Next.js:

```bash
cp scripts/deploy/config.example.env scripts/deploy/.env
# Fill MySQL credentials + admin password in .env
chmod +x scripts/deploy/deploy-hetzner.sh
./scripts/deploy/deploy-hetzner.sh
```

The script prints a **configuration summary** and runs **preflight checks** (SSH, `public_html`, `wp-cli`, local Node), then asks `Proceed with deploy? [y/N]` unless `DEPLOY_YES=true` or CI.

Only `$DEPLOY_REMOTE_ROOT/thesibook-booking-shine/` is updated; other domains on the server are untouched.

## Before first deploy

1. **SSH works:** `ssh -p 222 webcode@dedi3543.your-server.de`
2. **MySQL database** created in the hosting panel (name/user/password → `.env`)
3. **`wp-cli`** available on the server (`wp --info`)
4. **Node 20+** on the server (for Next standalone + systemd, or proxy only)

## What the script does

| Step | Action |
|------|--------|
| 1 | `rsync` `backend/` → `/usr/home/webcode/thesibook-booking-shine/backend/` (keeps server `wp-config.php` + `uploads/` after first run) |
| 2 | Uses your existing `public_html` — adds only `public_html/thesibook-booking-shine/backend` → symlink to backend files (`https://webcode.gr/thesibook-booking-shine/backend/`) |
| 3 | **WP bootstrap:** `wp-config.php` (if missing), `wp core install`, ACF + headless plugin, theme, permalinks, `wp webcode seed` on first install |
| 4 | Build Next locally, `rsync` standalone → `.../frontend/` |
| 5 | Restart `webcode-frontend` systemd if installed |

### Partial deploy

```bash
DEPLOY_SKIP_FRONTEND=true ./scripts/deploy/deploy-hetzner.sh
DEPLOY_SKIP_BACKEND=true ./scripts/deploy/deploy-hetzner.sh
DEPLOY_WP_SETUP=false ./scripts/deploy/deploy-hetzner.sh   # files only, no wp-cli
```

### Next.js process (one-time on server)

If systemd is not set up yet:

```bash
scp -P 222 scripts/deploy/remote-install.sh webcode@dedi3543.your-server.de:/tmp/
ssh -p 222 webcode@dedi3543.your-server.de \
  'bash /tmp/remote-install.sh /usr/home/webcode 3002 webcode webcode'
```

Point `https://webcode.gr` (or `www`) to `127.0.0.1:3002` in nginx/Apache/panel.

## GitHub Actions

Secrets: `DEPLOY_SSH`, `DEPLOY_SSH_PORT`, `DEPLOY_SSH_KEY`, `DEPLOY_REMOTE_ROOT`, `WORDPRESS_API_URL`, `NEXT_PUBLIC_SITE_URL`, plus `WP_DB_*` and `WP_ADMIN_*` for first-time WP install.

## Optional: git pull on server

```bash
./scripts/deploy/deploy-hetzner-git.sh
```

Clone must live at `.../thesibook-booking-shine/source/` — prefer `deploy-hetzner.sh` for normal deploys.
