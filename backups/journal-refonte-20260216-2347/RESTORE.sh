#!/bin/bash
# =====================================================
# RESTORE SCRIPT - Journal Refonte Backup
# Restaure TOUS les fichiers ET la base de données
# =====================================================

set -e  # Exit on error

BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "🔄 Restauration complète depuis: $BACKUP_DIR"

# === FRONTEND ===
echo "📂 Restauration frontend..."
cp "$BACKUP_DIR/frontend/js/modules/notes/journal.js" /var/www/productiveapp/js/modules/notes/
cp "$BACKUP_DIR/frontend/js/services/api.service.js" /var/www/productiveapp/js/services/

# === BACKEND ===
echo "📂 Restauration backend..."
rm -rf /root/productive-core-backend/src/modules/journal/*
cp -r "$BACKUP_DIR/backend/modules/journal/"* /root/productive-core-backend/src/modules/journal/

# === DATABASE ===
echo "🗄️  Restauration base de données..."
export PGPASSWORD='KJBbME6v_Mxhr3eDDVc24Gbx9uI5i2mvXMOx-LxvJVo'

# Drop et recréer les tables
psql -U productive_user -d productive_app -c "DROP TABLE IF EXISTS journal_entries CASCADE;"
psql -U productive_user -d productive_app -c "DROP TABLE IF EXISTS task_activity_log CASCADE;"
psql -U productive_user -d productive_app -c "DROP TABLE IF EXISTS daily_task_summary CASCADE;"

# Restaurer les données
psql -U productive_user -d productive_app < "$BACKUP_DIR/database/journal_entries.sql"
psql -U productive_user -d productive_app < "$BACKUP_DIR/database/task_activity_log.sql"
psql -U productive_user -d productive_app < "$BACKUP_DIR/database/daily_task_summary.sql"

# === REBUILD BACKEND ===
echo "🔨 Rebuild backend TypeScript..."
cd /root/productive-core-backend
npm run build

# === RESTART SERVICES ===
echo "♻️  Redémarrage services..."
pm2 restart productive-core
systemctl reload nginx

echo "✅ Restauration complète terminée !"
echo "⚠️  Vider le cache navigateur (Ctrl+Shift+R) pour voir les changements frontend"
