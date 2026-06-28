# Project Config — ThesiBook

| Field | Value |
|-------|-------|
| Project name | ThesiBook |
| Project slug | thesibook-booking-shine |
| GitHub URL | https://github.com/whiteson/thesibook-booking-shine |
| Target production domain | https://thesibook.gr |
| CMS email | hello@thesibook.gr |
| Locale | Greek (el) |
| Lovable stack | TanStack Start + Vite + React 19 |
| Production stack | Headless WordPress + Next.js 15 App Router |

## Assumptions

- `src/` remains reference-only; production site lives in `frontend/`.
- WordPress CMS path on server: `/thesibook-booking-shine/backend/` (per deploy scripts).
- Public site on `www.thesibook.gr` (Node) with apex PHP for CMS — see `scripts/deploy/GO-LIVE.md`.
- ACF Pro required for flexible content page builder.
