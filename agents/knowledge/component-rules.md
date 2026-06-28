# Component Rules (v2)

Every `frontend/src/components/sections/*` component must be:

1. Reusable and typed (`export type XxxSection` in `types/cms.ts`).
2. Content-agnostic — all copy, images, links via props.
3. Free of `fetch()` and WordPress imports.
4. Server by default; `"use client"` only for GSAP, Swiper, forms, nav state.
5. Responsive and accessible (semantic HTML, alt text, keyboard nav).
6. Registered in `section-renderer.tsx`.

## Pattern

```txt
Page (server) → getPageBySlug() → SectionRenderer → Section components
Layout (server) → getSiteSettings() → SiteNav / Footer (client where needed)
```

## Section checklist

- [ ] Props type exported or imported from `@/types/cms`
- [ ] Optional fields guarded (`{cta && ...}`)
- [ ] No project-specific strings
- [ ] Matches Lovable visual intent from `src/`
- [ ] ACF `type` matches `normalize-section` case

## Layout components

`site-nav.tsx`, `site-footer.tsx`, `logo.tsx` receive `SiteSettings` — never hardcode nav items.
