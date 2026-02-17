#!/bin/bash
BACKUP_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "=== Restauration STABLE-20260217-0400 ==="
cp -r "$BACKUP_DIR/js" /var/www/productiveapp/
cp -r "$BACKUP_DIR/css" /var/www/productiveapp/
cp "$BACKUP_DIR/index.html" /var/www/productiveapp/
cp -r "$BACKUP_DIR/backend/src" /root/productive-core-backend/
cp -r "$BACKUP_DIR/backend/migrations" /root/productive-core-backend/
systemctl reload nginx
cd /root/productive-core-backend && npm run build && pm2 restart productive-core
echo "=== Restauration terminée ==="
