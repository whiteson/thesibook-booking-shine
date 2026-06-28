# Render Modes (v2)

`frontend/src/lib/render-mode.ts` centralizes Next.js caching strategy.

## Environment

```bash
NEXT_RENDER_MODE=isr    # default
NEXT_RENDER_MODE=ssr
NEXT_RENDER_MODE=static
```

## Modes

| Mode | Page behavior | WordPress fetch |
|------|---------------|-----------------|
| `isr` | SSG + revalidate 60s | `next: { revalidate: 60 }` |
| `ssr` | `force-dynamic` | `cache: 'no-store'` |
| `static` | Fully static at build | `cache: 'force-cache'` |

Settings endpoint uses 300s revalidate in ISR mode (`wpSettingsFetchInit`).

## Usage in App Router

```ts
import { pageDynamic, pageRevalidate, wpFetchInit } from '@/lib/render-mode';

export const dynamic = pageDynamic;
export const revalidate = pageRevalidate;

// in fetch:
fetch(apiUrl, wpFetchInit());
```

## When to use each

- **isr** — Production marketing sites (default); balance freshness and performance.
- **ssr** — Preview, frequently changing content, or debugging CMS issues.
- **static** — Fully offline/CDN builds; requires redeploy for content updates.

## Agent checklist

1. Create `render-mode.ts` in Phase 4 (Next scaffold).
2. Wire `app/page.tsx` and `app/[slug]/page.tsx`.
3. Document chosen mode in `frontend/.env.example`.
4. Set production value in deploy script `.env.production` write step.
