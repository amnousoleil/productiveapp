#!/bin/bash

# Script de test rapide MailPro v8.0 ZEN
# Usage: bash TEST_RAPIDE.sh

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║        MailPro v8.0 ZEN - Tests de Validation Rapides       ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Fichiers présents
echo "📦 Test 1: Nouveaux fichiers"
FILES=(
  "js/modules/mail/mail-utils.js"
  "js/modules/mail/mail-header.js"
  "js/modules/mail/mail-tabs.js"
  "js/modules/mail/mail-detail.js"
  "js/modules/mail/mail-sent-list.js"
  "js/modules/mail/mail-main.js"
  "css/mail-zen.css"
)

for file in "${FILES[@]}"; do
  if [ -f "/var/www/productiveapp/$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file MANQUANT"
  fi
done
echo ""

# Test 2: Syntaxe JS
echo "📝 Test 2: Syntaxe JavaScript"
for file in mail-utils mail-header mail-tabs mail-detail mail-sent-list mail-main; do
  if node -c "/var/www/productiveapp/js/modules/mail/${file}.js" 2>&1 | grep -q "SyntaxError"; then
    echo "  ❌ ${file}.js - Erreur syntaxe"
  else
    echo "  ✅ ${file}.js - Syntaxe valide"
  fi
done
echo ""

# Test 3: HTTP Frontend
echo "🌐 Test 3: HTTP Frontend (localhost:8080)"
HTTP_CSS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/css/mail-zen.css?v=8200)
if [ "$HTTP_CSS" = "200" ]; then
  echo "  ✅ CSS mail-zen.css accessible"
else
  echo "  ❌ CSS mail-zen.css HTTP $HTTP_CSS"
fi

HTTP_JS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/js/modules/mail/mail-main.js?v=100)
if [ "$HTTP_JS" = "200" ]; then
  echo "  ✅ JS mail-main.js accessible"
else
  echo "  ❌ JS mail-main.js HTTP $HTTP_JS"
fi

HTTP_INDEX=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/)
if [ "$HTTP_INDEX" = "200" ]; then
  echo "  ✅ index.html accessible"
else
  echo "  ❌ index.html HTTP $HTTP_INDEX"
fi
echo ""

# Test 4: Backend
echo "🖥️  Test 4: Backend PM2"
if pm2 list | grep -q "productive-core.*online"; then
  echo "  ✅ Backend PM2 online"
else
  echo "  ❌ Backend PM2 offline ou arrêté"
fi
echo ""

# Test 5: index.html mis à jour
echo "📄 Test 5: index.html mis à jour"
if grep -q "mail-zen.css?v=8200" /var/www/productiveapp/index.html; then
  echo "  ✅ CSS mail-zen chargé dans index.html"
else
  echo "  ❌ CSS mail-zen NON chargé"
fi

if grep -q "Mail Module v8.0 - ZEN REFONTE" /var/www/productiveapp/index.html; then
  echo "  ✅ Commentaire v8.0 présent"
else
  echo "  ❌ Commentaire v8.0 absent"
fi
echo ""

# Test 6: Backup
echo "💾 Test 6: Backup"
BACKUP_DIR="/var/www/productiveapp/backups/mailpro-refonte-20260216-2328"
if [ -f "${BACKUP_DIR}/RESTORE.sh" ]; then
  echo "  ✅ Script RESTORE.sh présent"
  echo "  ✅ $(ls ${BACKUP_DIR}/mail/ | wc -l) fichiers JS sauvegardés"
  echo "  ✅ $(ls ${BACKUP_DIR}/css/ | wc -l) fichiers CSS sauvegardés"
else
  echo "  ❌ Backup incomplet"
fi
echo ""

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                      Tests Terminés                          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Prochaine étape:"
echo "   1. Ouvrir https://giri-app.com"
echo "   2. Ctrl+Shift+R (force reload)"
echo "   3. Login et naviguer vers Mail Pro"
echo ""
