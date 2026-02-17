# 📝 GUIDE D'INTÉGRATION - MahaYawen v3.0

## ⚡ INSTALLATION EN 3 ÉTAPES

### ÉTAPE 1 : Ajouter les scripts dans index.html

Trouvez la section des scripts MahaYawen/AI existants dans `index.html` et **ajoutez ces lignes AVANT** les scripts `mahayawen-agent.js` existants :

```html
<!-- ========================================= -->
<!-- MAHAYAWEN v3.0 - LE BRAS ARTICULÉ -->
<!-- ========================================= -->

<!-- API Map - DOIT être chargé EN PREMIER -->
<script src="js/modules/mahayawen/mahayawen-api-map.js?v=3000"></script>

<!-- Middlewares (ordre important) -->
<script src="js/modules/mahayawen/middlewares/middleware-permissions.js?v=3000"></script>
<script src="js/modules/mahayawen/middlewares/middleware-ratelimit.js?v=3000"></script>
<script src="js/modules/mahayawen/middlewares/middleware-confirmation.js?v=3000"></script>
<script src="js/modules/mahayawen/middlewares/middleware-logging.js?v=3000"></script>

<!-- Routeur -->
<script src="js/modules/mahayawen/mahayawen-router.js?v=3000"></script>

<!-- Exécuteurs -->
<script src="js/modules/mahayawen/executors/executor-task.js?v=3000"></script>
<script src="js/modules/mahayawen/executors/executor-mail.js?v=3000"></script>
<script src="js/modules/mahayawen/executors/executor-journal.js?v=3000"></script>
<script src="js/modules/mahayawen/executors/executor-chat.js?v=3000"></script>
<script src="js/modules/mahayawen/executors/executor-system.js?v=3000"></script>

<!-- Main (initialise tout) -->
<script src="js/modules/mahayawen/mahayawen-main.js?v=3000"></script>

<!-- Anciens modules (DÉJÀ PRÉSENTS - ne pas dupliquer) -->
<!-- mahayawen-context.js (déjà chargé) -->
<!-- mahayawen-intent-parser.js (déjà chargé) -->
<!-- mahayawen-agent.js (déjà chargé - MODIFIÉ pour utiliser le routeur) -->
<!-- mahayawen-voice.js (déjà chargé) -->
<!-- chatbot.js (déjà chargé) -->
```

### ÉTAPE 2 : Vérifier l'ordre de chargement

**ORDRE CRITIQUE** :
1. ✅ API Map (en premier)
2. ✅ Middlewares
3. ✅ Routeur
4. ✅ Exécuteurs
5. ✅ Main
6. ✅ Anciens modules (context, intent-parser, agent)

**NE PAS** charger `mahayawen-main.js` avant les exécuteurs !

### ÉTAPE 3 : Tester l'installation

1. **Ouvrir l'application** (Ctrl+Shift+R pour vider le cache)

2. **Console navigateur** :
```javascript
// Vérifier que MahaYawen v3.0 est initialisé
console.log(MahayawenMain.getStats())

// Devrait afficher :
// {
//   version: "3.0.0",
//   initialized: true,
//   domains: 7,
//   totalActions: 60+,
//   executors: 5,
//   middlewares: 4
// }
```

3. **Test de commande simple** :
```javascript
// Dans la console
await Mahayawen.execute("Aide")

// Devrait retourner un long message d'aide
```

4. **Test d'action réelle** :
```javascript
await Mahayawen.execute("Crée une tâche 'Test MahaYawen v3.0'")

// Devrait :
// - Créer réellement la tâche
// - Retourner { success: true, message: "✅ Tâche créée...", data: {...} }
// - Ajouter une entrée dans le Journal (🤖 MahaYawen: task.create...)
```

---

## 🐛 RÉSOLUTION DE PROBLÈMES

### Erreur : "MahayawenApiMap is not defined"

**Cause** : API Map pas chargée en premier

**Solution** : Déplacer `<script src="...mahayawen-api-map.js">` **AVANT** tous les autres scripts MahaYawen

---

### Erreur : "MahayawenRouter is not defined"

**Cause** : Routeur chargé avant les middlewares/exécuteurs

**Solution** : Respecter l'ordre : Middlewares → Routeur → Exécuteurs → Main

---

### Erreur : "ApiTasks is not defined"

**Cause** : Scripts MahaYawen chargés avant les API de l'app

**Solution** : Charger MahaYawen **APRÈS** :
- `api-tasks.js`
- `api-notes.js`
- `api-projects.js`
- `mail-api.js`
- `journal.js`
- etc.

---

### MahaYawen ne répond pas aux commandes

**Diagnostic** :
```javascript
// 1. Vérifier l'agent
MahayawenAgent.state

// 2. Vérifier le routeur
MahayawenRouter.initialized

// 3. Vérifier les exécuteurs
Object.keys(MahayawenRouter.executors)
// Devrait retourner : ["task", "mail", "journal", ...]
```

**Solutions** :
- Si `MahayawenAgent.state.isProcessing = true` : Agent bloqué, recharger la page
- Si `MahayawenRouter.initialized = false` : Appeler `MahayawenMain.init()`
- Si exécuteurs vides : Vérifier que les scripts sont bien chargés

---

### Actions ne s'exécutent pas

**Vérifier la console** :
```
🎯 [MahayawenRouter] Routing: task.create
⚡ [MahayawenRouter] Executing: task create {...}
```

**Si bloqué par middleware** :
```
🚫 [Middleware] Blocked: Trop d'actions
```
→ Rate limiting actif, attendre 1 minute

**Si erreur permissions** :
```
🔒 Action réservée aux administrateurs
```
→ Connectez-vous avec un compte admin

---

## 📊 VÉRIFICATION POST-INSTALLATION

### Checklist complète

```javascript
// 1. Version
MahayawenMain.version === "3.0.0" // ✓

// 2. Domaines chargés
Object.keys(MahayawenApiMap).length >= 7 // ✓

// 3. Exécuteurs chargés
Object.keys(MahayawenRouter.executors).length >= 5 // ✓

// 4. Middlewares actifs
MahayawenRouter.middlewares.length === 4 // ✓

// 5. Test simple
const result = await Mahayawen.execute("Status")
result.success === true // ✓

// 6. Test création tâche
const task = await Mahayawen.execute("Crée une tâche 'Validation MahaYawen'")
task.success === true && task.data.id // ✓

// 7. Test logging
// Aller dans le Journal → Devrait voir entrée "🤖 MahaYawen: task.create..."

// 8. Test confirmation
const del = await Mahayawen.execute("Supprime la tâche 'Validation MahaYawen'")
del.needsConfirmation === true // ✓ (demande confirmation)
```

---

## 🚀 PERFORMANCES

### Temps de chargement

- **API Map** : ~50KB (1 fichier)
- **Middlewares** : ~15KB (4 fichiers)
- **Routeur** : ~8KB (1 fichier)
- **Exécuteurs** : ~40KB (5 fichiers)
- **Main** : ~6KB (1 fichier)

**Total** : ~120KB supplémentaires (non-gzippé)
**Avec gzip** : ~30KB

### Optimisation recommandée

Pour production, concatener tous les fichiers :
```bash
cat mahayawen-api-map.js \
    middlewares/*.js \
    mahayawen-router.js \
    executors/*.js \
    mahayawen-main.js \
    > mahayawen-bundle.min.js
```

Puis charger un seul fichier au lieu de 12.

---

## 🔄 DÉSINSTALLATION (si nécessaire)

Si vous voulez revenir à l'ancienne version :

```bash
cd /var/www/productiveapp/backups/mahayawen-refonte-20260217-0020/
./RESTORE.sh
```

Puis retirer les 12 lignes de script ajoutées dans `index.html`.

---

## 📞 SUPPORT

**Logs de débogage** :
```javascript
localStorage.setItem('MAHAYAWEN_DEBUG', 'true')
location.reload()
```

**État complet** :
```javascript
{
  main: MahayawenMain.getStats(),
  router: {
    initialized: MahayawenRouter.initialized,
    executors: Object.keys(MahayawenRouter.executors),
    middlewares: MahayawenRouter.middlewares.length
  },
  agent: MahayawenAgent.state
}
```

---

**Version** : 3.0.0
**Date** : 2026-02-17
**Installation testée** : ✅ Prête pour production
