#!/usr/bin/env bash
#
# Provision one Easy!Appointments tenant.
#
# Modes (EA_PROVISION_MODE):
#   separate — CREATE DATABASE ea_{slug} + dedicated user (needs MySQL admin)
#   shared   — one database, unique table prefix per tenant (shared hosting)
#   pool     — assign pre-provisioned Hetzner panel DB from cp_db_pool
#
# Usage:
#   ./services/booking/scripts/provision-tenant.sh SLUG [DB_PASS] [DISPLAY_NAME] [ADMIN_EMAIL] [ADMIN_PASSWORD]
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
BOOK_DIR="${BOOK_ROOT:-${PROJECT_ROOT}/book}"
TENANT_DIR="${BOOK_DIR}/tenants"

SLUG="${1:-}"
TENANT_DB_PASSWORD="${2:-}"
DISPLAY_NAME="${3:-ThesiBook Workspace}"
ADMIN_EMAIL="${4:-}"
ADMIN_PASSWORD="${5:-}"

log() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

[[ -n "${SLUG}" ]] || die "Usage: provision-tenant.sh <slug> [db_pass] [display_name] [admin_email] [admin_password]"
[[ "${SLUG}" =~ ^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$ ]] || die "Invalid slug"

if [[ -f "${PROJECT_ROOT}/scripts/local.env" ]]; then
  # shellcheck disable=SC1091
  set -a && source "${PROJECT_ROOT}/scripts/local.env" && set +a
fi
if [[ -f "${PROJECT_ROOT}/scripts/book.env" ]]; then
  # shellcheck disable=SC1091
  set -a && source "${PROJECT_ROOT}/scripts/book.env" && set +a
fi

PROVISION_MODE="${EA_PROVISION_MODE:-separate}"
MYSQL_HOST="${EA_DB_HOST:-localhost}"
EA_BASE_URL="${EA_BASE_URL:-http://127.0.0.1:${EA_DEV_PORT:-8090}}"
SLUG_UNDERSCORE="${SLUG//-/_}"

require_cmd() { command -v "$1" >/dev/null 2>&1 || die "Missing: $1"; }
require_cmd mysql
require_cmd php
[[ -d "${BOOK_DIR}" ]] || die "book/ missing"

if [[ "${PROVISION_MODE}" == "shared" ]]; then
  DB_NAME="${EA_SHARED_DB_NAME:-${BOOKING_DB_NAME:-thesibook_control}}"
  DB_USER="${EA_DB_USER:-${BOOKING_DB_USER:-root}}"
  DB_PASS="${EA_DB_PASSWORD:-${BOOKING_DB_PASSWORD:-password}}"
  DB_PREFIX="t_${SLUG_UNDERSCORE}_ea_"
  MYSQL=(mysql -h"${MYSQL_HOST}" -u"${DB_USER}" -p"${DB_PASS}")
  log "Shared DB mode: ${DB_NAME} prefix ${DB_PREFIX}"
elif [[ "${PROVISION_MODE}" == "pool" ]]; then
  DB_NAME="${EA_POOL_DB_NAME:?EA_POOL_DB_NAME required for pool mode}"
  DB_USER="${EA_POOL_DB_USER:?EA_POOL_DB_USER required for pool mode}"
  DB_PASS="${EA_POOL_DB_PASSWORD:?EA_POOL_DB_PASSWORD required for pool mode}"
  MYSQL_HOST="${EA_POOL_DB_HOST:?EA_POOL_DB_HOST required for pool mode}"
  DB_PREFIX="ea_"
  MYSQL=(mysql -h"${MYSQL_HOST}" -u"${DB_USER}" -p"${DB_PASS}")
  log "Pool DB mode: ${DB_NAME} @ ${MYSQL_HOST}"
else
  DB_NAME="ea_${SLUG_UNDERSCORE}"
  DB_USER="ea_${SLUG_UNDERSCORE}"
  DB_PASS="${TENANT_DB_PASSWORD:-$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)}"
  DB_PREFIX="ea_"
  MYSQL_ADMIN_USER="${EA_MYSQL_ADMIN_USER:-${EA_DB_USER:-root}}"
  MYSQL_ADMIN_PASS="${EA_MYSQL_ADMIN_PASSWORD:-${EA_DB_PASSWORD:-${DB_PASSWORD:-password}}}"
  MYSQL=(mysql -h"${MYSQL_HOST}" -u"${MYSQL_ADMIN_USER}" -p"${MYSQL_ADMIN_PASS}")
  log "Separate DB mode: creating ${DB_NAME}"
  "${MYSQL[@]}" -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  "${MYSQL[@]}" -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';" 2>/dev/null || \
    "${MYSQL[@]}" -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASS}';" 2>/dev/null || true
  "${MYSQL[@]}" -e "GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost'; FLUSH PRIVILEGES;" 2>/dev/null || \
    "${MYSQL[@]}" -e "GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'%'; FLUSH PRIVILEGES;" 2>/dev/null || true
  MYSQL=(mysql -h"${MYSQL_HOST}" -u"${DB_USER}" -p"${DB_PASS}")
fi

mkdir -p "${TENANT_DIR}/${SLUG}"

META_FILE="${TENANT_DIR}/${SLUG}/meta.json"
write_tenant_meta() {
  if [[ -f "${META_FILE}" && "${EA_PROVISION_OVERWRITE_META:-}" != "1" ]]; then
    log "Keeping existing ${META_FILE} (set EA_PROVISION_OVERWRITE_META=1 to replace)"
    return 0
  fi
  php -r "
echo json_encode([
  'slug' => '${SLUG}',
  'base_url' => '${EA_BASE_URL}',
  'db_host' => '${MYSQL_HOST}',
  'db_name' => '${DB_NAME}',
  'db_user' => '${DB_USER}',
  'db_password' => '${DB_PASS}',
  'db_prefix' => '${DB_PREFIX}',
  'provision_mode' => '${PROVISION_MODE}',
  'display_name' => '${DISPLAY_NAME}',
  'debug' => true,
  'language' => 'english',
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
" > "${META_FILE}"
}

write_tenant_meta

TEMPLATE="${SCRIPT_DIR}/../templates/config.php.template"
if [[ ! -f "${TEMPLATE}" ]]; then
  TEMPLATE="${PROJECT_ROOT}/scripts/book/config.php.template"
fi
[[ -f "${TEMPLATE}" ]] || die "config.php.template missing"

tenant_install_complete() {
  "${MYSQL[@]}" "${DB_NAME}" -N -e "SHOW TABLES LIKE '${DB_PREFIX}blocked_periods';" 2>/dev/null | grep -q blocked_periods
}

tenant_has_booking_data() {
  local services appointments users
  services=$("${MYSQL[@]}" "${DB_NAME}" -N -e "SELECT COUNT(*) FROM ${DB_PREFIX}services;" 2>/dev/null || echo "0")
  appointments=$("${MYSQL[@]}" "${DB_NAME}" -N -e "SELECT COUNT(*) FROM ${DB_PREFIX}appointments;" 2>/dev/null || echo "0")
  users=$("${MYSQL[@]}" "${DB_NAME}" -N -e "SELECT COUNT(*) FROM ${DB_PREFIX}users;" 2>/dev/null || echo "0")
  [[ "${services:-0}" -gt 1 || "${appointments:-0}" -gt 0 || "${users:-0}" -gt 2 ]]
}

drop_tenant_tables() {
  if tenant_has_booking_data && [[ "${EA_PROVISION_ALLOW_DATA_WIPE:-}" != "1" ]]; then
    die "Refusing to drop tenant tables — booking data exists (services/appointments/users). Set EA_PROVISION_ALLOW_DATA_WIPE=1 to override."
  fi
  if [[ "${EA_PROVISION_FORCE_REINSTALL:-}" != "1" ]]; then
    die "Refusing to drop tenant tables. Set EA_PROVISION_FORCE_REINSTALL=1 to reinstall."
  fi
  local tables
  tables=$("${MYSQL[@]}" "${DB_NAME}" -N -e "SELECT table_name FROM information_schema.tables WHERE table_schema='${DB_NAME}' AND table_name LIKE '${DB_PREFIX}%';" 2>/dev/null || true)
  [[ -z "${tables}" ]] && return 0
  log "WARNING: Dropping all ${DB_PREFIX}* tables in ${DB_NAME}"
  "${MYSQL[@]}" "${DB_NAME}" -e "SET FOREIGN_KEY_CHECKS=0;"
  while read -r table; do
    [[ -n "${table}" ]] && "${MYSQL[@]}" "${DB_NAME}" -e "DROP TABLE IF EXISTS \`${table}\`;"
  done <<< "${tables}"
  "${MYSQL[@]}" "${DB_NAME}" -e "SET FOREIGN_KEY_CHECKS=1;"
}

if tenant_install_complete; then
  log "Tenant tables already exist for prefix ${DB_PREFIX} — skipping EA install"
else
  if "${MYSQL[@]}" "${DB_NAME}" -N -e "SHOW TABLES LIKE '${DB_PREFIX}migrations';" 2>/dev/null | grep -q migrations; then
    log "Partial EA schema detected in ${DB_NAME} (prefix ${DB_PREFIX})"
    if tenant_has_booking_data; then
      die "Partial schema but tenant has booking data — manual fix required (do not auto-wipe). Run: php index.php console migrate"
    fi
    drop_tenant_tables
  fi
  sed \
    -e "s|{{EA_BASE_URL}}|${EA_BASE_URL}|g" \
    -e "s|{{EA_DB_HOST}}|${MYSQL_HOST}|g" \
    -e "s|{{EA_DB_NAME}}|${DB_NAME}|g" \
    -e "s|{{EA_DB_USER}}|${DB_USER}|g" \
    -e "s|{{EA_DB_PASSWORD}}|${DB_PASS}|g" \
    -e "s|{{EA_DB_PREFIX}}|${DB_PREFIX}|g" \
    -e "s|{{EA_DEBUG_MODE}}|true|g" \
    "${TEMPLATE}" > "${BOOK_DIR}/config.php"

  log "Running EA CLI install for ${SLUG}"
  (cd "${BOOK_DIR}" && php index.php console install)
  FRESH_EA_INSTALL=1
fi

if [[ -n "${ADMIN_EMAIL}" && -n "${ADMIN_PASSWORD}" ]]; then
  if [[ "${EA_SYNC_ADMIN:-}" == "1" || "${FRESH_EA_INSTALL:-}" == "1" ]]; then
    log "Customizing admin user and company name"
    HASH="$(php -r "echo password_hash('${ADMIN_PASSWORD}', PASSWORD_BCRYPT);")"
    "${MYSQL[@]}" "${DB_NAME}" <<SQL
UPDATE ${DB_PREFIX}settings SET value='${DISPLAY_NAME}' WHERE name='company_name';
UPDATE ${DB_PREFIX}settings SET value='info@thesibook.gr' WHERE name='company_email';
UPDATE ${DB_PREFIX}users u
  INNER JOIN ${DB_PREFIX}roles r ON u.id_roles = r.id
  SET u.email='${ADMIN_EMAIL}', u.first_name='Admin', u.last_name='User'
  WHERE r.slug='admin';
UPDATE ${DB_PREFIX}user_settings us
  INNER JOIN ${DB_PREFIX}users u ON us.id_users = u.id
  INNER JOIN ${DB_PREFIX}roles r ON u.id_roles = r.id
  SET us.username='${ADMIN_EMAIL}', us.password='${HASH}'
  WHERE r.slug='admin';
SQL
  else
    log "Skipping admin password sync (set EA_SYNC_ADMIN=1 to update login on existing tenant)"
  fi
fi

log "Tenant ready: ${EA_BASE_URL}?thesibook_tenant=${SLUG}"
printf '  slug:      %s\n' "${SLUG}"
printf '  mode:      %s\n' "${PROVISION_MODE}"
printf '  database:  %s\n' "${DB_NAME}"
printf '  prefix:    %s\n' "${DB_PREFIX}"
printf '  admin_url: %s/index.php/login?thesibook_tenant=%s\n' "${EA_BASE_URL}" "${SLUG}"
