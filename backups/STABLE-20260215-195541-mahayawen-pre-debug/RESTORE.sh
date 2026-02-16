#!/bin/bash
# Script de restauration du backup Mahayawen Pre-Debug
# Date: 15 février 2026 - 19:55 UTC
# Usage: ./RESTORE.sh

echo "🔄 RESTAURATION DU BACKUP MAHAYAWEN PRE-DEBUG"
echo "=============================================="
echo ""

BACKUP_DIR="/var/www/productiveapp/backups/STABLE-20260215-195541-mahayawen-pre-debug"
TARGET_DIR="/var/www/productiveapp"

# Confirmation
read -p "⚠️  Restaurer le backup du 15/02/2026 19:55 UTC ? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restauration annulée"
    exit 1
fi

# Restauration
echo "📦 Restauration des fichiers..."

cp -v "$BACKUP_DIR/index-fast.html" "$TARGET_DIR/"
cp -v "$BACKUP_DIR/fast-loader.js" "$TARGET_DIR/js/"
cp -v "$BACKUP_DIR/js/modules/ai/chatbot.js" "$TARGET_DIR/js/modules/ai/"
cp -v "$BACKUP_DIR/js/modules/ai/mahayawen-"*.js "$TARGET_DIR/js/modules/ai/"
cp -v "$BACKUP_DIR/css/mahayawen-voice.css" "$TARGET_DIR/css/"

# Reload Nginx
echo ""
echo "🔄 Rechargement Nginx..."
systemctl reload nginx

echo ""
echo "✅ RESTAURATION TERMINÉE !"
echo ""
echo "📋 Fichiers restaurés:"
echo "   - index-fast.html (fast-loader v=6600)"
echo "   - js/fast-loader.js (avec auto-init Chatbot)"
echo "   - js/modules/ai/chatbot.js (avec Mahayawen)"
echo "   - 5 modules Mahayawen (agent, voice, context, parser, registry)"
echo "   - css/mahayawen-voice.css"
echo ""
echo "🌐 Vide le cache navigateur (Ctrl+Shift+R) pour voir les changements"
