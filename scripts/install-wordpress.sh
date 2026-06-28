#!/usr/bin/env bash
#
# Download WordPress core into ./backend and create the local MySQL database.
# Preserves an existing backend/wp-content directory.
#
# Load scripts/local.env if present, then override with env vars.
#
# Defaults:
#   DB_NAME={PROJECT_SLUG}_backend or webcode_elevate_backend
#   DB_USER=root
#   DB_PASSWORD=password
#   DB_HOST=localhost
#   WP_DIR=backend
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [[ -f "${SCRIPT_DIR}/local.env" ]]; then
  # shellcheck disable=SC1091
  set -a && source "${SCRIPT_DIR}/local.env" && set +a
fi

WP_DIR="${WP_DIR:-${PROJECT_ROOT}/backend}"
PROJECT_SLUG="${PROJECT_SLUG:-$(basename "${PROJECT_ROOT}")}"
DB_NAME="${DB_NAME:-${PROJECT_SLUG}_backend}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-password}"
DB_HOST="${DB_HOST:-localhost}"
WP_URL="${WP_URL:-https://wordpress.org/latest.tar.gz}"

MYSQL=(mysql -h"${DB_HOST}" -u"${DB_USER}" -p"${DB_PASSWORD}")
MYSQL_BATCH=(mysql -h"${DB_HOST}" -u"${DB_USER}" -p"${DB_PASSWORD}" --batch --skip-column-names)

log() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

require_cmd curl
require_cmd tar
require_cmd mysql

if ! curl -fsI "${WP_URL}" >/dev/null 2>&1; then
  die "Cannot reach ${WP_URL}"
fi

if ! "${MYSQL[@]}" -e "SELECT 1" >/dev/null 2>&1; then
  die "Cannot connect to MySQL as ${DB_USER}@${DB_HOST}. Is MySQL running? Check scripts/local.env"
fi

log "Creating database ${DB_NAME} (if missing)"
"${MYSQL[@]}" -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

WORKDIR="$(mktemp -d)"
trap 'rm -rf "${WORKDIR}"' EXIT

ARCHIVE="${WORKDIR}/wordpress-latest.tar.gz"
EXTRACT="${WORKDIR}/extract"

log "Downloading WordPress from ${WP_URL}"
curl -fsSL "${WP_URL}" -o "${ARCHIVE}"

mkdir -p "${EXTRACT}"
tar -xzf "${ARCHIVE}" -C "${EXTRACT}"
[[ -d "${EXTRACT}/wordpress" ]] || die "Unexpected archive layout (no wordpress/ directory)"

mkdir -p "${WP_DIR}"

log "Installing WordPress core into ${WP_DIR} (preserving wp-content)"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --exclude='wp-content' "${EXTRACT}/wordpress/" "${WP_DIR}/"
else
  (
    cd "${EXTRACT}/wordpress"
    find . -mindepth 1 -maxdepth 1 ! -name wp-content -exec cp -R {} "${WP_DIR}/" \;
  )
fi

WP_CONFIG="${WP_DIR}/wp-config.php"
if [[ ! -f "${WP_CONFIG}" ]]; then
  log "Creating ${WP_CONFIG}"
  cp "${WP_DIR}/wp-config-sample.php" "${WP_CONFIG}"

  sed -i.bak \
    -e "s/database_name_here/${DB_NAME}/" \
    -e "s/username_here/${DB_USER}/" \
    -e "s/password_here/${DB_PASSWORD}/" \
    -e "s/localhost/${DB_HOST}/" \
    "${WP_CONFIG}"
  rm -f "${WP_CONFIG}.bak"

  log "Fetching WordPress security keys"
  if [[ "$(uname -s)" == "Darwin" ]]; then
    sed -i.bak "/put your unique phrase here/d" "${WP_CONFIG}"
    rm -f "${WP_CONFIG}.bak"
  else
    sed -i "/put your unique phrase here/d" "${WP_CONFIG}"
  fi
  curl -fsSL https://api.wordpress.org/secret-key/1.1/salt/ >> "${WP_CONFIG}"
else
  log "Keeping existing ${WP_CONFIG}"
fi

TABLE_PREFIX="$("${MYSQL_BATCH[@]}" -D "${DB_NAME}" -e "SHOW TABLES LIKE 'wp_options'" 2>/dev/null | head -1 || true)"
if [[ -n "${TABLE_PREFIX}" ]]; then
  log "Database ${DB_NAME} already has WordPress tables"
  log "Next: ./scripts/wp-setup-local.sh  (or open WP admin if install incomplete)"
else
  log "Database is empty. Next step:"
  log "  ./scripts/wp-setup-local.sh"
  log "Or browser install at: ${WP_LOCAL_URL:-http://localhost/${PROJECT_SLUG}/backend}/wp-admin/install.php"
fi

log "Done. WordPress files are in ${WP_DIR}"
