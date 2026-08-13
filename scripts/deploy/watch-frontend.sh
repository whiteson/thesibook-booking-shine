#!/usr/bin/env bash
# Health-check Next.js and restart if the proxy target is down.
set -euo pipefail

PORT="${PORT:-3005}"
HOST="${HOSTNAME:-127.0.0.1}"
FRONTEND="${FRONTEND_DIR:-/usr/home/thesiu/thesibook-booking-shine/frontend}"
PID_FILE="${FRONTEND}/frontend.pid"
START_SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/start-frontend.sh"

if curl -fsS --max-time 3 "http://${HOST}:${PORT}/" >/dev/null 2>&1; then
  exit 0
fi

if [[ -f "${PID_FILE}" ]] && kill -0 "$(cat "${PID_FILE}")" 2>/dev/null; then
  kill "$(cat "${PID_FILE}")" 2>/dev/null || true
  sleep 1
fi

PORT="${PORT}" bash "${START_SCRIPT}" >>"${FRONTEND}/watchdog.log" 2>&1
