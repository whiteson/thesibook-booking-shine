---
name: webcode-headless-front
description: >-
  Blocks public WordPress theme output on headless CMS URLs with a minimal logo
  screen linking to the Next.js frontend. Use when the backend URL shows the full
  WP theme instead of a blocking page, when setting up webcode headless migrations,
  copying from webcode-elevate, or deploying mu-plugins for ThesiBook/webcode projects.
---

# Webcode Headless Front (blocking page)

## Problem

In headless WordPress + Next.js setups, the CMS lives at a path like:

`https://thesibook.gr/thesibook-booking-shine/backend/`

Without a blocker, visitors see the **full webcode theme** (header, footer, page builder). The public site should only live on **Next.js** (`https://www.thesibook.gr`). The CMS URL must show a **minimal blocking screen** (logo or site name → link to frontend).

## Solution

Must-use plugin copied from **webcode-elevate**:

```txt
backend/wp-content/mu-plugins/webcode-headless-front.php
```

MU-plugins load automatically — no activation in wp-admin.

## Behavior

On `template_redirect` (priority 0), for public requests:

| Path | Result |
|------|--------|
| `/wp-json/*` | Pass through (REST API) |
| `/wp-admin/*` | Pass through |
| `/wp-login.php` | Pass through |
| Everything else | Minimal HTML page, `noindex`, exit |

The blocking page:

- Dark background (`#141418`), centered logo or uppercase site name
- Link target: `WEBCODE_FRONTEND_URL` from `wp-config.php` (fallback: `http://localhost:3000/`)
- Logo: ACF Options `header_logo`, then `footer_logo`

## Required wp-config

Set during deploy (`scripts/deploy/wp-setup-remote.sh` / `deploy-hetzner.sh`):

```php
define('WEBCODE_FRONTEND_URL', 'https://www.thesibook.gr');
define('WEBCODE_HEADLESS_CORS_ORIGINS', 'https://www.thesibook.gr,https://thesibook.gr');
```

## Setup checklist

When scaffolding a new headless project or fixing a missing blocker:

1. **Copy plugin** from webcode-elevate:
   ```bash
   mkdir -p backend/wp-content/mu-plugins
   cp /path/to/webcode-elevate/backend/wp-content/mu-plugins/webcode-headless-front.php \
      backend/wp-content/mu-plugins/
   ```
2. **Commit** `backend/wp-content/mu-plugins/webcode-headless-front.php` in the monorepo.
3. **Ensure** `WEBCODE_FRONTEND_URL` is in remote `wp-config.php` extra-php.
4. **Deploy backend** (rsync includes `wp-content/mu-plugins/`):
   ```bash
   ./scripts/deploy/deploy-hetzner.sh
   # or backend-only: DEPLOY_SKIP_FRONTEND=true ./scripts/deploy/deploy-hetzner.sh
   ```
5. **Verify**:
   ```bash
   curl -sI "https://DOMAIN/PROJECT/backend/" | head -5
   # content-type: text/html, no full theme markup

   curl -s "https://DOMAIN/PROJECT/backend/" | grep -o 'href="[^"]*"'
   # should link to Next.js public URL

   curl -s "https://DOMAIN/PROJECT/backend/wp-json/webcode/v1/health"
   # {"ok":true,...}
   ```

## Production paths (ThesiBook)

| Item | Value |
|------|-------|
| CMS web root | `/usr/home/thesiu/public_html/thesibook-booking-shine/backend` |
| MU-plugin | `.../backend/wp-content/mu-plugins/webcode-headless-front.php` |
| Public site | `https://www.thesibook.gr` |
| API | `https://thesibook.gr/thesibook-booking-shine/backend/wp-json/webcode/v1` |

Deploy rsync target for WordPress web files: `DEPLOY_PUBLIC_HTML/${DEPLOY_PROJECT_DIR}/backend`.

## Common mistakes

1. **Plugin only in repo path, not public_html** — konsoleH serves CMS from `public_html/.../backend`. Sync mu-plugins to the web path.
2. **Missing from initial scaffold** — `webcode-headless-api` plugin alone does not block the theme; the MU-plugin is separate.
3. **Expecting redirect** — it renders inline HTML and `exit`s; it does not 301 to Next.js (API and admin must stay on CMS host).
4. **No logo** — without ACF Options logo, fallback text (site name) is correct; upload logo in WP admin → Options.

## Related (www proxy — separate issue)

If `https://www.thesibook.gr/` 404s with slug `index.html`, fix Apache proxy in `scripts/deploy/apply-thesibook-proxy.sh` (DirectoryIndex → proxy `/index.html` to Node root). That is **frontend routing**, not this blocking page.

## Reference

Canonical source: `webcode-elevate/backend/wp-content/mu-plugins/webcode-headless-front.php`

Also documented in: `agents/knowledge/wordpress-backend.md` (headless front section)
