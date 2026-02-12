# INDEX DES BACKUPS - GALAXY VIEW

Date: 2026-02-12 01:06 UTC

## 📦 Backups disponibles:

### 1. Galaxy Canvas v2 (NOUVEAU - ACTIF)

**Localisation:**
- 📁 `/var/www/productiveapp/backups/2026-02-12-galaxy-canvas-v2-working/`
- 📦 `/var/www/productiveapp/backups/galaxy-canvas-v2-working-2026-02-12.tar.gz` (35KB)

**Contenu:**
- ✅ galaxy-canvas-v2.js (53K) - Canvas HTML5 + Rough.js
- ✅ galaxy-constellation.js (6.8K) - Mapping projets → constellations
- ✅ galaxie-view.js (3K) - Orchestrateur
- ✅ index.html.bak (83K) - Configuration

**Status:** PRODUCTION READY - Version stable et testée

**README:** [Voir README.md](2026-02-12-galaxy-canvas-v2-working/README.md)

---

### 2. Galaxy 3D (ANCIEN - THREE.js)

**Localisation:**
- 📁 `/var/www/productiveapp/backups/OLD-galaxy-3d-before-migration/`
- 📦 `/var/www/productiveapp/backups/OLD-galaxy-3d-before-migration-2026-02-12.tar.gz` (12KB)

**Contenu:**
- galaxy-3d.js (32K) - Engine THREE.js
- galaxy-ai.js (11K) - Intelligence artificielle

**Status:** DEPRECATED - Problèmes de cache et performances

**README:** [Voir README.md](OLD-galaxy-3d-before-migration/README.md)

---

## 🔧 Restauration rapide:

### Méthode 1: Script automatique (RECOMMANDÉ)

```bash
cd /var/www/productiveapp/backups
./RESTORE.sh
```

Le script vous guidera interactivement et créera automatiquement un backup de l'état actuel.

### Méthode 2: Manuel

#### Restaurer Galaxy Canvas v2:

```bash
# Restaurer index.html
cp /var/www/productiveapp/backups/2026-02-12-galaxy-canvas-v2-working/index.html.bak /var/www/productiveapp/index.html

# Restaurer JS files
cp /var/www/productiveapp/backups/2026-02-12-galaxy-canvas-v2-working/galaxy-canvas-v2.js /var/www/productiveapp/js/
cp /var/www/productiveapp/backups/2026-02-12-galaxy-canvas-v2-working/galaxy-constellation.js /var/www/productiveapp/js/
cp /var/www/productiveapp/backups/2026-02-12-galaxy-canvas-v2-working/galaxie-view.js /var/www/productiveapp/js/modules/canvases/

# Recharger serveur
sudo systemctl reload nginx
```

#### Restaurer Galaxy 3D (ancien):

```bash
# Restaurer fichiers
cp /var/www/productiveapp/backups/OLD-galaxy-3d-before-migration/galaxy-3d.js /var/www/productiveapp/js/modules/canvases/
cp /var/www/productiveapp/backups/OLD-galaxy-3d-before-migration/galaxy-ai.js /var/www/productiveapp/js/modules/canvases/

# Modifier MANUELLEMENT index.html:
# Décommenter: <script src="js/modules/canvases/galaxy-3d.js?v=1700"></script>
# Commenter: <script src="js/galaxy-canvas-v2.js"></script>
```

---

## 📊 Comparaison des versions:

| Feature | Galaxy Canvas v2 | Galaxy 3D |
|---------|------------------|-----------|
| **Technologie** | Canvas HTML5 + Rough.js | THREE.js |
| **Taille** | 53KB | 32KB (+ 11KB AI) |
| **Cache issues** | ✅ Résolu (nouveau nom) | ❌ Cache tenace |
| **Performance** | ✅ Légère | ⚠️ Lourde |
| **Constellations** | ✅ Mapping AppState | ❌ Basique |
| **localStorage** | ✅ Save/Load | ❌ Non |
| **Status** | ✅ ACTIF | ❌ DEPRECATED |

---

## 🚨 En cas d'urgence:

1. **Site down après changement:**
   ```bash
   cd /var/www/productiveapp/backups
   ./RESTORE.sh
   # Choisir option 1 (Galaxy Canvas v2)
   ```

2. **Backup corrompu:**
   ```bash
   # Extraire depuis archive
   tar -xzf /var/www/productiveapp/backups/galaxy-canvas-v2-working-2026-02-12.tar.gz -C /tmp/
   # Restaurer depuis /tmp/
   ```

3. **Tout est cassé:**
   ```bash
   # Les archives tar.gz sont indépendantes et peuvent être extraites ailleurs
   scp /var/www/productiveapp/backups/*.tar.gz user@backup-server:/backups/
   ```

---

## 📝 Historique des changements:

### 2026-02-12 - Migration Galaxy Canvas v2

**Problème:** galaxy-3d.js chargeait depuis cache navigateur malgré changements

**Solution:**
1. Créé nouveau fichier galaxy-canvas-v2.js (nom jamais vu par cache)
2. Commenté galaxy-3d.js et galaxy-ai.js dans index.html
3. Ajouté galaxy-constellation.js pour mapping AppState
4. Modifié galaxie-view.js pour appeler canvas au lieu de 3D

**Résultat:** ✅ Cache bypassed, constellations générées depuis AppState

---

## 📞 Support:

- Backups directory: `/var/www/productiveapp/backups/`
- Archives: `*.tar.gz` (compressées, portables)
- Script: `RESTORE.sh` (restauration guidée)

**Toujours créer un backup avant de modifier!**
