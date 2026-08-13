# ThesiBook patches to Easy!Appointments (book/)

Track modifications to upstream EA. Do not push to alextselegidis/easyappointments.

| File | Change |
|------|--------|
| `index.php` | Load `thesibook-bootstrap.php` instead of flat `config.php` |
| `thesibook-bootstrap.php` | Multi-tenant: session + `?thesibook_tenant=` → `tenants/{slug}/meta.json`; loads `thesibook-sso-secret.php` **before** tenant early-return (SSO) |
| `tenants/` | Per-workspace meta (gitignored secrets) |
| `assets/css/themes/default.scss` | Primary color `#2563eb` (ThesiBook blue) |
| `application/views/**` | Remove EA logos, links, and "Powered by" branding; titles use thesibook.gr |
| `application/language/english/translations_lang.php` | User-visible strings use thesibook.gr |
| `application/language/greek/translations_lang.php` | Easy!Appointments → thesibook.gr in user strings |
| `application/controllers/Backend.php` | Redirect `/backend` → `/login` (EA v1.5+ admin is `/calendar`) |
| `application/migrations/070_add_class_oriented_booking_setting.php` | Setting `class_oriented_booking` toggle |
| `application/libraries/Class_schedule.php` | Weekly class list for class-oriented booking (lesson, teacher, time, capacity) |
| `application/controllers/Booking.php` | Class mode view + `get_classes` weekly API |
| `application/views/pages/class_booking.php` | Public weekly FullCalendar schedule (click to book) |
| `assets/js/pages/class_booking.js` | Week calendar + booking modal |
| `application/migrations/071_create_weekly_lessons_table.php` | Recurring weekly lesson slots per service + provider |
| `application/models/Weekly_lessons_model.php` | Weekly lesson CRUD |
| `application/controllers/Weekly_lessons.php` | Admin weekly lesson schedule |
| `application/controllers/Customer_register.php` | Public customer registration + login |
| `application/views/pages/customer_register.php` | Customer signup form |
| `application/views/pages/customer_login.php` | Customer login form |
| `assets/js/pages/weekly_lessons.js` | Admin weekly lessons UI |
| `assets/js/pages/customer_register.js` | Customer signup handler |
| `assets/js/pages/customer_login.js` | Customer login handler |
| `assets/css/class_booking.css` | Weekly calendar event styles |
| `application/views/layouts/booking_layout.php` | Wide layout when class booking is active |
| `application/views/pages/booking_settings.php` | Admin toggle for class-oriented mode |
| `application/views/pages/recovery.php` | Email-only forgot password (no separate username) |
| `application/views/pages/login.php` | Login field labeled Email (username = email) |
| `application/controllers/Recovery.php` | Accept email-only password reset requests |
| `application/config/email.php` | Send mail From info@thesibook.gr; optional `thesibook-email-config.php` SMTP |
| `thesibook-email-config.php.example` | Production SMTP template (copy to gitignored `thesibook-email-config.php`) |
| `thesibook-bootstrap.php` | Tenant query helpers; `thesibook_password_reset_link()` for email reset URLs |
| `application/libraries/Accounts.php` | Email-only password reset token lookup |
| `assets/js/utils/url.js` | Append `thesibook_tenant` to AJAX URLs on tenant pages |

## Ops safety (production tenants)

- **`php index.php console install`** runs `migrate('fresh')` — **destroys all services, appointments, and users**. Use only on empty databases.
- **`provision-tenant.sh`** skips EA install when `ea_blocked_periods` exists. It **never auto-drops** tables if booking data exists (services > 1, any appointments, or extra users).
- To force reinstall: `EA_PROVISION_FORCE_REINSTALL=1` (empty DB only) or `EA_PROVISION_ALLOW_DATA_WIPE=1` (explicit data loss).
- Pool DB cleanup: never `DROP TABLE ea_*` while `cp_db_pool` shows the database as **assigned** to a workspace.

Future: env-based Config for production nginx `fastcgi_param`.
