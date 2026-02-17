#!/bin/bash
# =====================================================
# RESTORE CODE ONLY - Journal Refonte Backup
# Restaure UNIQUEMENT le code (frontend + backend)
# =====================================================

set -e  # Exit on error

BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "📂 Restauration CODE ONLY depuis: $BACKUP_DIR"

# === FRONTEND ===
echo "📂 Restauration frontend..."
cp "$BACKUP_DIR/frontend/js/modules/notes/journal.js" /var/www/productiveapp/js/modules/notes/
cp "$BACKUP_DIR/frontend/js/services/api.service.js" /var/www/productiveapp/js/services/

# === BACKEND ===
echo "📂 Restauration backend..."
rm -rf /root/productive-core-backend/src/modules/journal/*
cp -r "$BACKUP_DIR/backend/modules/journal/"* /root/productive-core-backend/src/modules/journal/

# === REBUILD BACKEND ===
echo "🔨 Rebuild backend TypeScript..."
cd /root/productive-core-backend
npm run build

# === RESTART SERVICES ===
echo "♻️  Redémarrage services..."
pm2 restart productive-core
systemctl reload nginx

echo "✅ Code restauré et services redémarrés !"
echo "⚠️  Vider le cache navigateur (Ctrl+Shift+R) pour voir les changements frontend"
