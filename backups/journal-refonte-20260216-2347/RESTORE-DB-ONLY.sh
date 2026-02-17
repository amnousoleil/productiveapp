#!/bin/bash
# =====================================================
# RESTORE DATABASE ONLY - Journal Refonte Backup
# Restaure UNIQUEMENT la base de données
# =====================================================

set -e  # Exit on error

BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "🗄️  Restauration DATABASE ONLY depuis: $BACKUP_DIR"

export PGPASSWORD='KJBbME6v_Mxhr3eDDVc24Gbx9uI5i2mvXMOx-LxvJVo'

# Drop et recréer les tables
echo "🗑️  Suppression tables existantes..."
psql -U productive_user -d productive_app -c "DROP TABLE IF EXISTS journal_entries CASCADE;"
psql -U productive_user -d productive_app -c "DROP TABLE IF EXISTS task_activity_log CASCADE;"
psql -U productive_user -d productive_app -c "DROP TABLE IF EXISTS daily_task_summary CASCADE;"

# Restaurer les données
echo "📥 Import données sauvegardées..."
psql -U productive_user -d productive_app < "$BACKUP_DIR/database/journal_entries.sql"
psql -U productive_user -d productive_app < "$BACKUP_DIR/database/task_activity_log.sql"
psql -U productive_user -d productive_app < "$BACKUP_DIR/database/daily_task_summary.sql"

echo "✅ Base de données restaurée !"
