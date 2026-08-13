#!/usr/bin/env bash
# Publish Easy!Appointments to public_html/book for book.thesibook.gr (Apache + PHP).
set -euo pipefail

BOOK_WEB="${1:-/usr/home/thesiu/public_html/book}"
BOOK_SOURCE="${2:-/usr/home/thesiu/thesibook-booking-shine/book}"

if [[ ! -d "${BOOK_SOURCE}" ]]; then
  echo "ERROR: book source missing at ${BOOK_SOURCE}" >&2
  exit 1
fi

mkdir -p "${BOOK_WEB}"
mkdir -p "${BOOK_WEB}/tenants"

# Block HTTP access to tenant credentials
cat >"${BOOK_WEB}/tenants/.htaccess" <<'EOF'
<IfModule mod_authz_core.c>
Require all denied
</IfModule>
<IfModule !mod_authz_core.c>
Deny from all
</IfModule>
EOF

# CodeIgniter front controller (index.php in URLs — no mod_rewrite required)
cat >"${BOOK_WEB}/.htaccess" <<'EOF'
DirectoryIndex index.php
<IfModule mod_authz_core.c>
  <FilesMatch "^(config\.php|composer\.(json|lock))$">
    Require all denied
  </FilesMatch>
</IfModule>
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.php [L]
</IfModule>
EOF

chmod -R u+w "${BOOK_SOURCE}/storage" 2>/dev/null || true
chmod -R u+w "${BOOK_WEB}/storage" 2>/dev/null || true

# Default tenant for bare /book/ URLs (no ?thesibook_tenant= in query)
if [[ -d "${BOOK_WEB}/tenants/webcode" ]]; then
  echo -n 'webcode' >"${BOOK_WEB}/tenants/default"
fi

echo "Book web root ready at ${BOOK_WEB} (source ${BOOK_SOURCE})"
