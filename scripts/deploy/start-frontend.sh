#!/usr/bin/env bash
# Run ON SERVER (or: ssh ... 'bash -s' < scripts/deploy/start-frontend.sh)
set -euo pipefail

FRONTEND="${FRONTEND_DIR:-/usr/home/thesiu/thesibook-booking-shine/frontend}"
LOG="${FRONTEND_LOG:-${FRONTEND}/frontend.log}"
PID_FILE="${FRONTEND_PID:-${FRONTEND}/frontend.pid}"

cd "${FRONTEND}"
if [[ ! -f server.js ]]; then
  echo "ERROR: ${FRONTEND}/server.js missing — run deploy first." >&2
  exit 1
fi

if [[ -f "${PID_FILE}" ]] && kill -0 "$(cat "${PID_FILE}")" 2>/dev/null; then
  echo "Stopping existing process $(cat "${PID_FILE}")..."
  kill "$(cat "${PID_FILE}")" 2>/dev/null || true
  sleep 1
fi

set -a
# shellcheck disable=SC1091
[[ -f .env.production ]] && source .env.production
set +a

: "${PORT:=3005}"
: "${HOSTNAME:=127.0.0.1}"

nohup /usr/bin/node server.js >>"${LOG}" 2>&1 &
echo $! >"${PID_FILE}"
sleep 2

if curl -fsS "http://${HOSTNAME}:${PORT}/" >/dev/null 2>&1; then
  echo "Next.js running on http://${HOSTNAME}:${PORT}/ (pid $(cat "${PID_FILE}"))"
else
  echo "WARN: process started but HTTP check failed — see ${LOG}" >&2
  tail -20 "${LOG}" >&2 || true
  exit 1
fi
