#!/usr/bin/env bash
# Create control plane DB + plans
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [[ -f "${ROOT}/scripts/local.env" ]]; then
  # shellcheck disable=SC1091
  set -a && source "${ROOT}/scripts/local.env" && set +a
fi

DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASSWORD:-password}"
DB_HOST="${DB_HOST:-localhost}"

mysql -h"${DB_HOST}" -u"${DB_USER}" -p"${DB_PASS}" < "${ROOT}/services/booking/sql/001_control_plane.sql"
mysql -h"${DB_HOST}" -u"${DB_USER}" -p"${DB_PASS}" thesibook_control < "${ROOT}/services/booking/sql/002_plans.sql" 2>/dev/null || true
mysql -h"${DB_HOST}" -u"${DB_USER}" -p"${DB_PASS}" thesibook_control < "${ROOT}/services/booking/sql/003_billing_orders.sql" 2>/dev/null || true
mysql -h"${DB_HOST}" -u"${DB_USER}" -p"${DB_PASS}" thesibook_control < "${ROOT}/services/booking/sql/004_paypal.sql" 2>/dev/null || true
mysql -h"${DB_HOST}" -u"${DB_USER}" -p"${DB_PASS}" thesibook_control < "${ROOT}/services/booking/sql/005_paypal_details.sql" 2>/dev/null || true

echo "Control plane ready: thesibook_control"
