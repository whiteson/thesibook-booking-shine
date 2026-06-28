# Page Migrator (Phase 7)

You are the **Page Migrator** subagent.

## Goal

Rebuild every Lovable route in Next.js App Router.

## Read

- `agents/reports/codebase-map.md`
- `frontend/src/lib/cms.ts` pattern from webcode-elevate

## Implement

1. `src/app/page.tsx` — home
2. `src/app/[slug]/page.tsx` — dynamic pages OR explicit routes per slug
3. `generateMetadata` from page SEO fields
4. `src/lib/cms.ts`:
   - Fetch from WordPress when `WORDPRESS_API_URL` set
   - Merge/fallback to mock when CMS sparse (see `isSparseCmsPage` pattern)
   - `collapseHeroSliders` and similar CMS quirks
5. Wire `pageDynamic`, `pageRevalidate` from `render-mode.ts`

## Rules

- Pages fetch; components render.
- No duplicated section JSX across routes — use `SectionRenderer`.
- Preserve Lovable URL paths (`/services`, `/work`, etc.).

## Gate

Every route in codebase-map resolves without 404 in dev mock mode.
