=== Webcode Headless API ===

REST API for the Next.js frontend.

== Activate ==

1. WordPress Admin → Plugins → activate "Webcode Headless API"
2. Settings → Permalinks → save (Post name) if REST returns 404
3. Create pages with template "Page Builder" and add flexible "Components"
4. After pulling ACF JSON changes: WP Admin → ACF → Field Groups → Sync "Element Hero Slider" if prompted

Hero Slider fields (clone prefix → page builder keys):
  - hero_slider_slider_search_description — hero paragraph (Next.js)
  - hero_slider_slider_search_title — meta line under hero
  - Slider repeater: image, title (phrases), subtitle (eyebrow), button

== Endpoints ==

Base: /wp-json/webcode/v1/

- GET /health
- GET /home          — static front page (Settings → Reading)
- GET /pages/{slug}  — e.g. about, contact (use slug "home" for front page)
- GET /settings      — ACF Options (logos, footer, etc.)
- POST /contact      — submit inquiry via Contact Form 7 (JSON: form_id?, name, email, company?, message)

Page `seo` payload includes Yoast SEO when the Yoast plugin is active:
  - title, description
  - yoast — yoast_head_json (title, robots, canonical, og_*, twitter_*, schema)
  - yoast_head — raw HTML head output from Yoast (optional fallback)

Set WEBCODE_FRONTEND_URL in wp-config.php so canonical/og:url point at the Next.js site.

Example:
http://localhost/thesibook-booking-shine/backend/wp-json/webcode/v1/health

== CORS (Next.js dev) ==

Allowed by default: http://localhost:3000, http://127.0.0.1:3000

Optional in wp-config.php:
define('WEBCODE_HEADLESS_CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001');

== WebP images ==

Default (no wp-config flags):

- MU plugin `mu-plugins/webcode-webp-urls.php` — `.webp` URLs when the file exists.
- Run once (or after bulk uploads): `wp webcode webp`
- New JPEG/PNG uploads get a .webp companion automatically.
