#!/usr/bin/env bash
# Run ONCE on the ThesiBook server (thesiu @ dedi3543). Creates dirs + systemd unit.
# Does NOT touch webcode.gr or any other account.
set -euo pipefail

REMOTE_ROOT="${1:?Usage: remote-install.sh /usr/home/thesiu [port] [user] [group]}"
NODE_PORT="${2:-3005}"
RUN_USER="${3:-thesiu}"
RUN_GROUP="${4:-thesiu}"
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
# Managed by deploy — customize via scripts/deploy/.env
NODE_ENV=production
PORT=${NODE_PORT}
HOSTNAME=127.0.0.1
EOF

UNIT_PATH="/etc/systemd/system/thesibook-frontend.service"
sudo tee "${UNIT_PATH}" >/dev/null <<EOF
[Unit]
Description=ThesiBook Next.js (www.thesibook.gr)
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
sudo systemctl enable thesibook-frontend

echo "Installed systemd unit: thesibook-frontend (User=${RUN_USER} Group=${RUN_GROUP})"
echo "Frontend path: ${FRONTEND}"
echo "Backend path:  ${BACKEND}"
echo "Next: run deploy from your machine, then: sudo systemctl start thesibook-frontend"
