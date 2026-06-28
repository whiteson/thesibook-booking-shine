# Codebase Map — ThesiBook (Lovable `src/`)

Generated: 2026-06-06

## Routes

| Path | Source file | Sections / content |
|------|-------------|-------------------|
| `/` | `src/routes/index.tsx` | Hero, Problem, Solution, Features, ForBusinesses, HowItWorks, AppPreview, Benefits, EarlyAccess, FAQ |
| `/business` | `src/routes/business.tsx` | Page hero, ForBusinesses, Benefits, EarlyAccess |
| `/how-it-works` | `src/routes/how-it-works.tsx` | Page hero, HowItWorks, AppPreview, EarlyAccess |
| `/features` | `src/routes/features.tsx` | Page hero, Features, Solution, FAQ |
| `/contact` | `src/routes/contact.tsx` | Page hero, Contact cards, EarlyAccess |
| `/sitemap.xml` | `src/routes/sitemap[.]xml.ts` | Sitemap (only `/` listed in Lovable) |

Layout chrome: `SiteHeader`, `SiteFooter` on every page.

## Reusable sections (`src/components/site/`)

| Component | Visual pattern | Proposed ACF `type` |
|-----------|----------------|---------------------|
| `Hero` | Split hero + dashboard mockup, CTAs, trust badges | `hero` |
| `Problem` | 4-column icon cards | `icon_grid` |
| `Solution` | Two-column bullets + visual card | `solution` |
| `Features` | 8-column feature grid | `icon_grid` |
| `ForBusinesses` | Centered copy + business type pills + CTA | `for_businesses` |
| `HowItWorks` | 3-step cards | `steps` |
| `AppPreview` | 3 phone mockups | `app_preview` |
| `Benefits` | 6-card icon grid | `icon_grid` |
| `EarlyAccess` | Lead form (client state + toast) | `early_access` |
| `FAQ` | Accordion (Radix) | `faq` |
| Inner page H1 block | Inline in route files | `page_hero` |
| Contact cards | Inline in contact route | `contact_cards` |

## Hardcoded content inventory

- **Language:** Greek throughout (marketing copy, nav, forms).
- **Brand:** ThesiBook, email `hello@thesibook.gr`, location Athens Greece.
- **Nav links:** Αρχική `/`, Για επιχειρήσεις `/business`, Πώς λειτουργεί `/how-it-works`, Λειτουργίες `/features`, Επικοινωνία `/contact`.
- **CTA:** "Ζήτησε early access" → `/contact` or `#early-access`.
- **Logo:** `src/assets/thesibook-logo.svg.asset.json` (Lovable CDN path).
- **OG image:** R2 CDN URL in `__root.tsx`.
- **Schema.org:** Organization JSON-LD on home page.
- **Footer:** Hardcoded nav + placeholder Privacy/Terms `#` links.

## Forms

| Form | Location | Fields | Backend |
|------|----------|--------|---------|
| Early access | `EarlyAccess.tsx` | name, email, phone, company, business type, message | Client-only mock submit + Sonner toast (no API) |

## External APIs

- None for business data. TanStack Query configured but unused for CMS.
- Lovable error reporting (`lib/lovable-error-reporting.ts`) — dev only.
- Google Fonts: Plus Jakarta Sans.

## Styling

- **Tailwind CSS v4** with `@theme inline` tokens in `src/styles.css`.
- **shadcn/ui** components under `src/components/ui/` (Radix primitives).
- Custom utilities: `bg-gradient-brand`, `text-gradient-brand`, `shadow-soft`, `shadow-elegant`, `animate-float`, `animate-fade-in-up`.
- Brand colors: navy primary (`--primary`), soft blue (`--primary-soft`), coral accent (`--coral`).

## Client libraries

| Library | Used? | Needs `"use client"` |
|---------|-------|---------------------|
| GSAP | No | — |
| Swiper | No | — |
| Lenis | No | — |
| embla-carousel | Only in unused `ui/carousel` | Yes |
| react-hook-form + zod | Only in unused `ui/form` | Yes |
| Radix Accordion (FAQ) | Yes | Yes |
| Sonner toast | Yes (EarlyAccess) | Yes |
| SiteHeader mobile menu | Yes (`useState`) | Yes |

## Assets

- Logo SVG via Lovable asset pipeline (`/__l5e/assets-v1/...`).
- No `public/` images in Lovable app (only `robots.txt`).
- Lucide React icons referenced by name in components.

## Migration risks

1. **Logo asset** — Lovable CDN path; must copy SVG to `frontend/public/`.
2. **Greek copy volume** — seed via mock data + WP seeder; avoid hardcoding in section components.
3. **Early access form** — currently fake submit; wire to `POST /wp-json/webcode/v1/contact` in Phase 9.
4. **App preview phones** — complex static UI; keep as presentational component with minimal CMS fields.
5. **Icon mapping** — CMS stores icon name strings; frontend maps to Lucide components.
6. **Sitemap** — expand to all routes in Next.js `app/sitemap.ts`.

## Priority order

1. Home page (all sections) — highest traffic
2. Global nav/footer from settings API
3. Inner pages: business, how-it-works, features, contact
4. Early access form API
5. SEO metadata + sitemap
6. Deploy automation
