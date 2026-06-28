# Local Dev Setup — ThesiBook

**Status:** Ready

## Verified

- MySQL at `root@localhost` (password in `scripts/local.env`)
- Database `thesibook_booking_shine_backend`
- WordPress installed + ACF Pro + headless plugin
- ThesiBook Greek content seeded (`wp webcode seed`)

## Quick start

```bash
cp scripts/local.env.example scripts/local.env
./scripts/install-wordpress.sh
./scripts/wp-setup-local.sh

cp frontend/.env.example frontend/.env.local
cd frontend && npm run dev
```

## Verify

```bash
curl -s http://localhost/thesibook-booking-shine/backend/wp-json/webcode/v1/health
curl -s http://localhost/thesibook-booking-shine/backend/wp-json/webcode/v1/pages/home | head -c 400
cd frontend && npm run lint && npm run typecheck && npm run build
```

## URLs

| Service | URL |
|---------|-----|
| WordPress | http://localhost/thesibook-booking-shine/backend |
| API | http://localhost/thesibook-booking-shine/backend/wp-json/webcode/v1 |
| WP Admin | http://localhost/thesibook-booking-shine/backend/wp-admin |
| Next.js | http://localhost:3000 |

## Re-seed CMS

```bash
cd backend
wp webcode seed --url=http://localhost/thesibook-booking-shine/backend
```

Or run `./scripts/wp-setup-local.sh` (seeds when `LOCAL_WP_SEED=true`).

## Note on contact form locally

`POST /api/contact` forwards to WordPress. Local `wp_mail` may fail without SMTP — expected in dev. Test deliverability on staging/production.
