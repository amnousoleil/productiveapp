#!/bin/bash
# Installation Sidebar v5.0
# Exécuter depuis /var/www/productiveapp/

echo "🚀 Installation Sidebar v5.0..."

# 1. Backup des anciens fichiers
echo "📦 Backup des anciens fichiers..."
mkdir -p _backup_sidebar
cp css/style-sidebar.css _backup_sidebar/ 2>/dev/null
cp css/sidebar.css _backup_sidebar/ 2>/dev/null
cp css/sidebar-nav.css _backup_sidebar/ 2>/dev/null
cp js/modules/sidebar/*.js _backup_sidebar/ 2>/dev/null

# 2. Copier le nouveau CSS
echo "🎨 Installation du CSS..."
cp _sidebar-v5/style-sidebar.css css/style-sidebar.css

# 3. Vider les anciens fichiers CSS
echo "🧹 Nettoyage anciens CSS..."
echo "/* Deprecated - see style-sidebar.css */" > css/sidebar.css
echo "/* Deprecated - see style-sidebar.css */" > css/sidebar-nav.css

# 4. Copier les nouveaux JS
echo "⚡ Installation du JavaScript..."
cp _sidebar-v5/sidebar-core.js js/modules/sidebar/
cp _sidebar-v5/sidebar-render.js js/modules/sidebar/
cp _sidebar-v5/sidebar-events.js js/modules/sidebar/
cp _sidebar-v5/sidebar-init.js js/modules/sidebar/

# 5. Mettre à jour les versions dans index.html
echo "📝 Mise à jour des versions..."
sed -i 's/style-sidebar.css?v=[0-9]*/style-sidebar.css?v=50/g' index.html
sed -i 's/sidebar.css?v=[0-9]*/sidebar.css?v=50/g' index.html
sed -i 's/sidebar-nav.css?v=[0-9]*/sidebar-nav.css?v=50/g' index.html

echo "✅ Installation terminée!"
echo ""
echo "⚠️  N'oublie pas de:"
echo "   1. Vider le cache navigateur (Ctrl+Shift+R)"
echo "   2. Vérifier style-overrides.css (supprimer anciennes règles sidebar)"
echo ""
