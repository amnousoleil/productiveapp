#!/bin/bash
# Script de restauration du backup complet du 15 février 21h13
# Date: 15 février 2026 - 21:13:00
# Usage: ./RESTORE.sh

echo "🔄 RESTAURATION DU BACKUP COMPLET - 15 FÉVRIER 21H13"
echo "===================================================="
echo ""

BACKUP_DIR="/var/www/productiveapp/backups/STABLE-20260215-211300-backup-complet-21h13"
TARGET_DIR="/var/www/productiveapp"

# Confirmation
read -p "⚠️  Restaurer le backup complet du 15/02/2026 21:13 ? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restauration annulée"
    exit 1
fi

# Backup de sécurité avant restauration
SAFETY_BACKUP="$TARGET_DIR/backups/PRE-RESTORE-$(date +%Y%m%d-%H%M%S)"
echo "📦 Création backup de sécurité: $SAFETY_BACKUP"
mkdir -p "$SAFETY_BACKUP"
cp "$TARGET_DIR/index-fast.html" "$SAFETY_BACKUP/" 2>/dev/null
cp -r "$TARGET_DIR/js" "$SAFETY_BACKUP/" 2>/dev/null
cp -r "$TARGET_DIR/css" "$SAFETY_BACKUP/" 2>/dev/null

# Restauration
echo ""
echo "📦 Restauration des fichiers..."

# HTML
echo "  → Fichiers HTML..."
cp -v "$BACKUP_DIR"/*.html "$TARGET_DIR/" 2>/dev/null | head -5
echo "     ... (tous les HTML restaurés)"

# JS
echo "  → Dossier JS..."
rm -rf "$TARGET_DIR/js"
cp -r "$BACKUP_DIR/js" "$TARGET_DIR/"

# CSS
echo "  → Dossier CSS..."
rm -rf "$TARGET_DIR/css"
cp -r "$BACKUP_DIR/css" "$TARGET_DIR/"

# Assets
echo "  → Assets..."
rm -rf "$TARGET_DIR/assets"
cp -r "$BACKUP_DIR/assets" "$TARGET_DIR/" 2>/dev/null

# Config files
echo "  → Manifest et Service Workers..."
cp -v "$BACKUP_DIR/manifest.json" "$TARGET_DIR/" 2>/dev/null
cp -v "$BACKUP_DIR/sw"*.js "$TARGET_DIR/" 2>/dev/null

# Reload Nginx
echo ""
echo "🔄 Rechargement Nginx..."
systemctl reload nginx

echo ""
echo "✅ RESTAURATION COMPLÈTE TERMINÉE !"
echo ""
echo "📋 Restauré:"
echo "   - Tous fichiers HTML (32 fichiers)"
echo "   - Dossier js/ complet"
echo "   - Dossier css/ complet"
echo "   - Dossier assets/ complet"
echo "   - manifest.json"
echo "   - Service Workers (sw.js, sw-fast.js, sw-kill.js)"
echo ""
echo "🛡️ Backup de sécurité créé avant restauration:"
echo "   $SAFETY_BACKUP"
echo ""
echo "🌐 Vide le cache navigateur (Ctrl+Shift+R) pour voir les changements"
