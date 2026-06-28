# WordPress Backend Playbook (v2)

Headless WordPress CMS for Lovable → Next.js migrations.

## Plugin: webcode-headless-api

Location: `backend/wp-content/plugins/webcode-headless-api/`

### REST routes (namespace `webcode/v1`)

| Route | Method | Purpose |
|-------|--------|---------|
| `/health` | GET | API + DB sanity check |
| `/pages/{slug}` | GET | Page with normalized `sections[]` |
| `/settings` | GET | Site name, logos, `main_nav`, footer, social |
| `/contact` | POST | Contact form (optional) |

### Key PHP classes

- `class-rest-api.php` — route registration
- `class-acf-normalizer.php` — ACF flexible content → JSON sections
- `class-section-enricher.php` — image URLs, link resolution
- `class-content-seeder.php` — `wp webcode seed` demo pages
- `class-contact-handler.php` — form validation + mail

### Theme

`backend/wp-content/themes/webcode/` — minimal theme; ACF JSON in `acf-json/`.

## Adding a new section type

1. **ACF** — Add flexible layout in Page Builder field group JSON (`group_61899e55b0e00.json` or project equivalent). Layout `name` becomes API `type`.
2. **PHP normalizer** — Map ACF subfields to flat JSON in `class-acf-normalizer.php`.
3. **Seeder** — Add demo row in `class-content-seeder.php` for local/staging.
4. **Sync** — `wp acf sync` or import JSON on deploy.

## WP-CLI commands

```bash
wp plugin activate advanced-custom-fields-pro webcode-headless-api
wp theme activate webcode
wp rewrite structure '/%postname%/' --hard
wp webcode seed
```

## Local / MailHog (optional)

`backend/wp-content/mu-plugins/webcode-mailhog-smtp.php` routes mail to MailHog in dev.

## Content model

Pages use ACF **Page Builder** (flexible content). Each row = one `section` in API response:

```json
{
  "slug": "home",
  "title": "Home",
  "sections": [
    { "type": "hero_slider", "slides": [], "cta": { "label": "", "href": "" } }
  ]
}
```

## Assumptions to document

- ACF Pro required for flexible content.
- Upload paths: media library URLs must be absolute in API (enricher handles this).
- Slug `home` often maps to front page, not post_name `home` — verify in seeder + Next route.

## Reference

Copy plugin structure from **webcode-elevate** `backend/wp-content/plugins/webcode-headless-api/`.
