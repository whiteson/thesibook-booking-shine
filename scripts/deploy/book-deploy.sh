#!/usr/bin/env bash
#
# One-time / repeat: rsync book/ to production and run native install on server.
# EA is NOT on GitHub — synced from your machine only.
#
# Usage (from dev machine):
#   cp scripts/deploy/book.env.example scripts/deploy/book.env
#   ./scripts/deploy/book-deploy.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BOOK_DIR="${PROJECT_ROOT}/book"

# shellcheck disable=SC1091
[[ -f "${SCRIPT_DIR}/.env" ]] && source "${SCRIPT_DIR}/.env"
# shellcheck disable=SC1091
[[ -f "${SCRIPT_DIR}/book.env" ]] && source "${SCRIPT_DIR}/book.env"

DEPLOY_SSH="${DEPLOY_SSH:-}"
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-22}"
DEPLOY_REMOTE_ROOT="${DEPLOY_REMOTE_ROOT:-}"
BOOK_REMOTE_PATH="${BOOK_REMOTE_PATH:-${DEPLOY_REMOTE_ROOT}/book}"

log() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

[[ -d "${BOOK_DIR}" ]] || die "Run ./scripts/install-book.sh first (book/ missing locally)"
[[ -n "${DEPLOY_SSH}" ]] || die "Set DEPLOY_SSH in scripts/deploy/book.env"
[[ -n "${DEPLOY_REMOTE_ROOT}" ]] || die "Set DEPLOY_REMOTE_ROOT in scripts/deploy/book.env"

RSYNC_SSH="ssh -p ${DEPLOY_SSH_PORT}"

log "Rsync book/ → ${DEPLOY_SSH}:${BOOK_REMOTE_PATH}/"
rsync -avz --delete \
  -e "${RSYNC_SSH}" \
  --exclude '.git' \
  --exclude 'storage/cache/*' \
  --exclude 'storage/logs/*' \
  --exclude 'storage/sessions/*' \
  --exclude 'storage/backups/*' \
  --exclude 'docker/mysql' \
  "${BOOK_DIR}/" "${DEPLOY_SSH}:${BOOK_REMOTE_PATH}/"

log "Remote native install (composer + optional migrate)"
"${RSYNC_SSH}" "${DEPLOY_SSH}" bash -s <<REMOTE
set -euo pipefail
cd "${BOOK_REMOTE_PATH}"
if command -v composer >/dev/null 2>&1 && [[ ! -d vendor ]]; then
  composer install --no-interaction --prefer-dist --no-dev
fi
chmod -R u+w storage
echo "Configure nginx using scripts/deploy/book-nginx.conf.example on the server."
echo "Ensure config.php exists with production EA_BASE_URL and DB credentials."
REMOTE

log "Book deploy rsync complete."
