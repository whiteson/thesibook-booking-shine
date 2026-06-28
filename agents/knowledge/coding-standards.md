# Coding Standards (v2)

## TypeScript

- Strict mode in `frontend/tsconfig.json`.
- Discriminated unions for sections: `{ type: 'hero_slider'; ... }`.
- No `any` in adapters; use `unknown` + type guards when parsing API JSON.

## Imports

- `@/` alias → `frontend/src/`.
- Section components: `@/components/sections/`.
- WordPress layer: `@/lib/wordpress/`, not in components.

## PHP (backend plugin)

- WordPress coding standards where practical.
- Escape output in REST responses; validate input on POST routes.
- Keep normalizer pure — no HTML in JSON unless field is explicitly rich text.

## File naming

- React: `kebab-case.tsx` (`hero-slider-section.tsx`).
- PHP: `class-kebab-case.php`.
- ACF JSON: `group_*.json` synced from field groups.

## Git

- Never commit `scripts/deploy/.env`, `frontend/.env.local`, or `wp-config.php` secrets.
- Commit `acf-json/` and plugin source.

## Validation before merge

```bash
cd frontend && npm run lint && npm run typecheck && npm run build
```
