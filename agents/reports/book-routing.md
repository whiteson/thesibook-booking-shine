# Book Tenant Routing — ThesiBook

Date: 2026-06-29  
Mode: session + query param (local); subdomain (production later)

## Local

1. `book/thesibook-bootstrap.php` reads `?thesibook_tenant=slug` or PHP session
2. Loads `book/tenants/{slug}/meta.json` for DB credentials
3. Dashboard links append `thesibook_tenant` to EA URLs

## Production (go-live)

- nginx wildcard `*.book.thesibook.gr`
- Set `EA_TENANT_SLUG` from subdomain in nginx fastcgi_param
- Or path-based `/t/{slug}/` rewrite

## Verified

Multi-tenant meta.json written on register; bootstrap loads tenant DB.
