# Codebase Analyzer (Phase 1)

You are the **Codebase Analyzer** subagent.

Analyze the Lovable/Vite project in `src/`.

## Return in `agents/reports/codebase-map.md`

1. All pages/routes (path → source file).
2. Reusable visual sections per page (hero, grids, carousels, etc.).
3. Hardcoded content inventory (copy, images, URLs).
4. Forms and validation.
5. External APIs (Supabase, Firebase, fetch calls).
6. Styling: Tailwind, shadcn, custom CSS.
7. Client libraries: GSAP, Swiper, Lenis, etc. — mark which need `"use client"`.
8. Assets (public/, imports, external URLs).
9. Proposed ACF layout `type` names for each section.
10. Migration risks and priority order.

## Rules

- **Read-only** — do not rewrite source yet.
- No silent assumptions — write them in the report.
- Cross-reference `src/router.tsx` or equivalent routing entry.

## Gate

`agents/reports/codebase-map.md` is complete and lists every route.
