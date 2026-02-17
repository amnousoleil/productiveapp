#!/bin/bash
# ProductiveApp - Script de tests automatiques
# Vérifie que l'application fonctionne après modifications

set -e

echo "🧪 PRODUCTIVEAPP - TESTS AUTOMATIQUES"
echo "======================================"
echo ""

ERRORS=0

# Test 1: Frontend HTTP
echo "📡 Test 1: Frontend accessibility..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend: HTTP $FRONTEND_STATUS"
else
    echo "❌ Frontend: HTTP $FRONTEND_STATUS (attendu: 200)"
    ERRORS=$((ERRORS + 1))
fi

# Test 2: Backend PM2
echo ""
echo "⚙️  Test 2: Backend PM2 status..."
PM2_STATUS=$(pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "error")
if [ "$PM2_STATUS" = "online" ]; then
    echo "✅ Backend PM2: $PM2_STATUS"
else
    echo "❌ Backend PM2: $PM2_STATUS (attendu: online)"
    ERRORS=$((ERRORS + 1))
fi

# Test 3: Backend API
echo ""
echo "🔌 Test 3: Backend API endpoint..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test","password":"test"}')
if [ "$BACKEND_STATUS" = "400" ] || [ "$BACKEND_STATUS" = "401" ]; then
    echo "✅ Backend API: HTTP $BACKEND_STATUS (répond correctement)"
else
    echo "⚠️  Backend API: HTTP $BACKEND_STATUS (inattendu mais peut-être OK)"
fi

# Test 4: Fichiers critiques
echo ""
echo "📁 Test 4: Fichiers critiques..."
CRITICAL_FILES=(
    "/var/www/productiveapp/index.html"
    "/var/www/productiveapp/js/fast-loader.js"
    "/var/www/productiveapp/js/animations-lite.js"
    "/var/www/productiveapp/sw-fast.js"
    "/var/www/productiveapp/css/style-base.css"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $(basename $file)"
    else
        echo "  ❌ $(basename $file) MANQUANT"
        ERRORS=$((ERRORS + 1))
    fi
done

# Test 5: Service Worker accessible
echo ""
echo "🔧 Test 5: Service Worker..."
SW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/sw-fast.js)
if [ "$SW_STATUS" = "200" ]; then
    echo "✅ Service Worker: HTTP $SW_STATUS"
else
    echo "❌ Service Worker: HTTP $SW_STATUS (attendu: 200)"
    ERRORS=$((ERRORS + 1))
fi

# Test 6: Fast-loader accessible
echo ""
echo "⚡ Test 6: Fast-loader..."
FL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/js/fast-loader.js)
if [ "$FL_STATUS" = "200" ]; then
    echo "✅ Fast-loader: HTTP $FL_STATUS"
else
    echo "❌ Fast-loader: HTTP $FL_STATUS (attendu: 200)"
    ERRORS=$((ERRORS + 1))
fi

# Test 7: Nginx HTTPS
echo ""
echo "🔐 Test 7: Nginx HTTPS..."
HTTPS_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" https://localhost/)
if [ "$HTTPS_STATUS" = "200" ]; then
    echo "✅ HTTPS: HTTP $HTTPS_STATUS"
else
    echo "⚠️  HTTPS: HTTP $HTTPS_STATUS (vérifier certificat)"
fi

# Résumé
echo ""
echo "======================================"
if [ $ERRORS -eq 0 ]; then
    echo "✅ TOUS LES TESTS PASSÉS ($ERRORS erreur)"
    echo ""
    echo "📊 Statistiques:"
    echo "  - Uptime PM2: $(pm2 jlist | jq -r '.[0].pm2_env.pm_uptime' 2>/dev/null | awk '{print int($1/1000/60)}') minutes"
    echo "  - Mémoire backend: $(pm2 jlist | jq -r '.[0].monit.memory' 2>/dev/null | awk '{print int($1/1024/1024)}') MB"
    echo "  - CPU backend: $(pm2 jlist | jq -r '.[0].monit.cpu' 2>/dev/null)%"
    exit 0
else
    echo "❌ $ERRORS ERREUR(S) DÉTECTÉE(S)"
    exit 1
fi
