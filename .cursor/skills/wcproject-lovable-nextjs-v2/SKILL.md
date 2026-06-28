---
name: wcproject-lovable-nextjs-v2
description: >-
  End-to-end automation for migrating a Lovable/Vite/React GitHub project into a
  headless WordPress + Next.js monorepo with ACF sections, menus, deploy scripts,
  and QA. Use when starting a new Lovable migration, setting up webcode-headless-api,
  WordPress backend, Next.js frontend, Hetzner deploy, site navigation from CMS,
  or running the full wcproject migration pipeline with subagents.
---

# WCProject Lovable → Headless WordPress + Next.js (v2)

## Purpose

Automate the full migration proven on **webcode-elevate**:

```txt
GitHub Lovable repo
  → analyze src/
  → scaffold backend/ + frontend/ + scripts/deploy/
  → WordPress headless API + ACF layouts + seeder
  → Next.js sections + normalize-section + section-renderer
  → menus/settings from /settings API
  → deploy-hetzner.sh + env config
  → lint / typecheck / build
```

v1 only covered Lovable → Next.js components. **v2 covers the entire stack.**

## Target monorepo layout

```txt
src/                    # Original Lovable (reference only, not production)
backend/                # WordPress + plugins + theme + acf-json
frontend/               # Next.js App Router (production site)
scripts/deploy/         # deploy-hetzner.sh, config, WP bootstrap
.cursor/skills/         # This skill
agents/
  knowledge/
  prompts/
  reports/
```

## Core rules

1. TypeScript everywhere in `frontend/`.
2. Server components by default; client only for hooks, GSAP, Swiper, forms, nav state.
3. No hardcoded business content in `frontend/src/components/sections/`.
4. CMS fetches in `frontend/src/lib/wordpress/` and `frontend/src/lib/cms.ts` only.
5. Every new section needs **three artifacts**: ACF layout JSON, `normalize-section` case, React section component.
6. Register assumptions in `agents/reports/`.
7. Never commit secrets (`.env`, DB passwords, SSH keys).

## Pipeline (run in order)

| Phase | Name | Prompt | Gate |
|------:|------|--------|------|
| 0 | Project bootstrap | `agents/prompts/project-bootstrap-agent.md` | Skill installed, repo cloned |
| 1 | Codebase analysis | `agents/prompts/codebase-analyzer.md` | `agents/reports/codebase-map.md` exists |
| 2 | Monorepo scaffold | `agents/prompts/monorepo-scaffold-agent.md` | `backend/`, `frontend/`, deploy + **local WP scripts** |
| 3 | WordPress **code** | `agents/prompts/wordpress-backend-agent.md` | Plugin + ACF in repo (not installed yet) |
| **3b** | WordPress **local install** | `agents/prompts/local-dev-agent.md` | `wp-config.php` + API health OK |
| 4 | Next.js scaffold | `agents/prompts/nextjs-scaffold-agent.md` | `frontend/` builds; `.env.local` → local API |
| 5 | Component extraction | `agents/prompts/component-extractor.md` | Sections in `frontend/src/components/sections/` |
| 6 | ACF ↔ TypeScript bridge | `agents/prompts/acf-section-agent.md` | `normalize-section.ts` + `types/cms.ts` aligned |
| 7 | Page migration | `agents/prompts/page-migrator.md` | All Lovable routes have App Router pages |
| 8 | Menus & settings | `agents/prompts/menu-settings-agent.md` | `SiteNav` reads `main_nav` from API |
| 9 | Forms & API routes | `agents/prompts/forms-api-agent.md` | Contact (or forms) wired end-to-end |
| 10 | WordPress **server install** + deploy | `agents/prompts/deploy-agent.md` | `deploy-hetzner.sh` + remote `wp core install` |
| 11 | QA & go-live | `agents/prompts/qa-test-agent.md` | `agents/reports/qa-report.md`, build passes |

**Orchestrator:** `agents/prompts/orchestrator.md`  
**Runner manifest:** `node scripts/agent-runner.mjs`

## Subagent delegation

When using Cursor Task tool, map phases to subagent types:

- **explore** — Phase 1 (read-only codebase map)
- **shell** — Phases 0, 10 (git, deploy scripts, rsync)
- **generalPurpose** — Phases 2–9, 11 (implementation)

Each subagent must read its prompt file + relevant `agents/knowledge/*.md` before acting.

## WordPress headless pattern

### Plugin responsibilities (`webcode-headless-api`)

- `GET /wp-json/webcode/v1/health`
- `GET /wp-json/webcode/v1/pages/{slug}` — ACF flexible content normalized to `sections[]`
- `GET /wp-json/webcode/v1/settings` — logos, `main_nav`, footer, social, copyright
- `POST /wp-json/webcode/v1/contact` — form handler (optional)
- WP-CLI: `wp webcode seed` — demo content

### ACF flexible content

Each layout `type` must match:

1. `backend/.../acf-json/group_*.json` layout name
2. `class-acf-normalizer.php` output shape
3. `frontend/src/lib/wordpress/normalize-section.ts` case
4. `frontend/src/types/cms.ts` union member
5. `frontend/src/components/sections/section-renderer.tsx` switch case

See `agents/knowledge/wordpress-backend.md`.

## Local development (your Mac)

**Not the same as production deploy.** Use:

```bash
cp scripts/local.env.example scripts/local.env
./scripts/install-wordpress.sh
./scripts/wp-setup-local.sh
cd frontend && npm run dev:ssr
```

Full playbook: `agents/knowledge/local-dev-setup.md`  
Subagent: `agents/prompts/local-dev-agent.md`

Agent asks for MySQL creds and local URL only if not in `scripts/local.env`. Defaults: `root` / `password` / `localhost`.

## Next.js adapter pattern

```txt
getPageBySlug(slug)     → wordpress/pages.ts → normalize-section
getSiteSettings()       → wordpress/settings.ts
getRenderConfig()       → lib/render-mode.ts (isr | ssr | static)
merge mock + CMS        → lib/cms.ts (sparse CMS fallback)
```

See `agents/knowledge/render-modes.md`, `agents/knowledge/menus-and-settings.md`.

## Section component contract

```tsx
// Good: props only, no fetch
type HeroSliderProps = HeroSliderSection;
export function HeroSliderSection(props: HeroSliderProps) { ... }
```

```tsx
// Bad: hardcoded + fetch in component
export function Hero() {
  const data = await fetch('...');
  return <h1>Welcome</h1>;
}
```

## Deploy pattern

Copy `scripts/deploy/` from webcode-elevate reference:

- `deploy-hetzner.sh` — rsync backend, WP-CLI bootstrap, local Next build, rsync standalone
- `config.example.env` → `.env` (gitignored)
- `DEPLOY_SKIP_FRONTEND`, `DEPLOY_SKIP_BACKEND` partial flags
- `GO-LIVE.md` for Node vs PHP hosting splits

See `agents/knowledge/deploy-playbook.md`.

## Per-section migration (repeatable unit)

For each Lovable section:

1. Find it in `agents/reports/codebase-map.md`.
2. Confirm or create ACF layout in WordPress.
3. Add normalizer + TypeScript type + section component.
4. Register in `section-renderer.tsx`.
5. Seed content via `wp webcode seed` or document editor steps.
6. Visual check: `cd frontend && npm run dev`.

## Validation

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

## Reference repo

Use **webcode-elevate** as the canonical implementation when patterns are unclear. Copy structure, not secrets or production URLs.

## Output requirements

Every phase must produce:

1. Summary of changes
2. Files created/modified
3. Assumptions
4. Commands to run
5. Remaining risks

Do not mark the project production-ready until Phase 11 gates pass.
