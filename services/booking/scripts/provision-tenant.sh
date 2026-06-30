#!/usr/bin/env bash
#
# Provision one Easy!Appointments tenant (database-per-workspace).
#
# Usage:
#   ./services/booking/scripts/provision-tenant.sh SLUG [DB_PASS] [DISPLAY_NAME] [ADMIN_EMAIL] [ADMIN_PASSWORD]
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
BOOK_DIR="${PROJECT_ROOT}/book"
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

MYSQL_ROOT_USER="${EA_DB_USER:-${DB_USER:-root}}"
MYSQL_ROOT_PASS="${EA_DB_PASSWORD:-${DB_PASSWORD:-password}}"
MYSQL_HOST="${EA_DB_HOST:-localhost}"
EA_BASE_URL="${EA_BASE_URL:-http://127.0.0.1:${EA_DEV_PORT:-8090}}"

DB_NAME="ea_${SLUG//-/_}"
DB_USER="ea_${SLUG//-/_}"
DB_PASS="${TENANT_DB_PASSWORD:-$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)}"

require_cmd() { command -v "$1" >/dev/null 2>&1 || die "Missing: $1"; }
require_cmd mysql
require_cmd php
[[ -d "${BOOK_DIR}" ]] || die "book/ missing"

MYSQL=(mysql -h"${MYSQL_HOST}" -u"${MYSQL_ROOT_USER}" -p"${MYSQL_ROOT_PASS}")

log "Creating database ${DB_NAME}"
"${MYSQL[@]}" -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
"${MYSQL[@]}" -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
"${MYSQL[@]}" -e "GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost'; FLUSH PRIVILEGES;"

mkdir -p "${TENANT_DIR}/${SLUG}"

# Write tenant meta for thesibook-bootstrap.php
php -r "
echo json_encode([
  'slug' => '${SLUG}',
  'base_url' => '${EA_BASE_URL}',
  'db_host' => '${MYSQL_HOST}',
  'db_name' => '${DB_NAME}',
  'db_user' => '${DB_USER}',
  'db_password' => '${DB_PASS}',
  'display_name' => '${DISPLAY_NAME}',
  'debug' => true,
  'language' => 'english',
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
" > "${TENANT_DIR}/${SLUG}/meta.json"

# Temp config for CLI install
TEMPLATE="${PROJECT_ROOT}/scripts/book/config.php.template"
sed \
  -e "s|{{EA_BASE_URL}}|${EA_BASE_URL}|g" \
  -e "s|{{EA_DB_HOST}}|${MYSQL_HOST}|g" \
  -e "s|{{EA_DB_NAME}}|${DB_NAME}|g" \
  -e "s|{{EA_DB_USER}}|${DB_USER}|g" \
  -e "s|{{EA_DB_PASSWORD}}|${DB_PASS}|g" \
  -e "s|{{EA_DEBUG_MODE}}|true|g" \
  "${TEMPLATE}" > "${BOOK_DIR}/config.php"

log "Running EA CLI install for ${SLUG}"
(cd "${BOOK_DIR}" && php index.php console install)

if [[ -n "${ADMIN_EMAIL}" && -n "${ADMIN_PASSWORD}" ]]; then
  log "Customizing admin user and company name"
  HASH="$(php -r "echo password_hash('${ADMIN_PASSWORD}', PASSWORD_BCRYPT);")"
  "${MYSQL[@]}" "${DB_NAME}" <<SQL
UPDATE ea_settings SET value='${DISPLAY_NAME}' WHERE name='company_name';
UPDATE ea_settings SET value='${ADMIN_EMAIL}' WHERE name='company_email';
UPDATE ea_users u
  INNER JOIN ea_roles r ON u.id_roles = r.id
  SET u.email='${ADMIN_EMAIL}', u.first_name='Admin', u.last_name='User'
  WHERE r.slug='admin';
UPDATE ea_user_settings us
  INNER JOIN ea_users u ON us.id_users = u.id
  INNER JOIN ea_roles r ON u.id_roles = r.id
  SET us.username='${ADMIN_EMAIL}', us.password='${HASH}'
  WHERE r.slug='admin';
SQL
fi

log "Tenant ready: ${EA_BASE_URL}?thesibook_tenant=${SLUG}"
printf '  slug:      %s\n' "${SLUG}"
printf '  database:  %s\n' "${DB_NAME}"
printf '  admin_url: %s/index.php/backend?thesibook_tenant=%s\n' "${EA_BASE_URL}" "${SLUG}"
