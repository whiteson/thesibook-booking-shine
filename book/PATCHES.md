# ThesiBook patches to Easy!Appointments (book/)

Track modifications to upstream EA. Do not push to alextselegidis/easyappointments.

| File | Change |
|------|--------|
| `index.php` | Load `thesibook-bootstrap.php` instead of flat `config.php` |
| `thesibook-bootstrap.php` | Multi-tenant: session + `?thesibook_tenant=` → `tenants/{slug}/meta.json` |
| `tenants/` | Per-workspace meta (gitignored secrets) |
| `assets/css/themes/default.scss` | Primary color `#2563eb` (ThesiBook blue) |
| `application/views/**` | Remove EA logos, links, and "Powered by" branding; titles use ThesiBook |
| `application/language/english/translations_lang.php` | User-visible strings use ThesiBook instead of Easy!Appointments |

Future: env-based Config for production nginx `fastcgi_param`.
