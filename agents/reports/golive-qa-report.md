# ThesiBook go-live QA

**Date:** 2026-11-12  
**Verdict:** Production is up. https://www.thesibook.gr serves the Greek site. Register, login, password reset, PayPal catalog, weekly classes, and separate events are deployed. The live studio `webcode` is on the free plan with class mode on.

## The three apps

| App | Check | Result |
|-----|--------|--------|
| Frontend Next.js `http://localhost:3010` | `/`, `/login`, `/register`, `/forgot-password`, `/privacy`, `/terms`, `/dashboard` | 200 |
| Booking `http://localhost/thesibook-booking-shine/book` | Public class page for `qa-free-studio` | 200, Greek UI, week calendar + events list |
| WordPress `http://localhost/thesibook-booking-shine/backend/wp-json/webcode/v1/health` | health JSON | 200, `acf: true` |
| Control plane `thesibook_control` | `cp_users`, `cp_workspaces`, `cp_billing_orders`, `cp_subscriptions`, `cp_password_resets` | present |
| `npm run lint` and `npm run typecheck` | frontend | PASS |

## Users and login

| Step | Result |
|------|--------|
| Wrong password | 401 |
| QA owner `thesibook.qa.20260813@gmail.com` | 200, dashboard workspace `qa-free-studio`, plan free, status active, attendants 3 / 5 |
| Duplicate register | 409 |
| Forgot password | generic success, Greek mail in MailHog, single-use token, login after reset, original password restored |
| Signed-out admin pages `weekly_lessons` and `studio_events` | 307 to login |
| Customer login page | 200 |

Browser: login form shows email, password, «Ξέχασα τον κωδικό», and register. Booking page shows the weekly schedule and the separate event card with «Κράτηση θέσης». The event modal title is «Εκδήλωση».

## Payments

PayPal live catalog is configured in local env (client id, plan id, webhook id are set; values not copied here). Dashboard API returns `billingOrders` (empty for this free studio) plus the plan picker data. No card was charged. Viva stays off (empty client id).

Free registration does not require a payment. The small plan is the yearly PayPal subscription already in the codebase.

## Weekly classes and separate events

On `qa-free-studio` (class mode already on, UI language set to Greek for this local studio):

- Weekly: **Hatha Yoga**, Wednesday 19:00, capacity 12, Jane Doe. Maria Papadopoulos booked 18 Nov 2026 19:00. Confirmation hash `CnocPTJvLFRp`.
- Event: **Εργαστήριο αναπνοής**, 21 Nov 2026 11:00–12:00, capacity 15, not repeated weekly. Nikos Testopoulos booked it. Hash `bRVZ9qINxif1`.
- Thursday 18:00 still shows the older «Service» lesson, separate from the yoga service.

New businesses get `class_oriented_booking=1` from `provision-tenant.sh` on first install. Studios that already exist keep their current mode until someone turns on class-oriented booking under Booking Settings.

## Attendant cap

Documented in `agents/reports/education-attendant-cap.md`. A 4th new person was blocked while the limit was pinned to the current count, an existing customer could still book, and a paid plan allowed a new person. The studio was put back on free / 5.

## Production (2026-11-12)

Deploy `DEPLOY_YES=1 ./scripts/deploy/deploy-hetzner.sh` finished with exit 0. WordPress was already installed and was not reinstalled. Control-plane SQL `001`–`009` applied. Tenant DB pool: 9 available, 1 assigned.

| Check | Result |
|-------|--------|
| https://www.thesibook.gr/ | 200, Greek homepage |
| `/login`, `/register`, `/forgot-password`, `/privacy`, `/terms` | 200 |
| Signed-out `/dashboard` | redirects to `/login` |
| Wrong password in the browser | «Λάθος email ή κωδικός» |
| Empty register | stays on the form; API without fields returns 400 |
| Unknown forgot-password email | 200 generic success, no account created |
| WordPress health | `ok: true`, `acf: true` |
| PayPal public config | `configured: true`, `mode: live`. No charge |
| Booking `webcode` | 200, Weekly Schedule + Events |
| `get_classes` week of 9 Nov 2026 | Yoga Flow, Breath Work, Pilates with capacity |
| Thursday 12 Nov on the calendar | Breath Work 18:00–19:00, Andriani, 0/12. Book Class modal opens |
| `get_events` | empty list. Page says “No upcoming events.” |
| `weekly_lessons` and `studio_events` signed out | 307 to booking login |
| `webcode` migration | version 72, `ea_studio_events` exists, capacity column exists |
| `webcode` plan | free, active, attendant limit 5, one platform user |
| Class mode | already `class_oriented_booking=1` |

`webcode` catalog: Breath Work, Yoga Flow (attendants 12), Pilates (attendants 10). Seven weekly lessons, Monday–Saturday. No one-off event is published yet. An admin adds those under Studio events after signing in to the booking backend. The booking UI language for this studio is English.

`demo-salon-athens` is a leftover tenant folder on the server. Its MySQL user is rejected (1045), so `console migrate` stops there. The default tenant is `webcode`, and that migration succeeded. Do not run `console install` or `migrate fresh`.

The homepage is still the early-access landing from WordPress (waitlist, “Πότε θα είναι διαθέσιμη η πλατφόρμα”). Register and booking are live at `/register` and `https://thesibook.gr/book/?thesibook_tenant=webcode`. Footer legal links go to `/privacy` and `/terms`.

Next.js is a `nohup` process on `127.0.0.1:3005` behind Apache. The systemd unit `thesibook-frontend` is not installed, so a server reboot needs the process started again (`scripts/deploy/start-frontend.sh`).

wp-cli printed the SMTP password into the local deploy log. Treat that terminal output as sensitive. Production mail host is `mail.your-server.de` port 587. No live message was sent in this pass.

## Mobile (2026-11-12, after the second deploy)

Checked at 390×844 and 360×800.

| Screen | Result |
|--------|--------|
| Homepage | No horizontal scroll. Menu button opens Αρχική, Για επιχειρήσεις, Πώς λειτουργεί, Λειτουργίες, Επικοινωνία |
| Login and register | Form fits. Plan cards stack. Inputs stay inside the screen |
| Booking | Day view, one day at a time. Breath Work card fits. Book Class modal fits the width, inputs are 16px, Confirm is reachable by scrolling the modal |
| Events list | “No upcoming events.” stays inside the screen |

A second `deploy-hetzner.sh` finished with exit 0. Next.js restarted on port 3005. Login, booking, and the WordPress health URL returned 200. Mail still uses the existing `info@thesibook.gr` mailbox.
