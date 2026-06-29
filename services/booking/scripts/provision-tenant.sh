#!/usr/bin/env bash
#
# Provision one Easy!Appointments tenant database (database-per-workspace).
# Called by control plane API or run manually for testing.
#
# Usage:
#   ./services/booking/scripts/provision-tenant.sh acme-salon 'StrongPass123!'
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
BOOK_DIR="${PROJECT_ROOT}/book"

SLUG="${1:-}"
TENANT_DB_PASSWORD="${2:-}"

log() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

[[ -n "${SLUG}" ]] || die "Usage: provision-tenant.sh <slug> [db_password]"
[[ "${SLUG}" =~ ^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$ ]] || die "Invalid slug (use lowercase a-z, 0-9, hyphen)"

if [[ -f "${PROJECT_ROOT}/scripts/local.env" ]]; then
  # shellcheck disable=SC1091
  set -a && source "${PROJECT_ROOT}/scripts/local.env" && set +a
fi
if [[ -f "${PROJECT_ROOT}/scripts/book.env" ]]; then
  # shellcheck disable=SC1091
  set -a && source "${PROJECT_ROOT}/scripts/book.env" && set +a
fi

MYSQL_ROOT_USER="${EA_DB_USER:-${DB_USER:-root}}"
MYSQL_ROOT_PASS="${EA_DB_PASSWORD:-${DB_PASSWORD:-password}}"
MYSQL_HOST="${EA_DB_HOST:-localhost}"

DB_NAME="ea_${SLUG//-/_}"
DB_USER="ea_${SLUG//-/_}"
DB_PASS="${TENANT_DB_PASSWORD:-$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)}"

require_cmd mysql
[[ -d "${BOOK_DIR}" ]] || die "book/ missing — run ./scripts/install-book.sh"

MYSQL=(mysql -h"${MYSQL_HOST}" -u"${MYSQL_ROOT_USER}" -p"${MYSQL_ROOT_PASS}")

log "Creating database ${DB_NAME} and user ${DB_USER}"
"${MYSQL[@]}" -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
"${MYSQL[@]}" -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
"${MYSQL[@]}" -e "GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost'; FLUSH PRIVILEGES;"

TEMPLATE="${PROJECT_ROOT}/scripts/book/config.php.template"
EA_BASE_URL="${EA_BASE_URL:-http://localhost:${EA_DEV_PORT:-8090}}"

sed \
  -e "s|{{EA_BASE_URL}}|${EA_BASE_URL}|g" \
  -e "s|{{EA_DB_HOST}}|${MYSQL_HOST}|g" \
  -e "s|{{EA_DB_NAME}}|${DB_NAME}|g" \
  -e "s|{{EA_DB_USER}}|${DB_USER}|g" \
  -e "s|{{EA_DB_PASSWORD}}|${DB_PASS}|g" \
  -e "s|{{EA_DEBUG_MODE}}|true|g" \
  "${TEMPLATE}" > "${BOOK_DIR}/config.php"

log "Running EA CLI install for tenant ${SLUG}"
(cd "${BOOK_DIR}" && php index.php console install)

log "Tenant provisioned:"
printf '  slug:     %s\n' "${SLUG}"
printf '  database: %s\n' "${DB_NAME}"
printf '  db_user:  %s\n' "${DB_USER}"
printf '  db_pass:  %s\n' "${DB_PASS}"
printf '  EA login: administrator / (see install output above)\n'
