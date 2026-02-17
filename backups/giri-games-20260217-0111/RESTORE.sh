#!/bin/bash
# Restauration Giri Games - En cas de problème
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="/var/www/productiveapp"

echo "🔄 Restauration en cours..."
cp "$SCRIPT_DIR/index.html.bak" "$ROOT/index.html"
cp "$SCRIPT_DIR/router.js.bak" "$ROOT/js/modules/router.js"
cp "$SCRIPT_DIR/sidebar-core.js.bak" "$ROOT/js/modules/sidebar/sidebar-core.js"
systemctl reload nginx 2>/dev/null || nginx -s reload 2>/dev/null || true
echo "✅ Restauration terminée"
