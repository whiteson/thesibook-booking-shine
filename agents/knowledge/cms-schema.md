# CMS Schema (v2)

WordPress ACF flexible content layouts map to TypeScript section types.

## Shared field types

```ts
type LinkField = { label: string; href: string; target?: '_self' | '_blank' };
type ImageField = { src: string; alt: string; width?: number; height?: number };
```

## Section union (extend per project)

Start from codebase-map section list. Common layouts from webcode-elevate:

| ACF layout `name` | TS `type` | Component |
|-------------------|-----------|-----------|
| `hero_slider` | `hero_slider` | `hero-slider-section.tsx` |
| `metrics` | `metrics` | `metrics-section.tsx` |
| `carousel` | `carousel` | `carousel-section.tsx` |
| `zigzag` | `zigzag` | `zigzag-section.tsx` |
| `services_grid` | `services_grid` | `services-grid-section.tsx` |
| `contact_form` | `contact_form` | `contact-page-section.tsx` |

### ThesiBook layouts (this project)

| ACF layout `name` | TS `type` | Component |
|-------------------|-----------|-----------|
| `page_hero` | `page_hero` | `page-hero-section.tsx` |
| `hero` | `hero` | `hero-section.tsx` |
| `icon_grid` | `icon_grid` | `icon-grid-section.tsx` |
| `solution` | `solution` | `solution-section.tsx` |
| `for_businesses` | `for_businesses` | `for-businesses-section.tsx` |
| `steps` | `steps` | `steps-section.tsx` |
| `app_preview` | `app_preview` | `app-preview-section.tsx` |
| `early_access` | `early_access` | `early-access-section.tsx` |
| `faq` | `faq` | `faq-section.tsx` |
| `contact_cards` | `contact_cards` | `contact-cards-section.tsx` |

Add rows to this table for each new Lovable section.

## Page response

```ts
type PageViewModel = {
  slug: string;
  title: string;
  seo?: { title?: string; description?: string };
  sections: PageSection[];
};
```

## Settings response

See `menus-and-settings.md` for `SiteSettings`.

## Agent rules

- Do not invent ACF subfields — read `acf-json/` or propose new fields in this doc first.
- Every new layout: update PHP normalizer + `normalize-section.ts` + `types/cms.ts` + renderer.
- Seed example values in `class-content-seeder.php`.
