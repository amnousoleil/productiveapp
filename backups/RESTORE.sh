#!/bin/bash
# ============================================
# SCRIPT DE RESTAURATION GALAXY VIEW
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  RESTAURATION GALAXY VIEW${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo "Quelle version voulez-vous restaurer?"
echo ""
echo "1) Galaxy Canvas v2 (NOUVEAU - Canvas HTML5 + Rough.js)"
echo "2) Galaxy 3D (ANCIEN - THREE.js)"
echo "3) Annuler"
echo ""
read -p "Choix (1-3): " choice

case $choice in
  1)
    echo -e "${YELLOW}Restauration Galaxy Canvas v2...${NC}"

    # Backup current state first
    timestamp=$(date +%Y%m%d-%H%M%S)
    mkdir -p /var/www/productiveapp/backups/pre-restore-${timestamp}
    cp /var/www/productiveapp/index.html /var/www/productiveapp/backups/pre-restore-${timestamp}/
    cp /var/www/productiveapp/js/galaxy-canvas-v2.js /var/www/productiveapp/backups/pre-restore-${timestamp}/ 2>/dev/null
    cp /var/www/productiveapp/js/galaxy-constellation.js /var/www/productiveapp/backups/pre-restore-${timestamp}/ 2>/dev/null

    echo "Backup de l'état actuel créé dans: backups/pre-restore-${timestamp}/"

    # Restore Galaxy Canvas v2
    cp /var/www/productiveapp/backups/2026-02-12-galaxy-canvas-v2-working/index.html.bak /var/www/productiveapp/index.html
    cp /var/www/productiveapp/backups/2026-02-12-galaxy-canvas-v2-working/galaxy-canvas-v2.js /var/www/productiveapp/js/
    cp /var/www/productiveapp/backups/2026-02-12-galaxy-canvas-v2-working/galaxy-constellation.js /var/www/productiveapp/js/
    cp /var/www/productiveapp/backups/2026-02-12-galaxy-canvas-v2-working/galaxie-view.js /var/www/productiveapp/js/modules/canvases/

    echo -e "${GREEN}✅ Galaxy Canvas v2 restauré!${NC}"
    echo ""
    echo "Console doit afficher:"
    echo "  ✅ NOUVEAU FICHIER galaxy-canvas-v2.js loaded"
    echo "  📦 galaxy-constellation.js loaded"
    echo ""
    echo "Scripts chargés:"
    echo "  - js/galaxy-canvas-v2.js"
    echo "  - js/galaxy-constellation.js"
    ;;

  2)
    echo -e "${YELLOW}Restauration Galaxy 3D (THREE.js)...${NC}"
    echo -e "${RED}⚠️  ATTENTION: Cette version avait des problèmes de cache!${NC}"
    read -p "Êtes-vous sûr? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
      echo "Annulé."
      exit 0
    fi

    # Backup current state first
    timestamp=$(date +%Y%m%d-%H%M%S)
    mkdir -p /var/www/productiveapp/backups/pre-restore-${timestamp}
    cp /var/www/productiveapp/index.html /var/www/productiveapp/backups/pre-restore-${timestamp}/

    echo "Backup de l'état actuel créé dans: backups/pre-restore-${timestamp}/"

    # Restore old files
    cp /var/www/productiveapp/backups/OLD-galaxy-3d-before-migration/galaxy-3d.js /var/www/productiveapp/js/modules/canvases/
    cp /var/www/productiveapp/backups/OLD-galaxy-3d-before-migration/galaxy-ai.js /var/www/productiveapp/js/modules/canvases/

    echo -e "${YELLOW}Fichiers galaxy-3d.js et galaxy-ai.js restaurés${NC}"
    echo -e "${RED}⚠️  Vous devez MANUELLEMENT décommenter dans index.html:${NC}"
    echo ""
    echo "  <script src=\"js/modules/canvases/galaxy-3d.js?v=1700\"></script>"
    echo "  <script src=\"js/modules/canvases/galaxy-ai.js?v=1700\"></script>"
    echo ""
    echo "Et commenter:"
    echo "  <!-- <script src=\"js/galaxy-canvas-v2.js\"></script> -->"
    echo "  <!-- <script src=\"js/galaxy-constellation.js\"></script> -->"
    ;;

  3)
    echo "Annulé."
    exit 0
    ;;

  *)
    echo -e "${RED}Choix invalide.${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}Restauration terminée!${NC}"
echo ""
echo "Prochaines étapes:"
echo "1. Recharger le serveur web: sudo systemctl reload nginx"
echo "2. Vider cache navigateur: Ctrl+Shift+R"
echo "3. Vérifier console: F12 → Console"
echo ""
echo "En cas de problème, les backups sont dans:"
echo "  /var/www/productiveapp/backups/"
