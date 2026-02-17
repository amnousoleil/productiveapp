#!/bin/bash
# RESTORE.sh - Restauration complète du système animations/thèmes
# Créé le: 2026-02-17 00:43:57
# Backup de: 15 fichiers CSS + JS

set -e

BACKUP_DIR="/var/www/productiveapp/backups/themes-animations-20260217-004357"
TARGET_DIR="/var/www/productiveapp"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ RESTAURATION SYSTÈME ANIMATIONS & THÈMES                       ║"
echo "║ Backup du: 2026-02-17 00:43:57                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  Cette opération va ÉCRASER les fichiers actuels !"
echo ""
read -p "Voulez-vous continuer ? (oui/non) : " CONFIRM

if [ "$CONFIRM" != "oui" ]; then
    echo "❌ Restauration annulée."
    exit 1
fi

echo ""
echo "🔄 Restauration en cours..."
echo ""

# CSS (6 fichiers)
echo "📄 CSS..."
cp -v "$BACKUP_DIR/css/"*.css "$TARGET_DIR/css/"

# JS root (2 fichiers)
echo "📄 JS root..."
cp -v "$BACKUP_DIR/js/animations.js" "$TARGET_DIR/js/"
cp -v "$BACKUP_DIR/js/animations-lite.js" "$TARGET_DIR/js/"

# JS modules (5 fichiers)
echo "📄 JS modules..."
cp -v "$BACKUP_DIR/js/modules/"*.js "$TARGET_DIR/js/modules/"

# JS messaging
echo "📄 JS messaging..."
cp -v "$BACKUP_DIR/js/modules/messaging/messaging-animations.js" "$TARGET_DIR/js/modules/messaging/"

# JS reports
echo "📄 JS reports..."
cp -v "$BACKUP_DIR/js/modules/reports/reports-animations.js" "$TARGET_DIR/js/modules/reports/"

echo ""
echo "✅ Restauration terminée avec succès !"
echo ""
echo "ℹ️  N'oubliez pas de :"
echo "   1. Recharger Nginx si nécessaire : systemctl reload nginx"
echo "   2. Vider le cache navigateur : Ctrl+Shift+R"
echo "   3. Incrémenter les cache busters dans index.html"
echo ""
