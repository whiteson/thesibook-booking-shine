# ThesiBook — WordPress CMS (headless)

Headless WordPress backend for the ThesiBook Next.js frontend.

## Structure

```txt
wp-content/plugins/webcode-headless-api/   # REST API + seeder
wp-content/themes/webcode/                 # Minimal theme + ACF JSON
```

## Local setup

```bash
cp ../scripts/local.env.example ../scripts/local.env
../scripts/install-wordpress.sh
../scripts/wp-setup-local.sh
```

## API

Base: `{WP_URL}/wp-json/webcode/v1`

- `GET /health`
- `GET /home`
- `GET /pages/{slug}`
- `GET /settings`
- `POST /contact`

## Seed content

```bash
wp webcode seed
```

See `agents/reports/wordpress-setup.md` for section types and ACF mapping.
