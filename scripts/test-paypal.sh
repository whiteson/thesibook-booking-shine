#!/usr/bin/env bash
# Quick PayPal OAuth check (server-side credentials)
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
  echo "Create app: https://developer.paypal.com/dashboard/applications"
  echo "Business email: ${PAYPAL_BUSINESS_EMAIL:-johnbeazoglou@gmail.com}"
  exit 1
fi

MODE="${PAYPAL_MODE:-sandbox}"
if [[ "$MODE" == "live" ]]; then
  BASE="https://api-m.paypal.com"
else
  BASE="https://api-m.sandbox.paypal.com"
fi

echo "PayPal OAuth test ($MODE) → $BASE"

TOKEN=$(curl -sS -u "${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  "${BASE}/v1/oauth2/token" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")

if [[ -z "$TOKEN" ]]; then
  echo "OAuth failed — check Client ID / Secret and PAYPAL_MODE"
  exit 1
fi

echo "OK — access token received (${#TOKEN} chars)"
echo "Production webhook: https://thesibook.gr/api/billing/paypal/webhook"
echo "Production dashboard: https://thesibook.gr/dashboard"
