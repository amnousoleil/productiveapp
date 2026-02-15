# 🔄 ROLLBACK PROCEDURE - Retour Arrière

**Utiliser ce guide si les fixes ont cassé l'application**

---

## 🎯 ROLLBACK RAPIDE (5 minutes)

### Option A: Restaurer uniquement les fichiers modifiés

```bash
# 1. Aller dans le dossier des backups
cd /var/www/productiveapp/backups/FIXES-20260215-preventifs-crash-login/fichiers-originaux

# 2. Restaurer les fichiers
cp index.ts.backup /root/productive-core-backend/src/index.ts
cp ecosystem.config.js.backup /root/productive-core-backend/ecosystem.config.js

# 3. Rebuild backend
cd /root/productive-core-backend
npm run build

# 4. Restart PM2
pm2 restart productive-core

# 5. Vérifier
pm2 status
curl http://localhost:8080
```

**Temps estimé**: 2-3 minutes

---

### Option B: Rollback SQL (colonne resolved)

**Si seule la colonne SQL pose problème:**

```bash
psql -U productive_user -d productive_app << 'EOF'
-- Supprimer la colonne resolved
ALTER TABLE frontend_errors DROP COLUMN IF EXISTS resolved;

-- Vérifier
\d frontend_errors
EOF
```

**Puis redémarrer backend:**
```bash
cd /root/productive-core-backend
pm2 restart productive-core
```

**Temps estimé**: 1 minute

---

### Option C: Rollback complet via backup tar.gz

**Si les options A et B ne marchent pas:**

```bash
# 1. Extraire le backup complet d'avant les fixes
cd /var/www/productiveapp/backups
tar -xzf wip-20260215-015928-avant-analyse-crash-login.tar.gz -C /tmp/restore-temp

# 2. Copier les fichiers importants
cp /tmp/restore-temp/index.html /var/www/productiveapp/
cp /tmp/restore-temp/js/fast-loader.js /var/www/productiveapp/js/
# ... autres fichiers si nécessaire

# 3. Backend
cd /var/www/productiveapp/backups
tar -xzf wip-20260215-015953-backend-avant-crash.tar.gz -C /root/productive-core-backend

# 4. Rebuild + Restart
cd /root/productive-core-backend
npm run build
pm2 restart productive-core

# 5. Reload Nginx
systemctl reload nginx
```

**Temps estimé**: 5 minutes

---

## 🆘 ROLLBACK D'URGENCE - App Complètement Morte

**Si RIEN ne marche, restaurer le backup stable du 15 février:**

```bash
# DANGER: Écrase TOUT avec la version du 15 février qui marchait

# 1. Frontend
cd /var/www/productiveapp/backups
rm -rf /var/www/productiveapp.OLD 2>/dev/null
mv /var/www/productiveapp /var/www/productiveapp.OLD
cp -r STABLE-20260215-app-complete-working /var/www/productiveapp

# 2. Backend (si besoin)
cd /root/productive-core-backend
git status  # Vérifier qu'on est sur un commit clean
git reset --hard HEAD  # Annule modifications non commitées

# 3. Restart tout
systemctl reload nginx
pm2 restart productive-core

# 4. Test
curl http://localhost:8080
curl http://localhost:3000/api/v1/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"contact@mahagiri.fr","password":"444@"}'
```

**Temps estimé**: 3 minutes

---

## 📋 CHECKLIST POST-ROLLBACK

Après avoir fait un rollback, vérifier:

- [ ] `pm2 status productive-core` → 4 workers online
- [ ] `curl http://localhost:8080` → HTTP 200
- [ ] Login sur https://giri-app.com fonctionne
- [ ] Pas d'erreur dans `pm2 logs productive-core --lines 20`
- [ ] PostgreSQL accessible: `psql -U productive_user -d productive_app -c "SELECT 1;"`

---

## 🔍 VÉRIFIER QUEL FIX A CASSÉ

**Pour savoir QUEL fix a causé le problème:**

### Test Fix 1 (Colonne resolved)
```bash
psql -U productive_user -d productive_app -c "\d frontend_errors" | grep resolved
# Si "resolved" apparaît → Fix 1 appliqué
# Pour tester si ça marche:
curl -X POST http://localhost:3000/api/v1/monitoring/errors/log \
  -H "Content-Type: application/json" \
  -d '{"message":"test","stack":"test","url":"test"}'
# Doit retourner 200, pas 500
```

### Test Fix 2 (Route /health)
```bash
curl http://localhost:3000/health
# Si {"status":"ok",...} → Fix 2 appliqué et OK
# Si 404 → Fix 2 pas appliqué ou rollbacké
```

### Test Fix 3 (PM2 wait_ready)
```bash
grep "wait_ready" /root/productive-core-backend/ecosystem.config.js
# Si commenté (// wait_ready) → Fix 3 appliqué
# Si actif → Fix 3 pas appliqué
# Pour tester: pm2 restart productive-core (devrait redémarrer sans EADDRINUSE)
```

---

## 📞 COMMANDES DE RESTAURATION GRANULAIRE

**Rollback Fix 1 uniquement:**
```sql
ALTER TABLE frontend_errors DROP COLUMN IF EXISTS resolved;
```

**Rollback Fix 2 uniquement:**
```bash
# Éditer /root/productive-core-backend/src/index.ts
# Supprimer les lignes ~115-117 (route /health)
cd /root/productive-core-backend
npm run build
pm2 restart productive-core
```

**Rollback Fix 3 uniquement:**
```bash
# Éditer /root/productive-core-backend/ecosystem.config.js
# Dé-commenter ligne 47: wait_ready: true,
pm2 restart productive-core
```

---

## ⚠️ IMPORTANT APRÈS ROLLBACK

1. **Documenter** ce qui n'a pas marché dans `TESTS-RESULTATS.md`
2. **NE PAS ré-appliquer** le même fix sans comprendre pourquoi il a échoué
3. **Consulter** `DEBUG-PISTES.md` pour analyse approfondie

---

**Dernière mise à jour**: 2026-02-15 02:00 UTC
