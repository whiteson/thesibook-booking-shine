#!/usr/bin/env bash
# Run control plane SQL migrations on production MySQL (via SSH + mysql client).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
# shellcheck source=lib.sh
source "${SCRIPT_DIR}/lib.sh"

deploy_load_config "${SCRIPT_DIR}"

: "${DEPLOY_SSH:?Set DEPLOY_SSH}"
: "${BOOKING_DB_HOST:?Set BOOKING_DB_HOST}"
: "${BOOKING_DB_USER:?Set BOOKING_DB_USER}"
: "${BOOKING_DB_PASSWORD:?Set BOOKING_DB_PASSWORD}"
: "${BOOKING_DB_NAME:?Set BOOKING_DB_NAME}"

deploy_init_ssh

run_sql() {
  local file="$1"
  local remote="/tmp/thesibook_migrate.sql"
  # Shared hosting: no CREATE DATABASE; target BOOKING_DB_NAME
  sed -e '/^CREATE DATABASE/d' -e "s/USE thesibook_control;/USE ${BOOKING_DB_NAME};/" \
    "${ROOT}/services/booking/sql/${file}" > /tmp/thesibook_migrate_local.sql
  deploy_rsync /tmp/thesibook_migrate_local.sql "${DEPLOY_SSH}:${remote}"
  deploy_ssh "mysql -h'${BOOKING_DB_HOST}' -u'${BOOKING_DB_USER}' -p'${BOOKING_DB_PASSWORD}' '${BOOKING_DB_NAME}' < '${remote}' 2>/dev/null || true; rm -f '${remote}'"
  rm -f /tmp/thesibook_migrate_local.sql
}

for sql in 001_control_plane.sql 002_plans.sql 003_billing_orders.sql 004_paypal.sql 005_paypal_details.sql; do
  echo "==> ${sql}"
  run_sql "${sql}"
done

echo "Control plane migrations applied on ${BOOKING_DB_NAME}@${BOOKING_DB_HOST}"
