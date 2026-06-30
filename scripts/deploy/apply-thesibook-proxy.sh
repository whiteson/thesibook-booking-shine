#!/usr/bin/env bash
# Add Apache proxy rules for www.thesibook.gr → Node (idempotent marker block).
# Apex thesibook.gr stays on PHP (WordPress CMS under /thesibook-booking-shine/backend/).
set -euo pipefail

HTACCESS="${1:-/usr/home/thesiu/public_html/.htaccess}"
NODE_PORT="${2:-3005}"
MARKER_BEGIN="# BEGIN ThesiBook Next.js proxy"
MARKER_END="# END ThesiBook Next.js proxy"

if [[ ! -f "${HTACCESS}" ]]; then
  echo "ERROR: ${HTACCESS} not found" >&2
  exit 1
fi

# Remove old block if present (e.g. apex+www proxy from earlier deploy)
if grep -q "${MARKER_BEGIN}" "${HTACCESS}"; then
  TMP="$(mktemp)"
  awk -v begin="${MARKER_BEGIN}" -v end="${MARKER_END}" '
    $0 ~ begin { skip=1; next }
    $0 ~ end { skip=0; next }
    !skip { print }
  ' "${HTACCESS}" >"${TMP}"
  mv "${TMP}" "${HTACCESS}"
  echo "Removed existing ThesiBook proxy block from ${HTACCESS}"
fi

BLOCK="${MARKER_BEGIN}
# www.thesibook.gr — Next.js on 127.0.0.1:${NODE_PORT}
# thesibook.gr (apex) — PHP only; CMS at /thesibook-booking-shine/backend/
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{HTTP_HOST} ^www\\.thesibook\\.gr$ [NC]
RewriteRule ^ http://127.0.0.1:${NODE_PORT}%{REQUEST_URI} [P,L,E=PROXY_TO_THESIBOOK:1]
</IfModule>
<IfModule mod_headers.c>
RequestHeader set Host \"www.thesibook.gr\" env=PROXY_TO_THESIBOOK
</IfModule>
${MARKER_END}

"

TMP="$(mktemp)"
printf '%s' "${BLOCK}" >"${TMP}"
cat "${HTACCESS}" >>"${TMP}"
mv "${TMP}" "${HTACCESS}"
chmod 644 "${HTACCESS}"
echo "Prepended ThesiBook www proxy to ${HTACCESS} (port ${NODE_PORT})"
