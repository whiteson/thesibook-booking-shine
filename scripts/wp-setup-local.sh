#!/usr/bin/env bash
# Local WP bootstrap: wp core install, plugins, theme, seed. Idempotent.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND="${BACKEND:-${PROJECT_ROOT}/backend}"

if [[ -f "${SCRIPT_DIR}/local.env" ]]; then
  # shellcheck disable=SC1091
  set -a && source "${SCRIPT_DIR}/local.env" && set +a
fi

PROJECT_SLUG="${PROJECT_SLUG:-$(basename "${PROJECT_ROOT}")}"
WP_LOCAL_URL="${WP_LOCAL_URL:-http://localhost/${PROJECT_SLUG}/backend}"
DB_NAME="${DB_NAME:-${PROJECT_SLUG}_backend}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-password}"
DB_HOST="${DB_HOST:-localhost}"
WP_ADMIN_USER="${WP_ADMIN_USER:-admin}"
WP_ADMIN_PASSWORD="${WP_ADMIN_PASSWORD:-admin}"
WP_ADMIN_EMAIL="${WP_ADMIN_EMAIL:-dev@localhost.test}"
WP_SITE_TITLE="${WP_SITE_TITLE:-Local Dev}"
WEBCODE_FRONTEND_URL="${WEBCODE_FRONTEND_URL:-http://localhost:3002}"
LOCAL_WP_SEED="${LOCAL_WP_SEED:-true}"
WP_CLI="${WP_CLI:-wp}"

log() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

command -v "${WP_CLI}" >/dev/null 2>&1 || die "wp-cli not found. Install: brew install wp-cli"

run_wp() {
  (cd "${BACKEND}" && "${WP_CLI}" --url="${WP_LOCAL_URL}" "$@")
}

cd "${BACKEND}"

if [[ ! -f wp-config.php ]]; then
  log "Creating wp-config.php..."
  EXTRA_PHP=""
  EXTRA_PHP+="define('WEBCODE_FRONTEND_URL', '${WEBCODE_FRONTEND_URL}');"$'\n'
  EXTRA_PHP+="define('WEBCODE_MAILHOG', true);"$'\n'
  EXTRA_PHP+="define('WP_DEBUG', true);"$'\n'
  EXTRA_PHP+="define('WP_DEBUG_LOG', true);"$'\n'
  EXTRA_PHP+="define('WP_DEBUG_DISPLAY', false);"$'\n'

  run_wp config create \
    --dbname="${DB_NAME}" \
    --dbuser="${DB_USER}" \
    --dbpass="${DB_PASSWORD}" \
    --dbhost="${DB_HOST}" \
    --dbcharset=utf8mb4 \
    --locale=en_US \
    --extra-php="${EXTRA_PHP}" \
    --force
fi

FRESH_INSTALL=false
if ! run_wp core is-installed 2>/dev/null; then
  log "Running wp core install..."
  run_wp core install \
    --url="${WP_LOCAL_URL}" \
    --title="${WP_SITE_TITLE}" \
    --admin_user="${WP_ADMIN_USER}" \
    --admin_password="${WP_ADMIN_PASSWORD}" \
    --admin_email="${WP_ADMIN_EMAIL}" \
    --skip-email
  FRESH_INSTALL=true
else
  log "WordPress already installed — updating URLs..."
  run_wp option update home "${WP_LOCAL_URL}" 2>/dev/null || true
  run_wp option update siteurl "${WP_LOCAL_URL}" 2>/dev/null || true
fi

log "Permalinks, plugins, theme..."
run_wp rewrite structure '/%postname%/' --hard 2>/dev/null || run_wp rewrite structure '/%postname%/'
run_wp rewrite flush --hard

run_wp plugin activate advanced-custom-fields-pro 2>/dev/null || true
run_wp plugin activate webcode-headless-api
run_wp plugin activate classic-editor 2>/dev/null || true
run_wp theme activate webcode 2>/dev/null || run_wp theme enable webcode --activate 2>/dev/null || true

if [[ "${LOCAL_WP_SEED}" == "true" ]]; then
  log "Seeding ThesiBook options + pages..."
  run_wp webcode seed-options 2>/dev/null || true
  run_wp webcode seed 2>/dev/null || true
  run_wp webcode webp 2>/dev/null || true
fi

log "Local WordPress ready."
log "  Admin:  ${WP_LOCAL_URL}/wp-admin/  (${WP_ADMIN_USER})"
log "  API:    ${WP_LOCAL_URL}/wp-json/webcode/v1/health"
log "  Next:   ${WEBCODE_FRONTEND_URL}  (npm run dev:ssr in frontend/)"
