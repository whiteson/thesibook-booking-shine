# E3 — SMTP

**Date:** 2026-11-12  
**Gate:** E3 SKIP

Hetzner SMTP was not sent in this pass. Local platform mail is proven: password reset to the QA owner was delivered to MailHog on `127.0.0.1:1025` and the link reset the password.

Production mail is whatever `SMTP_HOST` / `WEBCODE_SMTP_*` is in `scripts/deploy/.env`. The deploy script now copies those into the Next.js production env when a host is set. No SMTP password is recorded here.

SKIP_HETZNER for a live send. Deploy on 2026-11-12 wrote the Hetzner mail host into WordPress and the Next.js production env. No message was sent, so this gate stays a skip.
