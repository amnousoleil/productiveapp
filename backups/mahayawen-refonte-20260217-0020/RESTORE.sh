#!/bin/bash
# RESTORE MAHAYAWEN - Restauration complète
echo "⚠️  RESTAURATION DE MAHAYAWEN"
echo "Date du backup: $(basename $(dirname $0))"
read -p "Confirmer la restauration? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then echo "❌ Annulé"; exit 1; fi
BACKUP_DIR="$(dirname "$0")"
TARGET="/var/www/productiveapp/js/modules/ai"
echo "🔄 Suppression AI actuel..." && rm -rf "$TARGET"
echo "📦 Restauration..." && cp -r "$BACKUP_DIR/ai" "$TARGET"
echo "✅ Terminé! Rechargez l'app (Ctrl+Shift+R)"
