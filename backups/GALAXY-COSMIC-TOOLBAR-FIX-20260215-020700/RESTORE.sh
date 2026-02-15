#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# GALAXY COSMIC - TOOLBAR FIX - SCRIPT DE RESTAURATION AUTO
# ═══════════════════════════════════════════════════════════════

echo "🔧 RESTAURATION GALAXY COSMIC TOOLBAR FIX..."
echo ""

BACKUP_DIR="/var/www/productiveapp/backups/GALAXY-COSMIC-TOOLBAR-FIX-20260215-020700"
TARGET_DIR="/var/www/productiveapp"

# Vérifier que backup existe
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ ERREUR: Backup introuvable à $BACKUP_DIR"
    exit 1
fi

echo "📁 Source: $BACKUP_DIR"
echo "📁 Destination: $TARGET_DIR"
echo ""

# Confirmer
read -p "⚠️  Restaurer les 7 fichiers modifiés ? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restauration annulée"
    exit 0
fi

echo ""
echo "📋 Restauration en cours..."
echo ""

# Restaurer les fichiers
cp -v "$BACKUP_DIR/galaxy-cosmic-ui.js" "$TARGET_DIR/js/"
cp -v "$BACKUP_DIR/galaxy-cosmic.js" "$TARGET_DIR/js/"
cp -v "$BACKUP_DIR/galaxy-cosmic.css" "$TARGET_DIR/css/"
cp -v "$BACKUP_DIR/style-views.css" "$TARGET_DIR/css/"
cp -v "$BACKUP_DIR/fast-loader.js" "$TARGET_DIR/js/"
cp -v "$BACKUP_DIR/galaxie-view.js" "$TARGET_DIR/js/modules/canvases/"
cp -v "$BACKUP_DIR/index.html" "$TARGET_DIR/"

echo ""
echo "🔄 Rechargement Nginx..."
systemctl reload nginx

echo ""
echo "✅ RESTAURATION TERMINÉE !"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Refresh navigateur (Ctrl+Shift+R)"
echo "   2. Tester Dashboard → Toolbar NE doit PAS apparaître"
echo "   3. Tester Galaxy View → Toolbar apparaît UNIQUEMENT ici"
echo ""
echo "📖 Doc complète: $BACKUP_DIR/RESTORE-GUIDE.md"
echo ""
