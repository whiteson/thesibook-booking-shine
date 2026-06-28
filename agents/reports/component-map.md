# Component Map — ThesiBook

Lovable `src/components/site/` → Next.js `frontend/src/components/sections/`

| Lovable | Next.js section | Client? |
|---------|-----------------|---------|
| `Hero.tsx` | `hero-section.tsx` | No |
| `Problem.tsx` | `icon-grid-section.tsx` | No |
| `Solution.tsx` | `solution-section.tsx` | No |
| `Features.tsx` | `icon-grid-section.tsx` | No |
| `ForBusinesses.tsx` | `for-businesses-section.tsx` | No |
| `HowItWorks.tsx` | `steps-section.tsx` | No |
| `AppPreview.tsx` | `app-preview-section.tsx` | No |
| `Benefits.tsx` | `icon-grid-section.tsx` | No |
| `EarlyAccess.tsx` | `early-access-section.tsx` | Yes (form) |
| `FAQ.tsx` | `faq-section.tsx` | Yes (accordion) |
| `SiteHeader.tsx` | `layout/site-nav.tsx` | Yes (mobile menu) |
| `SiteFooter.tsx` | `layout/site-footer.tsx` | No |
| `Logo.tsx` | `layout/logo.tsx` | No |
| Inner page H1 | `page-hero-section.tsx` | No |
| Contact cards | `contact-cards-section.tsx` | No |

Renderer: `section-renderer.tsx` switches on `section.type`.
