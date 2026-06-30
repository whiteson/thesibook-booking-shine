#!/usr/bin/env bash
# Deploy via git pull ON SERVER (inside thesibook-booking-shine/source only), then build Next there.
# Prefer ./deploy-hetzner.sh (build locally + rsync) unless you want pull-on-server.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

CONFIG_FILE="${DEPLOY_CONFIG:-${SCRIPT_DIR}/.env}"
if [[ -f "${CONFIG_FILE}" ]]; then
  set -a && source "${CONFIG_FILE}" && set +a
fi

: "${DEPLOY_SSH:?Set DEPLOY_SSH in scripts/deploy/.env}"
: "${DEPLOY_REMOTE_ROOT:?Set DEPLOY_REMOTE_ROOT}"
: "${WORDPRESS_API_URL:?Set WORDPRESS_API_URL}"
: "${NEXT_PUBLIC_SITE_URL:?Set NEXT_PUBLIC_SITE_URL}"

DEPLOY_PROJECT_DIR="${DEPLOY_PROJECT_DIR:-thesibook-booking-shine}"
DEPLOY_NODE_PORT="${DEPLOY_NODE_PORT:-3005}"
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-22}"
DEPLOY_GIT_BRANCH="${DEPLOY_GIT_BRANCH:-main}"
REMOTE_BASE="${DEPLOY_REMOTE_ROOT}/${DEPLOY_PROJECT_DIR}"
REMOTE_SOURCE="${REMOTE_BASE}/source"
REMOTE_BACKEND="${REMOTE_BASE}/backend"
REMOTE_FRONTEND="${REMOTE_BASE}/frontend"

SSH_OPTS=(-o BatchMode=yes -o StrictHostKeyChecking=accept-new)
if [[ "${DEPLOY_SSH_PORT}" != "22" ]]; then
  SSH_OPTS+=(-p "${DEPLOY_SSH_PORT}")
fi
[[ -n "${DEPLOY_SSH_KEY:-}" ]] && SSH_OPTS+=(-i "${DEPLOY_SSH_KEY}")

ssh_cmd() {
  ssh "${SSH_OPTS[@]}" "${DEPLOY_SSH}" "$@"
}

echo "==> Git deploy: ${DEPLOY_SSH}:${REMOTE_SOURCE} (branch ${DEPLOY_GIT_BRANCH})"

ssh_cmd bash -s <<REMOTE
set -euo pipefail
if [[ ! -d "${REMOTE_SOURCE}/.git" ]]; then
  echo "Clone repo first:"
  echo "  mkdir -p ${REMOTE_BASE} && cd ${REMOTE_BASE}"
  echo "  git clone YOUR_REPO_URL source"
  exit 1
fi
cd "${REMOTE_SOURCE}"
git fetch origin
git checkout "${DEPLOY_GIT_BRANCH}"
git pull origin "${DEPLOY_GIT_BRANCH}"

# Sync backend from clone → live backend (keep wp-config + uploads)
rsync -a --delete \\
  --exclude wp-config.php \\
  --exclude wp-content/uploads/ \\
  backend/ "${REMOTE_BACKEND}/"

cd frontend
export WORDPRESS_API_URL="${WORDPRESS_API_URL}"
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL}"
export WORDPRESS_MEDIA_HOSTNAME="${WORDPRESS_MEDIA_HOSTNAME:-}"
npm ci
npm run build
STANDALONE="${REMOTE_SOURCE}/frontend/.next/standalone/frontend"
mkdir -p "\${STANDALONE}/.next"
cp -R .next/static "\${STANDALONE}/.next/static"
cp -R public "\${STANDALONE}/public"
rsync -a --delete "\${STANDALONE}/" "${REMOTE_FRONTEND}/"

cat > "${REMOTE_FRONTEND}/.env.production" <<EOF
NODE_ENV=production
PORT=${DEPLOY_NODE_PORT}
HOSTNAME=127.0.0.1
WORDPRESS_API_URL=${WORDPRESS_API_URL}
NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
WORDPRESS_MEDIA_HOSTNAME=${WORDPRESS_MEDIA_HOSTNAME:-}
EOF

cd "${REMOTE_BACKEND}" && wp plugin activate webcode-headless-api 2>/dev/null || true
wp rewrite flush --hard 2>/dev/null || true
sudo systemctl restart thesibook-frontend
REMOTE

echo "Git deploy complete."
