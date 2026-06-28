# Menu & Settings Agent (Phase 8)

You are the **Menu & Settings** subagent.

## Goal

Replace hardcoded Lovable navigation with CMS-driven settings.

## Read

- `agents/knowledge/menus-and-settings.md`
- Lovable `src/components/SiteNav.tsx` (or equivalent)

## Implement

### WordPress

1. ACF Options: `main_nav` repeater, logos, site name, footer, social, copyright.
2. Expose via `GET /settings` in headless plugin.

### Frontend

1. `src/types/settings.ts`
2. `src/lib/wordpress/settings.ts` — fetch, normalize, defaults
3. `src/components/layout/site-nav.tsx` — client, props `settings`
4. `src/components/layout/site-footer.tsx`
5. `src/components/layout/logo.tsx`
6. `src/app/layout.tsx` — `getSiteSettings()` server-side

## Seeder

Populate `main_nav` with links matching codebase-map routes.

## Rules

- No hardcoded nav links in layout components.
- Active link styling via `usePathname()`.
- Mobile menu: escape key, body scroll lock.

## Gate

- Settings API returns `main_nav` with all primary routes
- SiteNav renders from API/mock settings only
