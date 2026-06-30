# Shared deploy helpers — source from deploy-hetzner.sh (do not execute directly).
DEPLOY_CONFIG_FILE=""

deploy_load_config() {
  local script_dir="$1"
  local config_file="${DEPLOY_CONFIG:-${script_dir}/.env}"
  if [[ ! -f "${config_file}" && -f "${script_dir}/config.example.env" ]]; then
    config_file="${script_dir}/config.example.env"
  fi
  DEPLOY_CONFIG_FILE="${config_file}"
  if [[ -f "${config_file}" ]]; then
    # shellcheck disable=SC1090
    set -a && source "${config_file}" && set +a
  fi
}

deploy_mask_secret() {
  local value="${1:-}"
  local label="${2:-}"
  if [[ -z "${value}" ]]; then
    echo "(not set)"
    return
  fi
  if [[ "${value}" == CHANGE_ME* ]] || [[ "${value}" == *CHANGE_ME* ]]; then
    echo "(placeholder — update before deploy)"
    return
  fi
  if [[ "${#value}" -le 4 ]]; then
    echo "****"
    return
  fi
  echo "${value:0:2}****${value: -1:1}"
}

deploy_yes_no() {
  local v="${1:-false}"
  if [[ "${v}" == "true" ]]; then
    echo "yes"
  else
    echo "no"
  fi
}

deploy_show_config_summary() {
  local wp_root="$1"
  local remote_base="$2"
  local config_file="${DEPLOY_CONFIG_FILE:-(none)}"

  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║           Deploy configuration (review before run)          ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  echo "  Config file:     ${config_file}"
  echo ""
  echo "  ── SSH / paths ──"
  echo "  DEPLOY_SSH:              ${DEPLOY_SSH}"
  echo "  DEPLOY_SSH_PORT:         ${DEPLOY_SSH_PORT:-22}"
  echo "  DEPLOY_REMOTE_ROOT:      ${DEPLOY_REMOTE_ROOT}"
  echo "  DEPLOY_PROJECT_DIR:      ${DEPLOY_PROJECT_DIR:-thesibook-booking-shine}"
  echo "  Remote app path:         ${remote_base}"
  echo "  WordPress (web):         ${DEPLOY_PUBLIC_HTML:-${DEPLOY_REMOTE_ROOT}/public_html}/${DEPLOY_PROJECT_DIR:-thesibook-booking-shine}/backend"
  echo "  DEPLOY_PUBLIC_HTML:      ${DEPLOY_PUBLIC_HTML:-${DEPLOY_REMOTE_ROOT}/public_html}"
  echo "  Link public_html:        $(deploy_yes_no "${DEPLOY_LINK_PUBLIC_HTML:-true}")"
  echo "  Server owner:            ${DEPLOY_SERVER_USER:-thesiu}:${DEPLOY_SERVER_GROUP:-thesiu}"
  echo "  WP-CLI (remote):         ${WP_CLI:-${DEPLOY_WP_CLI:-auto-detect}}"
  echo ""
  echo "  ── URLs (production) ──"
  echo "  NEXT_PUBLIC_SITE_URL:    ${NEXT_PUBLIC_SITE_URL}"
  echo "  WORDPRESS_API_URL:       ${WORDPRESS_API_URL}"
  echo "  WP site URL (install):   ${wp_root}"
  echo "  WORDPRESS_MEDIA_HOST:    ${WORDPRESS_MEDIA_HOSTNAME:-(same as API host)}"
  echo "  WEBCODE_CORS_ORIGINS:    ${WEBCODE_HEADLESS_CORS_ORIGINS:-${NEXT_PUBLIC_SITE_URL}}"
  echo ""
  echo "  ── MySQL (WordPress) ──"
  echo "  WP_DB_NAME:              ${WP_DB_NAME:-(not set)}"
  echo "  WP_DB_USER:              ${WP_DB_USER:-(not set)}"
  echo "  WP_DB_HOST:              ${WP_DB_HOST:-(not set)}"
  echo "  WP_DB_PASSWORD:          $(deploy_mask_secret "${WP_DB_PASSWORD:-}")"
  echo ""
  echo "  ── WordPress admin (first install) ──"
  echo "  WP_ADMIN_USER:           ${WP_ADMIN_USER:-admin}"
  echo "  WP_ADMIN_EMAIL:          ${WP_ADMIN_EMAIL:-(not set)}"
  echo "  WP_ADMIN_PASSWORD:       $(deploy_mask_secret "${WP_ADMIN_PASSWORD:-}")"
  echo "  WP_SITE_TITLE:           ${WP_SITE_TITLE:-Webcode}"
  echo "  DEPLOY_WP_SETUP:         $(deploy_yes_no "${DEPLOY_WP_SETUP:-true}")"
  echo "  DEPLOY_WP_SEED:          ${DEPLOY_WP_SEED:-auto}"
  echo ""
  echo "  ── Next.js ──"
  echo "  NEXT_RENDER_MODE:        ${NEXT_RENDER_MODE:-isr}  (isr = SSG+ISR, ssr = per-request)"
  echo "  DEPLOY_NODE_PORT:        ${DEPLOY_NODE_PORT:-3005}  (internal 127.0.0.1 — proxy HTTPS → this port)"
  echo "  Remote frontend:         ${remote_base}/frontend"
  echo "  DEPLOY_SKIP_BACKEND:     $(deploy_yes_no "${DEPLOY_SKIP_BACKEND:-false}")"
  echo "  DEPLOY_SKIP_FRONTEND:    $(deploy_yes_no "${DEPLOY_SKIP_FRONTEND:-false}")"
  echo ""
  echo "  ── What will run ──"
  if [[ "${DEPLOY_SKIP_BACKEND:-false}" != "true" ]]; then
    echo "  • rsync backend/ → server"
    if [[ "${DEPLOY_LINK_PUBLIC_HTML:-true}" == "true" ]]; then
      echo "  • rsync backend → public_html/.../thesibook-booking-shine/backend (no symlink)"
    fi
    if [[ "${DEPLOY_WP_SETUP:-true}" == "true" ]]; then
      echo "  • wp-cli bootstrap (install if new DB, plugins, seed if auto+new)"
    fi
  fi
  if [[ "${DEPLOY_SKIP_FRONTEND:-false}" != "true" ]]; then
    echo "  • npm ci && build (local) → rsync standalone → restart Node :${DEPLOY_NODE_PORT:-3005}"
  fi
  echo ""
}

deploy_preflight_checks() {
  local wp_root="$1"
  local warnings=0

  echo "  ── Preflight ──"

  if [[ -z "${WP_ADMIN_PASSWORD:-}" ]] || [[ "${WP_ADMIN_PASSWORD}" == CHANGE_ME* ]]; then
    echo "  ⚠ WP_ADMIN_PASSWORD is missing or still a placeholder"
    warnings=$((warnings + 1))
  fi
  if [[ "${DEPLOY_WP_SETUP:-true}" == "true" ]]; then
    for var in WP_DB_NAME WP_DB_USER WP_DB_PASSWORD WP_DB_HOST WP_ADMIN_EMAIL; do
      if [[ -z "${!var:-}" ]] || [[ "${!var}" == CHANGE_ME* ]]; then
        echo "  ⚠ ${var} is missing or placeholder"
        warnings=$((warnings + 1))
      fi
    done
  fi

  if deploy_ssh "true" 2>/dev/null; then
    echo "  ✓ SSH connection OK"
  else
    echo "  ✗ SSH connection failed (${DEPLOY_SSH}, port ${DEPLOY_SSH_PORT:-22})"
    return 1
  fi

  if [[ "${DEPLOY_LINK_PUBLIC_HTML:-true}" == "true" && "${DEPLOY_SKIP_BACKEND:-false}" != "true" ]]; then
    if deploy_ssh "test -d '${DEPLOY_PUBLIC_HTML:-${DEPLOY_REMOTE_ROOT}/public_html}'"; then
      echo "  ✓ public_html exists"
    else
      echo "  ✗ public_html not found at ${DEPLOY_PUBLIC_HTML:-${DEPLOY_REMOTE_ROOT}/public_html}"
      return 1
    fi
  fi

  if [[ "${DEPLOY_WP_SETUP:-true}" == "true" && "${DEPLOY_SKIP_BACKEND:-false}" != "true" ]]; then
    local wp_bin="${WP_CLI:-wp}"
    if deploy_ssh "test -x '${wp_bin}' && '${wp_bin}' --info >/dev/null 2>&1"; then
      echo "  ✓ wp-cli: ${wp_bin}"
    else
      echo "  ✗ wp-cli not runnable: ${wp_bin}"
      echo "    Set DEPLOY_WP_CLI in .env (e.g. /usr/home/thesiu/bin/wp)"
      return 1
    fi
  fi

  if [[ "${DEPLOY_SKIP_FRONTEND:-false}" != "true" ]]; then
    if command -v node >/dev/null 2>&1; then
      echo "  ✓ node local: $(node -v)"
    else
      echo "  ✗ node not found locally (needed to build Next)"
      return 1
    fi
  fi

  if [[ "${warnings}" -gt 0 ]]; then
    echo "  (${warnings} warning(s) — fix .env or continue at your own risk)"
  fi
  echo ""
  return 0
}

deploy_confirm_proceed() {
  if [[ "${DEPLOY_YES:-}" == "1" || "${DEPLOY_YES:-}" == "true" || "${CI:-}" == "true" ]]; then
    echo "  Auto-confirm (DEPLOY_YES or CI)."
    echo ""
    return 0
  fi
  read -r -p "  Proceed with deploy? [y/N] " reply
  echo ""
  case "${reply}" in
    y|Y|yes|YES) return 0 ;;
    *) echo "Deploy cancelled."; return 1 ;;
  esac
}

deploy_init_ssh() {
  SSH_OPTS=(-o BatchMode=yes -o StrictHostKeyChecking=accept-new)
  if [[ "${DEPLOY_SSH_PORT:-22}" != "22" ]]; then
    SSH_OPTS+=(-p "${DEPLOY_SSH_PORT}")
  fi
  if [[ -n "${DEPLOY_SSH_KEY:-}" ]]; then
    SSH_OPTS+=(-i "${DEPLOY_SSH_KEY}")
  fi
  RSYNC_SSH="ssh ${SSH_OPTS[*]}"
}

deploy_ssh() {
  ssh "${SSH_OPTS[@]}" "${DEPLOY_SSH}" "$@"
}

deploy_rsync() {
  rsync -az --delete -e "${RSYNC_SSH}" "$@"
}

# https://webcode.gr/thesibook-booking-shine/backend/wp-json/webcode/v1 → WP root URL
deploy_wp_root_url() {
  local api="${WORDPRESS_API_URL%/}"
  api="${api%/wp-json/webcode/v1}"
  echo "${api}"
}

# wp-cli on your-server is often in ~/.linuxbrew/bin (login PATH only)
deploy_resolve_wp_cli() {
  if [[ -n "${DEPLOY_WP_CLI:-}" ]]; then
    echo "${DEPLOY_WP_CLI}"
    return 0
  fi
  local found remote_root="${DEPLOY_REMOTE_ROOT:-/usr/home/thesiu}"
  found="$(deploy_ssh "bash -lc 'command -v wp 2>/dev/null'" 2>/dev/null | tr -d '\r\n')" || true
  if [[ -n "${found}" ]]; then
    echo "${found}"
    return 0
  fi
  if deploy_ssh "test -x '${remote_root}/.linuxbrew/bin/wp'" 2>/dev/null; then
    echo "${remote_root}/.linuxbrew/bin/wp"
    return 0
  fi
  echo "wp"
}
