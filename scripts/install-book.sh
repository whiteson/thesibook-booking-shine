#!/usr/bin/env bash
#
# Install Easy!Appointments into ./book (never committed to git).
#
# Usage:
#   ./scripts/install-book.sh                    # clone + book.env + config.php
#   ./scripts/install-book.sh --native           # + MySQL database + composer
#   ./scripts/install-book.sh --native --install # + php index.php console install
#   ./scripts/install-book.sh --serve            # PHP built-in server (after --native)
#   ./scripts/install-book.sh --up               # Docker compose (optional, local only)
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BOOK_DIR="${PROJECT_ROOT}/book"
BOOK_SCRIPTS="${SCRIPT_DIR}/book"
EA_REPO="${EA_REPO:-https://github.com/alextselegidis/easyappointments.git}"
EA_BRANCH="${EA_BRANCH:-main}"

NATIVE=false
INSTALL=false
SERVE=false
UP=false

for arg in "$@"; do
  case "$arg" in
    --native) NATIVE=true ;;
    --install) INSTALL=true ;;
    --serve) SERVE=true ;;
    --up) UP=true ;;
  esac
done

log() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

load_env() {
  if [[ -f "${SCRIPT_DIR}/local.env" ]]; then
    # shellcheck disable=SC1091
    set -a && source "${SCRIPT_DIR}/local.env" && set +a
  fi
  if [[ ! -f "${SCRIPT_DIR}/book.env" ]] && [[ -f "${SCRIPT_DIR}/book.env.example" ]]; then
    cp "${SCRIPT_DIR}/book.env.example" "${SCRIPT_DIR}/book.env"
    log "Created scripts/book.env from example"
  fi
  if [[ -f "${SCRIPT_DIR}/book.env" ]]; then
    # shellcheck disable=SC1091
    set -a && source "${SCRIPT_DIR}/book.env" && set +a
  fi
}

render_config() {
  local template="${BOOK_SCRIPTS}/config.php.template"
  [[ -f "${template}" ]] || die "Missing ${template}"

  EA_BASE_URL="${EA_BASE_URL:-http://localhost:${EA_DEV_PORT:-8090}}"
  EA_DB_HOST="${EA_DB_HOST:-localhost}"
  EA_DB_NAME="${EA_DB_NAME:-thesibook_ea}"
  EA_DB_USER="${EA_DB_USER:-${DB_USER:-root}}"
  EA_DB_PASSWORD="${EA_DB_PASSWORD:-${DB_PASSWORD:-password}}"
  EA_DEBUG_MODE="${EA_DEBUG_MODE:-true}"

  sed \
    -e "s|{{EA_BASE_URL}}|${EA_BASE_URL}|g" \
    -e "s|{{EA_DB_HOST}}|${EA_DB_HOST}|g" \
    -e "s|{{EA_DB_NAME}}|${EA_DB_NAME}|g" \
    -e "s|{{EA_DB_USER}}|${EA_DB_USER}|g" \
    -e "s|{{EA_DB_PASSWORD}}|${EA_DB_PASSWORD}|g" \
    -e "s|{{EA_DEBUG_MODE}}|${EA_DEBUG_MODE}|g" \
    "${template}" > "${BOOK_DIR}/config.php"
  log "Wrote book/config.php (BASE_URL=${EA_BASE_URL}, DB=${EA_DB_NAME})"
}

create_database() {
  require_cmd mysql
  EA_DB_HOST="${EA_DB_HOST:-localhost}"
  EA_DB_NAME="${EA_DB_NAME:-thesibook_ea}"
  EA_DB_USER="${EA_DB_USER:-${DB_USER:-root}}"
  EA_DB_PASSWORD="${EA_DB_PASSWORD:-${DB_PASSWORD:-password}}"

  MYSQL=(mysql -h"${EA_DB_HOST}" -u"${EA_DB_USER}" -p"${EA_DB_PASSWORD}")
  log "Creating database ${EA_DB_NAME} if not exists"
  "${MYSQL[@]}" -e "CREATE DATABASE IF NOT EXISTS \`${EA_DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
}

composer_install() {
  if [[ ! -d "${BOOK_DIR}/vendor" ]]; then
    require_cmd composer
    log "Running composer install in book/ (--no-dev — skips PHPUnit 8.3 dev deps)"
    (cd "${BOOK_DIR}" && composer install --no-interaction --prefer-dist --no-dev)
  else
    log "book/vendor already present"
  fi
}

cli_install() {
  require_cmd php
  log "Running EA CLI install (migrate + seed)"
  (cd "${BOOK_DIR}" && php index.php console install)
  log "Default login: administrator / (password printed above by EA)"
}

clone_upstream() {
  if [[ ! -f "${BOOK_DIR}/index.php" ]]; then
    require_cmd git
    log "Cloning Easy!Appointments into book/ (for our monorepo only — not pushed to their GitHub)"
    git clone --depth 1 --branch "${EA_BRANCH}" "${EA_REPO}" "${BOOK_DIR}"
    rm -rf "${BOOK_DIR}/.git"
    log "Removed book/.git — book/ is part of this repo, not a separate upstream remote"
  else
    log "book/ present"
  fi
  chmod -R u+w "${BOOK_DIR}/storage" 2>/dev/null || true
}

docker_up() {
  require_cmd docker
  docker compose version >/dev/null 2>&1 || die "Docker Compose v2 required"
  log "Starting Easy!Appointments via Docker"
  (
    cd "${BOOK_DIR}"
    if [[ -f "${SCRIPT_DIR}/book.env" ]]; then
      set -a && source "${SCRIPT_DIR}/book.env" && set +a
    fi
    docker compose up -d nginx mysql mailpit phpmyadmin
  )
  log "Open ${EA_BASE_URL:-http://localhost:8090}"
}

dev_server() {
  require_cmd php
  EA_DEV_PORT="${EA_DEV_PORT:-8090}"
  log "Serving book/ at http://127.0.0.1:${EA_DEV_PORT} (Ctrl+C to stop)"
  log "Admin after install: http://127.0.0.1:${EA_DEV_PORT}/index.php/backend"
  cd "${BOOK_DIR}" && exec php -S "127.0.0.1:${EA_DEV_PORT}"
}

# --- main ---
load_env
clone_upstream
render_config

if [[ "${NATIVE}" == true ]]; then
  create_database
  composer_install
  if [[ "${INSTALL}" == true ]]; then
    cli_install
  else
    log "Skip CLI install — run with --install or open ${EA_BASE_URL} for web wizard"
  fi
fi

if [[ "${UP}" == true ]]; then
  docker_up
fi

if [[ "${SERVE}" == true ]]; then
  dev_server
fi

log "Done — see scripts/BOOK.md"
