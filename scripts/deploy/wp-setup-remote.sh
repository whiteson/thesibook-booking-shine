#!/usr/bin/env bash
# Runs ON SERVER via SSH (env vars set by deploy-hetzner.sh). Idempotent WP bootstrap.
set -euo pipefail

: "${REMOTE_BACKEND:?REMOTE_BACKEND required}"
: "${WP_ROOT_URL:?WP_ROOT_URL required}"
: "${WP_DB_NAME:?WP_DB_NAME required}"
: "${WP_DB_USER:?WP_DB_USER required}"
: "${WP_DB_PASSWORD:?WP_DB_PASSWORD required}"
: "${WP_DB_HOST:?WP_DB_HOST required}"
: "${WP_CLI:?WP_CLI required}"

WP_ADMIN_USER="${WP_ADMIN_USER:-admin}"
WP_ADMIN_PASSWORD="${WP_ADMIN_PASSWORD:?WP_ADMIN_PASSWORD required for first install}"
WP_ADMIN_EMAIL="${WP_ADMIN_EMAIL:?WP_ADMIN_EMAIL required for first install}"
WP_SITE_TITLE="${WP_SITE_TITLE:-Webcode}"
WEBCODE_FRONTEND_URL="${WEBCODE_FRONTEND_URL:-}"
WEBCODE_HEADLESS_CORS_ORIGINS="${WEBCODE_HEADLESS_CORS_ORIGINS:-}"
DEPLOY_WP_SEED="${DEPLOY_WP_SEED:-auto}"

run_wp() {
  "${WP_CLI}" --url="${WP_ROOT_URL}" "$@"
}

cd "${REMOTE_BACKEND}"

if [[ ! -x "${WP_CLI}" ]] && ! command -v "${WP_CLI}" >/dev/null 2>&1; then
  echo "ERROR: wp-cli not found at WP_CLI=${WP_CLI}" >&2
  exit 1
fi

if [[ ! -f wp-config.php ]]; then
  echo "==> Creating wp-config.php (production)..."
  EXTRA_PHP=""
  if [[ -n "${WEBCODE_FRONTEND_URL}" ]]; then
    EXTRA_PHP+="define('WEBCODE_FRONTEND_URL', '${WEBCODE_FRONTEND_URL}');"$'\n'
  fi
  if [[ -n "${WEBCODE_HEADLESS_CORS_ORIGINS}" ]]; then
    EXTRA_PHP+="define('WEBCODE_HEADLESS_CORS_ORIGINS', '${WEBCODE_HEADLESS_CORS_ORIGINS}');"$'\n'
  fi
  EXTRA_PHP+="define('WP_HOME', '${WP_ROOT_URL}');"$'\n'
  EXTRA_PHP+="define('WP_SITEURL', '${WP_ROOT_URL}');"$'\n'
  EXTRA_PHP+="define('WP_DEBUG', false);"$'\n'
  EXTRA_PHP+="define('WP_DEBUG_LOG', false);"$'\n'
  EXTRA_PHP+="define('WP_DEBUG_DISPLAY', false);"$'\n'

  run_wp config create \
    --dbname="${WP_DB_NAME}" \
    --dbuser="${WP_DB_USER}" \
    --dbpass="${WP_DB_PASSWORD}" \
    --dbhost="${WP_DB_HOST}" \
    --dbcharset=utf8mb4 \
    --locale=en_US \
    --extra-php="${EXTRA_PHP}" \
    --force
fi

FRESH_INSTALL=false
if ! run_wp core is-installed 2>/dev/null; then
  echo "==> Running wp core install..."
  run_wp core install \
    --url="${WP_ROOT_URL}" \
    --title="${WP_SITE_TITLE}" \
    --admin_user="${WP_ADMIN_USER}" \
    --admin_password="${WP_ADMIN_PASSWORD}" \
    --admin_email="${WP_ADMIN_EMAIL}" \
    --skip-email
  FRESH_INSTALL=true
else
  echo "==> WordPress already installed — updating options..."
  run_wp option update home "${WP_ROOT_URL}" 2>/dev/null || true
  run_wp option update siteurl "${WP_ROOT_URL}" 2>/dev/null || true
fi

echo "==> Permalinks, plugins, theme..."
run_wp rewrite structure '/%postname%/' --hard 2>/dev/null || run_wp rewrite structure '/%postname%/'
run_wp rewrite flush --hard

run_wp plugin activate advanced-custom-fields-pro 2>/dev/null || true
run_wp plugin activate webcode-headless-api
run_wp plugin activate classic-editor 2>/dev/null || true

run_wp theme activate webcode 2>/dev/null || run_wp theme enable webcode --activate 2>/dev/null || true

RUN_SEED=false
if [[ "${DEPLOY_WP_SEED}" == "true" ]]; then
  RUN_SEED=true
elif [[ "${DEPLOY_WP_SEED}" == "auto" && "${FRESH_INSTALL}" == "true" ]]; then
  RUN_SEED=true
elif [[ "${DEPLOY_WP_SEED}" == "auto" ]]; then
  # Re-seed content on every deploy when auto (keeps CMS in sync with repo seeder).
  RUN_SEED=true
fi

if [[ "${RUN_SEED}" == "true" ]]; then
  echo "==> Seeding ACF options + page builder content..."
  run_wp webcode seed-options 2>/dev/null || true
  run_wp webcode seed 2>/dev/null || true
  echo "==> Generating WebP companions for seeded media..."
  run_wp webcode webp 2>/dev/null || true
fi

echo "==> WordPress bootstrap done (${WP_CLI})."
run_wp core version
run_wp option get siteurl
