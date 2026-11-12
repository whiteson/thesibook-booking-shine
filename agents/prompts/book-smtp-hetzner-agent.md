# Hetzner SMTP Proof Agent (E3)

Prove outbound mail on Hetzner staging: booking confirmation, EA password reset, WordPress/contact.

## Read first

- `agents/knowledge/education-slice.md`
- `book/thesibook-email-config.php.example`
- `book/application/config/email.php`
- `scripts/deploy/config.example.env` (`WEBCODE_SMTP_*`)
- `scripts/deploy/book-deploy.sh`
- `scripts/deploy/setup-book-web.sh`
- `agents/reports/book-qa-report.md` (mail known limit)

## Tasks

1. Confirm `scripts/deploy/.env` has `WEBCODE_SMTP_HOST/PORT/USER/PASSWORD/FROM` (do not print the password in reports or chat).
2. On the server, `book/thesibook-email-config.php` must exist next to the live book web root and match those SMTP settings. Create from the example via existing deploy scripts — never commit the filled file.
3. Confirm WordPress uses the same mailbox (`WEBCODE_SMTP_*` written by `deploy-hetzner.sh`).
4. Send **one** real proof per channel unless `SKIP_SMTP_SEND=true`:
   - EA: booking confirmation or recovery mail to a mailbox the user named
   - WP/Next: `POST /api/contact` (or `wp_mail`) to `WEBCODE_CONTACT_MAIL_TO`
5. Record message-id / mailbox inbox result, or the exact SMTP error (no secrets).
6. If `SKIP_HETZNER=true`, check local MailHog / config only and mark E3 SKIP.

## Verify

- `https://book.thesibook.gr` recovery or a test booking triggers SMTP (not PHP `mail()` only).
- Contact form on `www.thesibook.gr` delivers.

## Output

`agents/reports/education-smtp-hetzner.md` — which config files exist on server (paths only), which of the three mails were proven, skip reasons.

Gate text must include `E3 PASS` or `E3 SKIP` plus the skip flag name.

## Do not

- Invent new SSH/wp loops
- Echo SMTP passwords
- Rsync local `thesibook-email-config.php` if it points at MailHog
- Send mail to random third parties — use the user-provided inbox or `info@thesibook.gr` if they agree
