╔════════════════════════════════════════════════════════════════╗
║         BACKUP COMPLET PRODUCTIVEAPP - 17/02/2026 11:12       ║
╚════════════════════════════════════════════════════════════════╝

📦 CONTENU DU BACKUP
═══════════════════════════════════════════════════════════════

📁 frontend/        → Code frontend complet (/var/www/productiveapp/)
                      Tous fichiers JS, CSS, HTML, assets
                      (exclu: node_modules, backups, .git)

📁 backend/         → Code backend complet (/root/productive-core-backend/)
                      Tous fichiers TypeScript source
                      (exclu: node_modules, dist, .git)

💾 database.dump    → Export PostgreSQL format custom (pg_dump -F c)
                      Base: productive_app
                      User: productive_user

🔧 RESTAURATION
═══════════════════════════════════════════════════════════════

Frontend:
  rsync -a frontend/ /var/www/productiveapp/
  systemctl reload nginx

Backend:
  rsync -a backend/ /root/productive-core-backend/
  cd /root/productive-core-backend && npm install && npm run build
  pm2 restart productive-core

Database:
  pg_restore -U productive_user -d productive_app -c database.dump

📅 Date création: 16/02/2026
🎯 Version app: v4.0
📝 Créé par: Claude Code
