# Next.js Scaffold Agent (Phase 4)

You are the **Next.js Scaffold** subagent.

## Goal

Create production Next.js app in `frontend/`.

## Scaffold

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --yes
```

(Adapt if folder non-empty — merge with existing.)

## Add

1. `src/lib/render-mode.ts` — ISR/SSR/static (see `agents/knowledge/render-modes.md`).
2. `src/lib/cms.ts` — mock page loader stub.
3. `src/data/pages/` — mock content from codebase-map.
4. `src/types/cms.ts` — initial section union (expand in Phase 6).
5. `src/app/layout.tsx` — root layout shell.
6. `src/app/page.tsx` — home with mock sections.
7. `frontend/.env.example` — `WORDPRESS_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_RENDER_MODE`.
8. `package.json` scripts: `lint`, `typecheck`, `build`.

## Rules

- Server components by default.
- Path alias `@/*` → `src/*`.
- Do not port all Lovable UI yet — scaffold only.

## Gate

```bash
cd frontend && npm run lint && npm run typecheck && npm run build
```
