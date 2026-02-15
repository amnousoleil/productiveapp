#!/bin/bash
# =============================================
# SCRIPT DE RESTAURATION MAHAYAWEN ULTRA AGENT
# Backup créé le : 15 février 2026 - 02:05 UTC
# =============================================

echo "🛡️ RESTAURATION MAHAYAWEN ULTRA AGENT"
echo ""
echo "Ce script va restaurer TOUS les fichiers Mahayawen Ultra Agent."
echo ""
read -p "Continuer ? (oui/non) : " confirm

if [ "$confirm" != "oui" ]; then
    echo "❌ Restauration annulée"
    exit 1
fi

echo ""
echo "📂 Copie des fichiers..."

# Aller au dossier parent
cd "$(dirname "$0")/../.."

# Restaurer index-fast.html
cp -v backups/STABLE-20260215-020518-mahayawen-ultra-agent-COMPLET/index-fast.html .

# Restaurer chatbot.js
cp -v backups/STABLE-20260215-020518-mahayawen-ultra-agent-COMPLET/js/modules/ai/chatbot.js js/modules/ai/

# Restaurer les 5 modules Mahayawen
cp -v backups/STABLE-20260215-020518-mahayawen-ultra-agent-COMPLET/js/modules/ai/mahayawen-*.js js/modules/ai/

# Restaurer CSS
cp -v backups/STABLE-20260215-020518-mahayawen-ultra-agent-COMPLET/css/mahayawen-voice.css css/

echo ""
echo "🔄 Rechargement Nginx..."
systemctl reload nginx

echo ""
echo "✅ RESTAURATION TERMINÉE !"
echo ""
echo "📋 Fichiers restaurés :"
echo "  - index-fast.html"
echo "  - js/modules/ai/chatbot.js"
echo "  - js/modules/ai/mahayawen-action-registry.js"
echo "  - js/modules/ai/mahayawen-context.js"
echo "  - js/modules/ai/mahayawen-intent-parser.js"
echo "  - js/modules/ai/mahayawen-agent.js"
echo "  - js/modules/ai/mahayawen-voice.js"
echo "  - css/mahayawen-voice.css"
echo ""
echo "🎤 Mahayawen Ultra Agent restauré !"
echo "💡 Vide le cache navigateur : Ctrl+Shift+R"
echo ""
