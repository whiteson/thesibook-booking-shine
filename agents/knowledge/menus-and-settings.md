# Menus & Site Settings (v2)

Global chrome (header nav, logos, footer) comes from WordPress, not hardcoded React.

## API

`GET /wp-json/webcode/v1/settings`

Response shape (normalized):

```ts
type SiteSettings = {
  siteName: string;
  headerLogo?: ImageField;
  footerLogo?: ImageField;
  mainNav: NavLink[];
  footerNav?: NavLink[];
  socialLinks?: SocialLink[];
  copyrightHtml?: string;
};
```

`main_nav` in ACF Options → `mainNav` in frontend via `frontend/src/lib/wordpress/settings.ts`.

## ACF Options

`backend/wp-content/themes/webcode/acf-json/group_options.json`:

- Site name
- Header / footer logos
- Main navigation repeater (`label`, `href`, `target`)
- Footer links, social, copyright HTML

## Frontend components

| File | Role |
|------|------|
| `frontend/src/lib/wordpress/settings.ts` | Fetch + normalize settings |
| `frontend/src/types/settings.ts` | `NavLink`, `SiteSettings` types |
| `frontend/src/components/layout/site-nav.tsx` | Client nav; receives `settings` prop |
| `frontend/src/components/layout/site-footer.tsx` | Footer from settings |
| `frontend/src/app/layout.tsx` | Fetches settings server-side, passes to layout |

## SiteNav rules

- `"use client"` — pathname active state, mobile menu, escape key.
- Props: `{ settings: SiteSettings }` only.
- Links from `settings.mainNav`; fallback defaults in adapter if API empty.
- Logo from `settings.headerLogo ?? settings.footerLogo`.

## Lovable migration note

Original `src/components/SiteNav.tsx` often hardcodes links. During migration:

1. Extract link labels/hrefs from Lovable into seeder `main_nav` defaults.
2. Replace hardcoded nav with `SiteNav settings={settings}`.
3. Editors manage nav in WP Admin → Options (no redeploy for link changes when using ISR/SSR).

## Validation

- API returns non-empty `main_nav` after seed.
- All internal hrefs match App Router paths (`/services`, `/contact`, etc.).
- External links use `target: "_blank"` + `rel="noopener noreferrer"`.
