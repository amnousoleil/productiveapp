# 🔍 DEBUG PISTES - Si Bug Après Les Fixes

**IMPORTANT**: Lire ce fichier EN PREMIER si l'app plante après l'application des fixes.

---

## 🚨 SYMPTÔMES POSSIBLES & PISTES

### Symptôme 1: "L'app ne charge plus du tout"

**Pistes à explorer:**

1. **Backend n'a pas redémarré correctement**
   ```bash
   pm2 status productive-core
   # Si "stopped" ou "errored":
   pm2 logs productive-core --lines 50
   ```
   - Chercher: `SyntaxError`, `Cannot find module`, `EADDRINUSE`
   - **Solution**: Voir ROLLBACK-PROCEDURE.md section "Backend cassé"

2. **Erreur de build TypeScript**
   ```bash
   cd /root/productive-core-backend
   npm run build
   # Regarder les erreurs de compilation
   ```
   - Chercher: Erreurs dans `src/index.ts` ligne ~180-220
   - **Solution**: Restaurer `index.ts.backup`

3. **Port 3000 bloqué**
   ```bash
   lsof -i :3000
   # Tuer les process zombies si nécessaire
   pm2 kill
   pm2 start ecosystem.config.js
   ```

---

### Symptôme 2: "Je peux charger l'app mais pas me connecter"

**Pistes à explorer:**

1. **Route /health casse autre chose**
   - Vérifier si route `/health` entre en conflit avec autre route
   ```bash
   curl http://localhost:3000/health
   # Devrait retourner: {"status":"ok","timestamp":"..."}
   ```
   - **Fichier concerné**: `/root/productive-core-backend/src/index.ts` ligne ~115
   - **Fix**: Commenter la route `/health` et rebuild

2. **Login API retourne erreur**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"contact@mahagiri.fr","password":"444@"}'
   # Devrait retourner token
   ```
   - Si erreur 500: Voir logs PM2
   - **Piste**: Peut-être lié au fix SQL (colonne resolved)

3. **Frontend error-tracker en boucle**
   - Ouvrir DevTools (F12) → Console
   - Chercher: Erreurs répétées vers `/api/v1/monitoring/errors/log`
   - **Solution**: Vérifier que la colonne `resolved` existe bien:
   ```bash
   psql -U productive_user -d productive_app -c "\d frontend_errors"
   # Doit contenir colonne "resolved"
   ```

---

### Symptôme 3: "PM2 ne redémarre pas / EADDRINUSE"

**Pistes à explorer:**

1. **Fix wait_ready a cassé le cluster mode**
   ```bash
   pm2 logs productive-core --lines 100 | grep -i "EADDRINUSE\|ready\|listen"
   ```
   - **Fichier concerné**: `/root/productive-core-backend/ecosystem.config.js` ligne 47
   - **Fix rapide**: Restaurer `ecosystem.config.js.backup`
   ```bash
   cp /var/www/productiveapp/backups/FIXES-20260215-preventifs-crash-login/fichiers-originaux/ecosystem.config.js.backup \
      /root/productive-core-backend/ecosystem.config.js
   pm2 restart productive-core
   ```

2. **Plusieurs instances PM2 en conflit**
   ```bash
   pm2 list
   # Si plusieurs "productive-core":
   pm2 delete all
   pm2 start /root/productive-core-backend/ecosystem.config.js
   ```

---

### Symptôme 4: "Erreurs SQL bizarres dans les logs"

**Pistes à explorer:**

1. **Colonne 'resolved' cause problème**
   - Vérifier que la colonne a bien le bon type:
   ```sql
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_name = 'frontend_errors' AND column_name = 'resolved';

   -- Devrait retourner: boolean | YES | false
   ```

2. **Rollback migration si nécessaire**
   ```sql
   ALTER TABLE frontend_errors DROP COLUMN IF EXISTS resolved;
   -- Puis rebuild backend sans le fix 1
   ```

---

## 🗂️ FICHIERS MODIFIÉS (À VÉRIFIER EN PRIORITÉ)

| Fichier | Ligne(s) | Changement | Impact si bug |
|---------|----------|------------|---------------|
| `/root/productive-core-backend/src/index.ts` | ~115 | Ajout route `/health` | Backend peut ne pas démarrer si erreur syntaxe |
| `/root/productive-core-backend/ecosystem.config.js` | 47 | Commenté `wait_ready: true` | PM2 peut avoir comportement différent au restart |
| DB `frontend_errors` | - | Colonne `resolved` ajoutée | Requêtes SQL monitoring peuvent échouer |

---

## 📞 COMMANDES DE DIAGNOSTIC RAPIDE

**Copier-coller ce bloc pour diagnostic complet:**

```bash
echo "=== STATUS PM2 ==="
pm2 status productive-core

echo -e "\n=== DERNIÈRES ERREURS PM2 ==="
pm2 logs productive-core --lines 20 --nostream | grep -i error

echo -e "\n=== TEST BACKEND API ==="
curl -s http://localhost:3000/health

echo -e "\n=== TEST LOGIN ==="
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"contact@mahagiri.fr","password":"444@"}' | jq .

echo -e "\n=== COLONNE RESOLVED ==="
psql -U productive_user -d productive_app -c "SELECT column_name FROM information_schema.columns WHERE table_name='frontend_errors' AND column_name='resolved';"

echo -e "\n=== PORT 3000 ==="
lsof -i :3000 | head -5
```

---

## 🔄 ROLLBACK COMPLET

**Si rien ne marche, restaurer l'état AVANT les fixes:**

Voir fichier `ROLLBACK-PROCEDURE.md` dans ce même dossier.

---

## 📝 LOGS À CONSULTER

1. **PM2 logs**: `pm2 logs productive-core --lines 100`
2. **Nginx logs**: `tail -50 /var/log/nginx/error.log`
3. **PostgreSQL logs**: `tail -50 /var/log/postgresql/postgresql-*.log`

---

## ⚠️ CAS CRITIQUE - App complètement cassée

**Si RIEN ne fonctionne après les fixes:**

```bash
# 1. Restaurer backup complet du 15 février (qui marchait)
cd /var/www/productiveapp/backups
tar -xzf STABLE-20260215-app-complete-working.tar.gz -C /var/www/productiveapp/

# 2. Redémarrer tout
systemctl reload nginx
pm2 restart productive-core

# 3. Vérifier
curl http://localhost:8080
```

---

**Dernière mise à jour**: 2026-02-15 02:00 UTC
**Créé par**: Claude Sonnet 4.5 (Session ID: Context token 69632)
