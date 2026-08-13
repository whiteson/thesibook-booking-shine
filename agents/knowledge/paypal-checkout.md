# Billing — PayPal yearly subscriptions (Viva later)

**Production:** https://www.thesibook.gr/dashboard

Payouts: **johnbeazoglous@gmail.com** (PayPal app **thesibookgr**).

**Active now:** PayPal only. Viva Checkout is in the codebase but turned off.

## Plans

| Plan | Price | Access | Renewal |
|------|-------|--------|---------|
| free | €0 | 5 attendants | — |
| small | **€84 / year** | unlimited attendants | auto |

Registration is always **free**. Paid plans auto-renew every year.

## PayPal

Yearly **Subscriptions** (not one-time 30-day checkout).

1. [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. App **thesibookgr** — enable **Subscriptions**
3. Webhooks → `https://www.thesibook.gr/api/billing/paypal/webhook`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.CAPTURE.COMPLETED`

ThesiBook creates PayPal billing plans (`YEAR`) automatically on first checkout.

## Viva.com Smart Checkout (disabled)

Not shown in the dashboard. Re-enable later by restoring the Viva button and `create-order` route.

1. Viva banking app → Settings → API Access: **Client ID** + **Client Secret**
2. Payment source for the website (4-digit `sourceCode`, often `0000`)
3. Enable **Allow recurring payments via API**
4. Payment source Success URL: `https://www.thesibook.gr/api/billing/viva/return`
5. Failure URL: `https://www.thesibook.gr/dashboard?billing=cancelled`
6. Webhook: `https://www.thesibook.gr/api/billing/viva/webhook`  
   Event: **Transaction Payment Created** (1796)

```env
VIVA_MODE=live
VIVA_CLIENT_ID=...
VIVA_CLIENT_SECRET=...
VIVA_SOURCE_CODE=0000
BILLING_CRON_SECRET=...
```

First payment stores the Viva transaction ID. A daily cron charges the same card each year:

```bash
# daily 06:00
0 6 * * * curl -fsS -X POST -H "Authorization: Bearer $BILLING_CRON_SECRET" \
  https://www.thesibook.gr/api/billing/cron/renew
```

## Code

- `frontend/src/lib/booking/paypal.ts` — Orders + Subscriptions
- `frontend/src/lib/booking/viva.ts` — Smart Checkout + recurring
- `frontend/src/app/api/billing/paypal/*`
- `frontend/src/app/api/billing/viva/*`
- `frontend/src/app/api/billing/cron/renew/route.ts`
- `services/booking/sql/007_yearly_subscriptions.sql`
