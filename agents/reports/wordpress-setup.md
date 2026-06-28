# WordPress Setup — ThesiBook

## Plugin

`backend/wp-content/plugins/webcode-headless-api/`

| Route | Method | Purpose |
|-------|--------|---------|
| `/wp-json/webcode/v1/health` | GET | API health |
| `/wp-json/webcode/v1/home` | GET | Front page sections |
| `/wp-json/webcode/v1/pages/{slug}` | GET | Page by slug |
| `/wp-json/webcode/v1/settings` | GET | Nav, logos, footer |
| `/wp-json/webcode/v1/contact` | POST | Form handler |

## Theme + ACF

`backend/wp-content/themes/webcode/acf-json/` — Page Builder flexible content field groups.

### ThesiBook section types (frontend contract)

| ACF layout `name` | API `type` | Frontend component |
|-------------------|------------|------------------|
| `page_hero` | `page_hero` | `page-hero-section.tsx` |
| `hero` | `hero` | `hero-section.tsx` |
| `icon_grid` | `icon_grid` | `icon-grid-section.tsx` |
| `solution` | `solution` | `solution-section.tsx` |
| `for_businesses` | `for_businesses` | `for-businesses-section.tsx` |
| `steps` | `steps` | `steps-section.tsx` |
| `app_preview` | `app_preview` | `app-preview-section.tsx` |
| `early_access` | `early_access` | `early-access-section.tsx` |
| `faq` | `faq` | `faq-section.tsx` |
| `contact_cards` | `contact_cards` | `contact-cards-section.tsx` |

> **Note:** Seeder contains ThesiBook Greek content from `frontend/src/data/pages/`. Re-seed after content changes: `wp webcode seed --url=<WP_ROOT_URL>`.

## WP-CLI

```bash
wp plugin activate advanced-custom-fields-pro webcode-headless-api
wp theme activate webcode
wp rewrite structure '/%postname%/' --hard
wp webcode seed
```

## Local install (Phase 3b)

```bash
cp scripts/local.env.example scripts/local.env
./scripts/install-wordpress.sh
./scripts/wp-setup-local.sh
```

Set `frontend/.env.local`:

```env
WORDPRESS_API_URL=http://localhost/thesibook-booking-shine/backend/wp-json/webcode/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_RENDER_MODE=isr
```

## Assumptions

- ACF Pro required for flexible content.
- Slug `home` maps to front page via seeder `page_on_front`.
- Frontend uses mock fallback when API unreachable (build-time safe).
