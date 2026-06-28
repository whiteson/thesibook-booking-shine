# Forms Integration Notes

## Early Access form (`frontend`)

- Endpoint: `POST /api/contact`
- Route file: `frontend/src/app/api/contact/route.ts`
- Current behavior:
  - accepts JSON payload from `early-access-section.tsx`
  - logs the submission payload on the server
  - returns `{ "success": true, "message": "Contact request received." }`

## Next step

- Replace logging with real backend forwarding to
  `POST /wp-json/webcode/v1/contact` when backend contact handler is wired.
