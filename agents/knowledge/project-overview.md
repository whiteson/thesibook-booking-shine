# Project Overview (v2)

## Goal

Migrate Lovable/Vite/React (`src/`) into a production monorepo:

- **backend/** — WordPress CMS with ACF Page Builder
- **frontend/** — Next.js 15 App Router public site
- **scripts/deploy/** — automated deploy to Hetzner (or adapt for other hosts)

## Source (Lovable)

Typical `src/` contents:

- Vite + React Router pages
- Tailwind + shadcn/ui
- GSAP, Swiper, hardcoded copy
- Optional Supabase/Firebase (replace with WP or keep as secondary)

## Target

- Typed section components (no hardcoded content)
- WordPress REST API at `/wp-json/webcode/v1`
- Section renderer driven by `sections[]` from CMS
- Site settings (nav, logos) from `/settings`
- ISR by default (`NEXT_RENDER_MODE=isr`)

## Principle

Do not port files blindly. Extract patterns, rebuild architecture, keep visual intent.

## Reference implementation

**webcode-elevate** repository — use as pattern library when stuck.
