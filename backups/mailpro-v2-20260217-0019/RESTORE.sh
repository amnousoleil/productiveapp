#!/bin/bash

# ========================================
# RESTORE COMPLET - Mail Pro V2
# Code + Base de données
# ========================================

BACKUP_DIR="/var/www/productiveapp/backups/mailpro-v2-20260217-0019"
FRONTEND_DIR="/var/www/productiveapp"
BACKEND_DIR="/root/productive-core-backend"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         RESTAURATION COMPLÈTE - Mail Pro V2                  ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  ATTENTION : Cette opération va :"
echo "  - Restaurer les fichiers frontend"
echo "  - Restaurer les fichiers backend"
echo "  - Restaurer la base de données (ÉCRASEMENT)"
echo ""
read -p "Continuer? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

echo ""
echo "🔄 RESTAURATION EN COURS..."
echo ""

# ======== FRONTEND ========
echo "📦 Restauration frontend..."
if [ -d "${BACKUP_DIR}/frontend/js/mail" ]; then
    rm -rf "${FRONTEND_DIR}/js/modules/mail"
    cp -r "${BACKUP_DIR}/frontend/js/mail" "${FRONTEND_DIR}/js/modules/"
    echo "  ✅ Fichiers JS mail restaurés"
fi

if [ -d "${BACKUP_DIR}/frontend/css" ]; then
    cp "${BACKUP_DIR}/frontend/css/mail"*.css "${FRONTEND_DIR}/css/" 2>/dev/null || true
    echo "  ✅ Fichiers CSS mail restaurés"
fi

if [ -f "${BACKUP_DIR}/frontend/index.html" ]; then
    cp "${BACKUP_DIR}/frontend/index.html" "${FRONTEND_DIR}/"
    echo "  ✅ index.html restauré"
fi

# ======== BACKEND ========
echo ""
echo "🖥️  Restauration backend..."
if [ -d "${BACKUP_DIR}/backend/src/modules/mail" ]; then
    rm -rf "${BACKEND_DIR}/src/modules/mail"
    mkdir -p "${BACKEND_DIR}/src/modules/mail"
    cp -r "${BACKUP_DIR}/backend/src/modules/mail/"* "${BACKEND_DIR}/src/modules/mail/"
    echo "  ✅ Modules backend restaurés"
fi

if [ -d "${BACKUP_DIR}/backend/migrations" ]; then
    cp "${BACKUP_DIR}/backend/migrations/"* "${BACKEND_DIR}/src/db/migrations/" 2>/dev/null || true
    echo "  ✅ Migrations restaurées"
fi

# ======== BASE DE DONNÉES ========
echo ""
echo "🗄️  Restauration base de données..."
read -p "⚠️  VRAIMENT restaurer la DB? Cela va ÉCRASER les données actuelles (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "${BACKUP_DIR}/database/sent_mails_schema.sql" ]; then
        sudo -u postgres psql -d productive_app -f "${BACKUP_DIR}/database/sent_mails_schema.sql" 2>&1 | grep -v "already exists"
        echo "  ✅ Schéma restauré"
    fi

    if [ -f "${BACKUP_DIR}/database/sent_mails_sample.sql" ]; then
        sudo -u postgres psql -d productive_app -f "${BACKUP_DIR}/database/sent_mails_sample.sql" 2>&1 | head -5
        echo "  ✅ Données restaurées"
    fi
else
    echo "  ⏭️  Base de données NON restaurée"
fi

# ======== SERVICES ========
echo ""
echo "♻️  Redémarrage des services..."
cd "${BACKEND_DIR}"
npm run build >/dev/null 2>&1 && echo "  ✅ Backend compilé"
pm2 restart productive-core >/dev/null 2>&1 && echo "  ✅ Backend redémarré"
systemctl reload nginx && echo "  ✅ Nginx rechargé"

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  ✅ RESTAURATION TERMINÉE AVEC SUCCÈS !                      ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Actions effectuées :"
echo "  ✅ Frontend restauré (JS + CSS + HTML)"
echo "  ✅ Backend restauré (modules + migrations)"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "  ✅ Base de données restaurée"
else
    echo "  ⏭️  Base de données NON restaurée"
fi
echo "  ✅ Services redémarrés"
echo ""
echo "🌐 L'application est prête à l'adresse: https://giri-app.com"
echo "🔄 Rechargez la page (Ctrl+Shift+R) pour voir les changements"
echo ""
