# Go live: ThesiBook on thesibook.gr

## Architecture

| URL | Serves |
|-----|--------|
| `https://thesibook.gr/` | Next.js (Node, port 3002) |
| `https://thesibook.gr/thesibook-booking-shine/backend/` | Headless WordPress CMS + REST API |
| `https://thesibook.gr/thesibook-booking-shine/backend/wp-admin/` | CMS admin |

## Pre-flight (local)

```bash
# 1. WordPress + Greek seed
./scripts/install-wordpress.sh
./scripts/wp-setup-local.sh

# 2. Frontend env
cp frontend/.env.example frontend/.env.local
# WORDPRESS_API_URL=http://localhost/thesibook-booking-shine/backend/wp-json/webcode/v1

# 3. Validation
cd frontend && npm run lint && npm run typecheck && npm run build

# 4. Smoke test API
curl -s http://localhost/thesibook-booking-shine/backend/wp-json/webcode/v1/health
curl -s http://localhost/thesibook-booking-shine/backend/wp-json/webcode/v1/pages/home | head -c 400
```

## Production deploy

```bash
cp scripts/deploy/config.example.env scripts/deploy/.env
# Edit: DEPLOY_SSH, MySQL credentials, WP admin password

./scripts/deploy/deploy-hetzner.sh --check   # review config
./scripts/deploy/deploy-hetzner.sh           # deploy WP + Next.js
```

Deploy writes `frontend/.env.production` on the server with `WORDPRESS_API_URL` and `NEXT_PUBLIC_SITE_URL`.

## Start Next.js on server

```bash
ssh -p 222 USER@HOST
bash /usr/home/webcode/thesibook-booking-shine/start-frontend.sh
curl -I http://127.0.0.1:3002/
```

Or from Mac after deploy:

```bash
scp -P 222 scripts/deploy/start-frontend.sh USER@HOST:/usr/home/webcode/thesibook-booking-shine/
ssh -p 222 USER@HOST 'bash /usr/home/webcode/thesibook-booking-shine/start-frontend.sh'
```

## Point domain root to Node

In the hosting panel for **thesibook.gr**, set reverse proxy / Node.js:

- App path: `/usr/home/webcode/thesibook-booking-shine/frontend`
- Start: `server.js` (standalone build)
- Port: `3002`
- **Keep** PHP handling for `/thesibook-booking-shine/backend/`

If no panel option, ask support for:

```apache
ProxyPass /thesibook-booking-shine/backend !
ProxyPass / http://127.0.0.1:3002/
ProxyPassReverse / http://127.0.0.1:3002/
```

## Go-live checklist

- [ ] `curl http://127.0.0.1:3002/` → 200 on server
- [ ] `https://thesibook.gr/thesibook-booking-shine/backend/wp-json/webcode/v1/health` → 200
- [ ] `https://thesibook.gr/thesibook-booking-shine/backend/wp-json/webcode/v1/pages/home` → Greek sections (`hero`, `faq`, …)
- [ ] `https://thesibook.gr/` → ThesiBook Next.js site
- [ ] Early access form submits (POST `/api/contact` → WordPress `wp_mail`)
- [ ] Nav links go to `/business`, not `/backend/business`
- [ ] CMS admin login works at `/thesibook-booking-shine/backend/wp-admin/`

## Re-seed CMS after content changes

```bash
ssh -p 222 USER@HOST
cd /usr/home/webcode/public_html/thesibook-booking-shine/backend
wp webcode seed --url=https://thesibook.gr/thesibook-booking-shine/backend
```

Or set `DEPLOY_WP_SEED=true` and redeploy.

## Optional follow-ups

- Privacy / Terms pages (footer links still `#`)
- Real logo asset if replacing `frontend/public/thesibook-logo.svg`
- systemd service: `scripts/deploy/remote-install.sh`
