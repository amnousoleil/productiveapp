#!/bin/bash

# ========================================
# RESTORE BASE DE DONNÉES SEULEMENT
# Mail Pro V2
# ========================================

BACKUP_DIR="/var/www/productiveapp/backups/mailpro-v2-20260217-0019"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║      RESTAURATION DATABASE SEULEMENT - Mail Pro V2           ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  ATTENTION : Cette opération va ÉCRASER les données mail"
echo ""
read -p "Continuer? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

echo ""
echo "🗄️  Restauration base de données..."

# Drop + recréer la table
sudo -u postgres psql -d productive_app -c "DROP TABLE IF EXISTS sent_mails CASCADE;"
echo "  ✅ Ancienne table supprimée"

# Restaurer le schéma
if [ -f "${BACKUP_DIR}/database/sent_mails_schema.sql" ]; then
    sudo -u postgres psql -d productive_app -f "${BACKUP_DIR}/database/sent_mails_schema.sql"
    echo "  ✅ Schéma restauré"
fi

# Restaurer les données
if [ -f "${BACKUP_DIR}/database/sent_mails_sample.sql" ]; then
    sudo -u postgres psql -d productive_app -f "${BACKUP_DIR}/database/sent_mails_sample.sql"
    echo "  ✅ Données restaurées"
fi

# Compter
COUNT=$(sudo -u postgres psql -d productive_app -t -c "SELECT COUNT(*) FROM sent_mails" 2>/dev/null | tr -d ' ')
echo ""
echo "✅ RESTAURATION DB TERMINÉE - ${COUNT} emails restaurés"
