#!/usr/bin/env bash
# Create (or reuse) the live PayPal yearly product + €84 Small plan.
# Idempotent via PayPal-Request-Id. Prints env vars to add locally / on deploy.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/frontend/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing frontend/.env.local"
  exit 1
fi

# shellcheck disable=SC1090
source <(grep -E '^PAYPAL_' "$ENV_FILE" | sed 's/^/export /')

if [[ -z "${PAYPAL_CLIENT_ID:-}" || -z "${PAYPAL_CLIENT_SECRET:-}" ]]; then
  echo "Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in frontend/.env.local"
  exit 1
fi

MODE="${PAYPAL_MODE:-sandbox}"
if [[ "$MODE" == "live" ]]; then
  BASE="https://api-m.paypal.com"
else
  BASE="https://api-m.sandbox.paypal.com"
fi

ACCESS=$(curl -sS -u "${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  "${BASE}/v1/oauth2/token" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

PROD_JSON=$(curl -sS -X POST "${BASE}/v1/catalogs/products" \
  -H "Authorization: Bearer ${ACCESS}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -H "PayPal-Request-Id: thesibook-product-yearly-v1" \
  -d '{"name":"ThesiBook","type":"SERVICE","description":"ThesiBook yearly booking workspace","category":"SOFTWARE"}')

PRODUCT_ID=$(echo "$PROD_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

PLAN_JSON=$(curl -sS -X POST "${BASE}/v1/billing/plans" \
  -H "Authorization: Bearer ${ACCESS}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -H "PayPal-Request-Id: thesibook-plan-small-yearly-v1" \
  -d "{
    \"product_id\": \"${PRODUCT_ID}\",
    \"name\": \"ThesiBook Small yearly\",
    \"description\": \"Unlimited booking attendants, billed every year\",
    \"status\": \"ACTIVE\",
    \"billing_cycles\": [{
      \"frequency\": { \"interval_unit\": \"YEAR\", \"interval_count\": 1 },
      \"tenure_type\": \"REGULAR\",
      \"sequence\": 1,
      \"total_cycles\": 0,
      \"pricing_scheme\": { \"fixed_price\": { \"value\": \"84.00\", \"currency_code\": \"EUR\" } }
    }],
    \"payment_preferences\": {
      \"auto_bill_outstanding\": true,
      \"setup_fee_failure_action\": \"CONTINUE\",
      \"payment_failure_threshold\": 3
    }
  }")

PLAN_ID=$(echo "$PLAN_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

echo "PAYPAL_PRODUCT_ID=${PRODUCT_ID}"
echo "PAYPAL_PLAN_SMALL=${PLAN_ID}"
echo "Add these to frontend/.env.local and scripts/deploy/.env"
echo "Webhook URL: https://www.thesibook.gr/api/billing/paypal/webhook"
