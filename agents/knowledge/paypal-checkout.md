# PayPal Checkout — ThesiBook billing

Plan upgrades use **PayPal Checkout** (PayPal account or card).

**Production site:** https://thesibook.gr

## Business account

Payments go to: **johnbeazoglou@gmail.com** · app **thesibookgr**

## Environment

### Local (`frontend/.env.local`)

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3010
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_BUSINESS_EMAIL=johnbeazoglou@gmail.com
```

### Production (`https://thesibook.gr`)

Set on the server (see `scripts/deploy/config.example.env`):

```env
NEXT_PUBLIC_SITE_URL=https://thesibook.gr
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_BUSINESS_EMAIL=johnbeazoglou@gmail.com
PAYPAL_WEBHOOK_ID=...
```

PayPal return URLs (set automatically from `NEXT_PUBLIC_SITE_URL`):

- Success: `https://thesibook.gr/dashboard?billing=success`
- Cancel: `https://thesibook.gr/dashboard?billing=cancelled`

## PayPal Developer setup

1. [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/) — johnbeazoglou@gmail.com
2. App **thesibookgr** → Live Client ID + Secret
3. **Webhooks** → Add:
   - URL: `https://thesibook.gr/api/billing/paypal/webhook`
   - Event: `PAYMENT.CAPTURE.COMPLETED`
4. Copy Webhook ID → `PAYPAL_WEBHOOK_ID`

Test OAuth locally: `./scripts/test-paypal.sh`

## Flow

```txt
https://thesibook.gr/dashboard → plan card → PayPal
  → POST /api/billing/paypal/create-order
  → PayPal popup
  → POST /api/billing/paypal/capture-order
  → workspace plan + 30 days
  → webhook backup if browser closes early
```

## Plans

| Plan | Price | Access |
|------|-------|--------|
| free | €0 | 5 attendants |
| small | €7/mo | 10 attendants, 30 days |
| unlimited | €15/mo | unlimited, 30 days |

## Code

- `frontend/src/lib/booking/paypal.ts`
- `frontend/src/app/api/billing/paypal/*`
- `frontend/src/components/billing/billing-plan-picker.tsx`

Run DB migrations: `./scripts/setup-control-plane.sh`
