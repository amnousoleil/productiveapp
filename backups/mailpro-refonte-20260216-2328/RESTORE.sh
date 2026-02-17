#!/bin/bash

# Script de restauration du backup MailPro
# Créé le: 2026-02-16 23:28
# Utilisation: bash RESTORE.sh

BACKUP_DIR="/var/www/productiveapp/backups/mailpro-refonte-20260216-2328"
TARGET_MAIL_JS="/var/www/productiveapp/js/modules/mail"
TARGET_CSS="/var/www/productiveapp/css"

echo "🔄 Restauration du backup MailPro..."
echo "Source: ${BACKUP_DIR}"
echo ""

# Vérification que le backup existe
if [ ! -d "${BACKUP_DIR}" ]; then
    echo "❌ ERREUR: Le dossier de backup n'existe pas!"
    exit 1
fi

# Restauration des fichiers JS
echo "📦 Restauration des fichiers JS..."
cp -v "${BACKUP_DIR}/mail/"*.js "${TARGET_MAIL_JS}/"

# Restauration des fichiers CSS
echo "🎨 Restauration des fichiers CSS..."
cp -v "${BACKUP_DIR}/css/mail.css" "${TARGET_CSS}/"
cp -v "${BACKUP_DIR}/css/mail-premium-v7.css" "${TARGET_CSS}/"

# Restauration de index.html (revenir à l'état avant refonte)
if [ -f "${BACKUP_DIR}/index.html.before" ]; then
  echo "📄 Restauration de index.html..."
  cp -v "${BACKUP_DIR}/index.html.before" "/var/www/productiveapp/index.html"
fi

echo ""
echo "✅ Restauration terminée avec succès!"
echo ""
echo "Fichiers restaurés:"
echo "  - 9 fichiers JS dans ${TARGET_MAIL_JS}/"
echo "  - 2 fichiers CSS dans ${TARGET_CSS}/"
echo "  - index.html restauré à l'état pré-refonte"
echo ""
echo "⚠️  N'oubliez pas de recharger Nginx si nécessaire:"
echo "    systemctl reload nginx"
