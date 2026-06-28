#!/usr/bin/env bash
# Run ONCE on the Hetzner server (via SSH). Creates dirs + systemd unit only under thesibook-booking-shine/.
set -euo pipefail

REMOTE_ROOT="${1:?Usage: remote-install.sh /usr/home/webcode [port] [user] [group]}"
NODE_PORT="${2:-3002}"
RUN_USER="${3:-webcode}"
RUN_GROUP="${4:-webcode}"
PROJECT_DIR="thesibook-booking-shine"
BASE="${REMOTE_ROOT}/${PROJECT_DIR}"
FRONTEND="${BASE}/frontend"
BACKEND="${BASE}/backend"
ENV_FILE="${FRONTEND}/.env.production"

mkdir -p "${BACKEND}" "${FRONTEND}"

if [[ ! -f "${BACKEND}/wp-config.php" ]]; then
  echo "NOTE: Install WordPress in ${BACKEND} first (wp-config.php not found)."
fi

cat >"${ENV_FILE}" <<EOF
# Managed by deploy — customize WORDPRESS_API_URL / NEXT_PUBLIC_SITE_URL via deploy .env
NODE_ENV=production
PORT=${NODE_PORT}
HOSTNAME=127.0.0.1
EOF

UNIT_PATH="/etc/systemd/system/webcode-frontend.service"
sudo tee "${UNIT_PATH}" >/dev/null <<EOF
[Unit]
Description=Webcode Next.js (headless frontend)
After=network.target

[Service]
Type=simple
User=${RUN_USER}
Group=${RUN_GROUP}
WorkingDirectory=${FRONTEND}
EnvironmentFile=${ENV_FILE}
ExecStart=/usr/bin/node ${FRONTEND}/server.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable webcode-frontend

echo "Installed systemd unit: webcode-frontend (User=${RUN_USER} Group=${RUN_GROUP})"
echo "Frontend path: ${FRONTEND}"
echo "Backend path:  ${BACKEND}"
echo "Next: run deploy from your machine, then: sudo systemctl start webcode-frontend"
