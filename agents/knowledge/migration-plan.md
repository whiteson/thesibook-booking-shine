# Migration Plan (v2)

## Phase 0: Bootstrap

- Clone Lovable GitHub repo.
- Install `wcproject-cursor-skill-v2` via `install-into-project.sh`.
- Confirm `src/` exists (Vite/Lovable source).

## Phase 1: Inventory

- Map routes, sections, GSAP/Swiper usage, forms, assets.
- Write `agents/reports/codebase-map.md`.

## Phase 2: Monorepo scaffold

- Create `backend/`, `frontend/`, `scripts/deploy/`.
- Keep `src/` untouched as reference.

## Phase 3: WordPress backend code

- Headless API plugin, theme, ACF JSON, seeder PHP in repo.
- **Does not install WordPress** on any machine.

## Phase 3b: WordPress local install (Mac) — required for local dev

- `scripts/local.env` from example
- `./scripts/install-wordpress.sh` + `./scripts/wp-setup-local.sh`
- Verify `curl .../wp-json/webcode/v1/health`
- See `agents/knowledge/local-dev-setup.md`
- Skip only if `SKIP_LOCAL_WP=true` (mock-only workflow)

## Phase 10: WordPress server install + deploy

- `deploy-hetzner.sh` → remote `wp core install` + seed (production)

## Phase 4: Next.js scaffold

- `create-next-app` in `frontend/`, Tailwind, path aliases.
- `render-mode.ts`, mock data, root layout shell.

## Phase 5: Component extraction

- Port Lovable sections to `frontend/src/components/sections/`.
- Client components only where needed.

## Phase 6: ACF bridge

- `normalize-section.ts`, `types/cms.ts`, `section-renderer.tsx`.

## Phase 7: Page migration

- App Router routes for every Lovable page.
- `cms.ts` merge strategy (mock fallback for sparse CMS).

## Phase 8: Menus & settings

- Options ACF, settings adapter, SiteNav, footer.

## Phase 9: Forms

- Contact API route + WP handler (or other forms from codebase map).

## Phase 10: Deploy

- `deploy-hetzner.sh`, config template, GO-LIVE notes.

## Phase 11: Validation

- lint, typecheck, build, `qa-report.md`.
