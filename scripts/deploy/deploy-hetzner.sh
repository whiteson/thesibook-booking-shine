#!/usr/bin/env bash
# Full deploy: WordPress (first-time bootstrap) + Next.js — only ${DEPLOY_REMOTE_ROOT}/${DEPLOY_PROJECT_DIR}/
# Usage: ./deploy-hetzner.sh          # review config + confirm, then deploy
#        ./deploy-hetzner.sh --check   # review + preflight only (no deploy)
set -euo pipefail

DEPLOY_CHECK_ONLY=false
[[ "${1:-}" == "--check" || "${1:-}" == "-n" ]] && DEPLOY_CHECK_ONLY=true

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
# shellcheck source=lib.sh
source "${SCRIPT_DIR}/lib.sh"

deploy_load_config "${SCRIPT_DIR}"

: "${DEPLOY_SSH:?Set DEPLOY_SSH in scripts/deploy/.env}"
: "${DEPLOY_REMOTE_ROOT:?Set DEPLOY_REMOTE_ROOT}"
: "${WORDPRESS_API_URL:?Set WORDPRESS_API_URL}"
: "${NEXT_PUBLIC_SITE_URL:?Set NEXT_PUBLIC_SITE_URL}"

DEPLOY_PROJECT_DIR="${DEPLOY_PROJECT_DIR:-thesibook-booking-shine}"
DEPLOY_NODE_PORT="${DEPLOY_NODE_PORT:-3002}"
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-22}"
DEPLOY_SKIP_BACKEND="${DEPLOY_SKIP_BACKEND:-false}"
DEPLOY_SKIP_FRONTEND="${DEPLOY_SKIP_FRONTEND:-false}"
DEPLOY_WP_SETUP="${DEPLOY_WP_SETUP:-true}"
DEPLOY_WP_SEED="${DEPLOY_WP_SEED:-auto}"
DEPLOY_LINK_PUBLIC_HTML="${DEPLOY_LINK_PUBLIC_HTML:-true}"
DEPLOY_PUBLIC_HTML="${DEPLOY_PUBLIC_HTML:-${DEPLOY_REMOTE_ROOT}/public_html}"
DEPLOY_SERVER_USER="${DEPLOY_SERVER_USER:-webcode}"
DEPLOY_SERVER_GROUP="${DEPLOY_SERVER_GROUP:-webcode}"

REMOTE_BASE="${DEPLOY_REMOTE_ROOT}/${DEPLOY_PROJECT_DIR}"
REMOTE_BACKEND="${REMOTE_BASE}/backend"
REMOTE_BACKEND_WEB="${DEPLOY_PUBLIC_HTML}/${DEPLOY_PROJECT_DIR}/backend"
REMOTE_FRONTEND="${REMOTE_BASE}/frontend"
WP_ROOT_URL="$(deploy_wp_root_url)"

WEBCODE_FRONTEND_URL="${NEXT_PUBLIC_SITE_URL%/}"
WEBCODE_HEADLESS_CORS_ORIGINS="${WEBCODE_HEADLESS_CORS_ORIGINS:-${NEXT_PUBLIC_SITE_URL}}"
if [[ "${NEXT_PUBLIC_SITE_URL}" == *"www."* ]]; then
  WEBCODE_HEADLESS_CORS_ORIGINS="${NEXT_PUBLIC_SITE_URL},${NEXT_PUBLIC_SITE_URL/www./}"
fi

deploy_init_ssh
WP_CLI="$(deploy_resolve_wp_cli)"
export WP_CLI

deploy_show_config_summary "${WP_ROOT_URL}" "${REMOTE_BASE}"
deploy_preflight_checks "${WP_ROOT_URL}" || exit 1

if [[ "${DEPLOY_CHECK_ONLY}" == "true" ]]; then
  echo "  Check only — no deploy (--check)."
  exit 0
fi

deploy_confirm_proceed || exit 1

echo "==> Deploy target: ${DEPLOY_SSH}:${REMOTE_BASE}"
echo "    (other folders under ${DEPLOY_REMOTE_ROOT} are not touched)"

deploy_ssh "mkdir -p '${REMOTE_BACKEND}' '${REMOTE_FRONTEND}'"
deploy_fix_ownership() {
  deploy_ssh "chown -R '${DEPLOY_SERVER_USER}:${DEPLOY_SERVER_GROUP}' '${REMOTE_BASE}' 2>/dev/null || true"
}

# --- Backend (WordPress files) ---
if [[ "${DEPLOY_SKIP_BACKEND}" != "true" ]]; then
  echo "==> Syncing WordPress backend..."
  mkdir -p "${REPO_ROOT}/backend"
  deploy_rsync \
    --exclude '.git' \
    --exclude 'wp-config.php' \
    --exclude 'wp-config-local.php' \
    --exclude 'wp-content/cache/' \
    --exclude 'wp-content/uploads/' \
    --exclude '*.zip' \
    --exclude '.DS_Store' \
    "${REPO_ROOT}/backend/" \
    "${DEPLOY_SSH}:${REMOTE_BACKEND}/"

  if [[ "${DEPLOY_LINK_PUBLIC_HTML}" == "true" ]]; then
    echo "==> Wiring WordPress into existing public_html (docroot for webcode.gr)..."
    if ! deploy_ssh "test -d '${DEPLOY_PUBLIC_HTML}'"; then
      echo "ERROR: public_html not found at ${DEPLOY_PUBLIC_HTML}" >&2
      echo "       Set DEPLOY_PUBLIC_HTML in scripts/deploy/.env to your real docroot path." >&2
      exit 1
    fi
    # Real files under public_html (symlinks to home dir cause 403 on this host)
    deploy_ssh "mkdir -p '${DEPLOY_PUBLIC_HTML}/thesibook-booking-shine' && rm -f '${DEPLOY_PUBLIC_HTML}/thesibook-booking-shine/backend'"
    deploy_rsync \
      --exclude 'wp-config.php' \
      --exclude 'wp-content/uploads/' \
      "${REPO_ROOT}/backend/" \
      "${DEPLOY_SSH}:${REMOTE_BACKEND_WEB}/"
    echo "    ${REMOTE_BACKEND_WEB}"
  fi

  if [[ "${DEPLOY_WP_SETUP}" == "true" ]]; then
    for var in WP_DB_NAME WP_DB_USER WP_DB_PASSWORD WP_DB_HOST WP_ADMIN_PASSWORD WP_ADMIN_EMAIL; do
      if [[ -z "${!var:-}" ]]; then
        echo "ERROR: Set ${var} in scripts/deploy/.env (create MySQL DB in hosting panel first)." >&2
        exit 1
      fi
    done

    echo "==> Bootstrapping WordPress (install if needed, plugins, seed)..."
    # Session env file avoids shell-breaking DB passwords (#, ), %, etc.)
    DEPLOY_SESSION_ENV="$(mktemp)"
    # shellcheck disable=SC2317
    cleanup_session_env() { rm -f "${DEPLOY_SESSION_ENV}"; }
    trap cleanup_session_env RETURN
    {
      printf 'REMOTE_BACKEND=%q\n' "${REMOTE_BACKEND_WEB}"
      printf 'WP_ROOT_URL=%q\n' "${WP_ROOT_URL}"
      printf 'WP_DB_NAME=%q\n' "${WP_DB_NAME}"
      printf 'WP_DB_USER=%q\n' "${WP_DB_USER}"
      printf 'WP_DB_PASSWORD=%q\n' "${WP_DB_PASSWORD}"
      printf 'WP_DB_HOST=%q\n' "${WP_DB_HOST}"
      printf 'WP_ADMIN_USER=%q\n' "${WP_ADMIN_USER:-admin}"
      printf 'WP_ADMIN_PASSWORD=%q\n' "${WP_ADMIN_PASSWORD}"
      printf 'WP_ADMIN_EMAIL=%q\n' "${WP_ADMIN_EMAIL}"
      printf 'WP_SITE_TITLE=%q\n' "${WP_SITE_TITLE:-Webcode}"
      printf 'WEBCODE_FRONTEND_URL=%q\n' "${WEBCODE_FRONTEND_URL}"
      printf 'WEBCODE_HEADLESS_CORS_ORIGINS=%q\n' "${WEBCODE_HEADLESS_CORS_ORIGINS}"
      printf 'DEPLOY_WP_SEED=%q\n' "${DEPLOY_WP_SEED}"
      printf 'WP_CLI=%q\n' "${WP_CLI}"
    } >"${DEPLOY_SESSION_ENV}"
    deploy_rsync "${DEPLOY_SESSION_ENV}" "${DEPLOY_SSH}:${REMOTE_BACKEND_WEB}/.deploy-session.env"
    deploy_ssh "set -a && . '${REMOTE_BACKEND_WEB}/.deploy-session.env' && set +a && rm -f '${REMOTE_BACKEND_WEB}/.deploy-session.env' && bash -s" \
      < "${SCRIPT_DIR}/wp-setup-remote.sh"
    deploy_fix_ownership
  else
    echo "==> WordPress maintenance (plugins, permalinks)..."
    deploy_ssh "cd '${REMOTE_BACKEND_WEB}' && '${WP_CLI}' plugin activate webcode-headless-api 2>/dev/null || true; '${WP_CLI}' rewrite flush --hard 2>/dev/null || true" || true
    deploy_fix_ownership
  fi
fi

# --- Frontend (Next.js standalone) ---
if [[ "${DEPLOY_SKIP_FRONTEND}" != "true" ]]; then
  echo "==> Building Next.js (standalone)..."
  export WORDPRESS_API_URL
  export NEXT_PUBLIC_SITE_URL
  export WORDPRESS_MEDIA_HOSTNAME="${WORDPRESS_MEDIA_HOSTNAME:-}"
  export NEXT_RENDER_MODE="${NEXT_RENDER_MODE:-isr}"

  (cd "${REPO_ROOT}/frontend" && npm ci && npm run build)

  STANDALONE="${REPO_ROOT}/frontend/.next/standalone/frontend"
  if [[ ! -f "${STANDALONE}/server.js" ]]; then
    echo "ERROR: standalone build missing at ${STANDALONE}/server.js" >&2
    exit 1
  fi

  mkdir -p "${STANDALONE}/.next"
  cp -R "${REPO_ROOT}/frontend/.next/static" "${STANDALONE}/.next/static"
  cp -R "${REPO_ROOT}/frontend/public" "${STANDALONE}/public"

  echo "==> Syncing Next.js standalone app..."
  deploy_rsync \
    --exclude '.git' \
    "${STANDALONE}/" \
    "${DEPLOY_SSH}:${REMOTE_FRONTEND}/"

  echo "==> Writing production env on server..."
  MEDIA_LINE=""
  if [[ -n "${WORDPRESS_MEDIA_HOSTNAME:-}" ]]; then
    MEDIA_LINE="WORDPRESS_MEDIA_HOSTNAME=${WORDPRESS_MEDIA_HOSTNAME}"
  fi
  deploy_ssh "cat > '${REMOTE_FRONTEND}/.env.production' <<EOF
NODE_ENV=production
PORT=${DEPLOY_NODE_PORT}
HOSTNAME=127.0.0.1
WORDPRESS_API_URL=${WORDPRESS_API_URL}
NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
NEXT_RENDER_MODE=${NEXT_RENDER_MODE:-isr}
${MEDIA_LINE}
EOF"

  deploy_fix_ownership

  echo "==> Restarting webcode-frontend (if systemd unit exists)..."
  if deploy_ssh "systemctl is-enabled webcode-frontend 2>/dev/null"; then
    deploy_ssh "sudo systemctl restart webcode-frontend && sudo systemctl is-active webcode-frontend"
  else
    echo "    NOTE: webcode-frontend not installed. One-time on server:"
    echo "    scp -P ${DEPLOY_SSH_PORT} scripts/deploy/remote-install.sh ${DEPLOY_SSH}:/tmp/"
    echo "    ssh -p ${DEPLOY_SSH_PORT} ${DEPLOY_SSH} 'bash /tmp/remote-install.sh ${DEPLOY_REMOTE_ROOT} ${DEPLOY_NODE_PORT} ${DEPLOY_SERVER_USER} ${DEPLOY_SERVER_GROUP}'"
    echo "    Or proxy ${NEXT_PUBLIC_SITE_URL} → 127.0.0.1:${DEPLOY_NODE_PORT} in the panel."
  fi
fi

echo ""
echo "Deploy complete."
echo "  API:    ${WORDPRESS_API_URL%/}/health"
echo "  Site:   ${NEXT_PUBLIC_SITE_URL}"
echo "  WP:     ${WP_ROOT_URL}/wp-admin"
echo "  Admin:  ${WP_ADMIN_USER:-admin} (password from scripts/deploy/.env)"
