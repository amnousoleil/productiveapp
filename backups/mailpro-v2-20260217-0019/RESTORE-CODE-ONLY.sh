#!/bin/bash

# ========================================
# RESTORE CODE SEULEMENT - Mail Pro V2
# Frontend + Backend (sans toucher à la DB)
# ========================================

BACKUP_DIR="/var/www/productiveapp/backups/mailpro-v2-20260217-0019"
FRONTEND_DIR="/var/www/productiveapp"
BACKEND_DIR="/root/productive-core-backend"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║      RESTAURATION CODE SEULEMENT - Mail Pro V2               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Frontend
echo "📦 Restauration frontend..."
rm -rf "${FRONTEND_DIR}/js/modules/mail"
cp -r "${BACKUP_DIR}/frontend/js/mail" "${FRONTEND_DIR}/js/modules/"
cp "${BACKUP_DIR}/frontend/css/mail"*.css "${FRONTEND_DIR}/css/" 2>/dev/null || true
cp "${BACKUP_DIR}/frontend/index.html" "${FRONTEND_DIR}/"
echo "✅ Frontend restauré"

# Backend
echo ""
echo "🖥️  Restauration backend..."
rm -rf "${BACKEND_DIR}/src/modules/mail"
mkdir -p "${BACKEND_DIR}/src/modules/mail"
cp -r "${BACKUP_DIR}/backend/src/modules/mail/"* "${BACKEND_DIR}/src/modules/mail/"
echo "✅ Backend restauré"

# Services
echo ""
echo "♻️  Redémarrage services..."
cd "${BACKEND_DIR}"
npm run build >/dev/null 2>&1 && echo "✅ Backend compilé"
pm2 restart productive-core >/dev/null 2>&1 && echo "✅ Backend redémarré"
systemctl reload nginx && echo "✅ Nginx rechargé"

echo ""
echo "✅ RESTAURATION CODE TERMINÉE (DB non touchée)"
