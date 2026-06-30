#!/usr/bin/env bash
# Start local ThesiBook stack (EA + hints for Next.js)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Control plane"
"${ROOT}/scripts/setup-control-plane.sh" 2>/dev/null || true

echo ""
echo "Terminal 1 — Easy!Appointments:"
echo "  ${ROOT}/scripts/install-book.sh --serve"
echo ""
echo "Terminal 2 — Next.js (already on 3010?):"
echo "  cd ${ROOT}/frontend && npm run dev"
echo ""
echo "Open:"
echo "  Marketing: http://localhost:3010"
echo "  Register:  http://localhost:3010/register"
echo "  Dashboard: http://localhost:3010/dashboard"
