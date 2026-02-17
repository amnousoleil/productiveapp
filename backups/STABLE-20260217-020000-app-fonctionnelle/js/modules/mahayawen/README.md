# 🤖 MAHAYAWEN v3.0 - Le Bras Articulé Intelligent

**ProductiveApp - Assistant IA capable d'exécuter TOUTES les actions de l'application**

---

## 📋 ARCHITECTURE

```
mahayawen/
├── mahayawen-main.js              ✅ Point d'entrée principal
├── mahayawen-api-map.js           ✅ Cartographie complète des fonctions de l'app
├── mahayawen-router.js            ✅ Routeur d'actions
├── mahayawen-context.js           (existant) Gestion du contexte
├── mahayawen-intent-parser.js     (existant) Interpréteur d'intentions IA
├── mahayawen-agent.js             ✅ MODIFIÉ - Utilise le routeur
│
├── middlewares/
│   ├── middleware-confirmation.js ✅ Confirmation actions destructives
│   ├── middleware-logging.js      ✅ Log dans le Journal
│   ├── middleware-permissions.js  ✅ Vérification droits
│   └── middleware-ratelimit.js    ✅ Anti-boucle
│
└── executors/
    ├── executor-task.js           ✅ 14 actions tâches
    ├── executor-mail.js           ✅ 9 actions emails
    ├── executor-journal.js        ✅ 3 actions journal
    ├── executor-chat.js           ✅ Réponses conversationnelles
    └── executor-system.js         ✅ 5 actions système
```

---

## ⚡ DÉMARRAGE RAPIDE

### 1. Charger les scripts dans index.html

```html
<!-- MAHAYAWEN v3.0 - LE BRAS ARTICULÉ -->

<!-- API Map (DOIT être chargé en premier) -->
<script src="js/modules/mahayawen/mahayawen-api-map.js?v=3000"></script>

<!-- Middlewares -->
<script src="js/modules/mahayawen/middlewares/middleware-confirmation.js?v=3000"></script>
<script src="js/modules/mahayawen/middlewares/middleware-logging.js?v=3000"></script>
<script src="js/modules/mahayawen/middlewares/middleware-permissions.js?v=3000"></script>
<script src="js/modules/mahayawen/middlewares/middleware-ratelimit.js?v=3000"></script>

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

<!-- Anciens modules (context, intent-parser, agent) - DÉJÀ dans index.html -->
<!-- mahayawen-context.js -->
<!-- mahayawen-intent-parser.js -->
<!-- mahayawen-agent.js (MODIFIÉ pour utiliser le routeur) -->
```

### 2. Vérifier l'initialisation

Ouvrez la console navigateur :

```javascript
// Vérifier que MahaYawen est initialisé
MahayawenMain.getStats()

// Devrait afficher :
// {
//   version: "3.0.0",
//   initialized: true,
//   domains: 7,
//   totalActions: 50+,
//   executors: 5,
//   middlewares: 4
// }
```

### 3. Tester une commande

```javascript
// Exécuter une commande
await Mahayawen.execute("Crée une tâche 'Test MahaYawen'")

// Devrait retourner :
// {
//   success: true,
//   message: "✅ Tâche créée : 'Test MahaYawen'",
//   data: { id, title, ... }
// }
```

---

## 🎯 EXEMPLES D'UTILISATION

### Tâches

```javascript
// Créer
await Mahayawen.execute("Crée une tâche urgente : Appeler client")

// Lister
await Mahayawen.execute("Quelles tâches j'ai aujourd'hui ?")

// Compléter
await Mahayawen.execute("Marque 'Appeler client' comme terminé")

// Assigner
await Mahayawen.execute("Assigne cette tâche à Lilian")

// En retard
await Mahayawen.execute("Tâches en retard ?")
```

### Emails

```javascript
// Envoyer
await Mahayawen.execute("Envoie un mail à lilian@mahagiri.fr : RDV demain à 14h")

// Lister
await Mahayawen.execute("Emails envoyés aujourd'hui ?")

// Brouillon
await Mahayawen.execute("Sauvegarde ce brouillon")
```

### Journal

```javascript
// Ajouter entrée
await Mahayawen.execute("Note dans mon journal : Grosse session productive ce matin")

// Victoire
await Mahayawen.execute("Ajoute une victoire : Bug critique corrigé !")

// Bloqueur
await Mahayawen.execute("Bloqueur : API externe ne répond pas")
```

### Système

```javascript
// Recherche globale
await Mahayawen.execute("Recherche 'projet Alpha'")

// Résumé journée
await Mahayawen.execute("Résume ma journée")

// Aide
await Mahayawen.execute("Aide")

// Status
await Mahayawen.execute("Status de l'app")
```

---

## 🔐 SÉCURITÉ

### Actions nécessitant confirmation

Les actions destructives **EXIGENT** confirmation :
- Suppression (tâches, notes, emails, brouillons, templates)
- Suppression définitive (notes)

**Workflow :**
```javascript
// 1. Commande de suppression
await Mahayawen.execute("Supprime la tâche 'Test'")

// 2. Retourne :
// {
//   success: false,
//   blocked: true,
//   needsConfirmation: true,
//   confirmationMessage: "⚠️ Voulez-vous vraiment...",
//   intent: { ... } // Intention sauvegardée
// }

// 3. Confirmation par l'utilisateur (via UI)
// 4. Re-exécution avec isConfirmed: true
```

### Rate Limiting

- **1 seconde minimum** entre deux actions identiques
- **10 actions max** par type par minute
- Protection anti-boucle automatique

### Permissions

- Actions admin réservées aux admins
- Actions premium nécessitent un plan Pro/Enterprise
- Respect des permissions utilisateur

### Audit Trail

Toutes les actions MahaYawen sont **automatiquement loggées** dans le Journal :
```
🤖 MahaYawen: task.create - title="Test", priority="high"
```

---

## 📚 EXTENSIONS POSSIBLES

### Ajouter un nouvel exécuteur

1. Créer `executors/executor-[nom].js`
2. Implémenter les méthodes (retourner `{ success, message, data }`)
3. Enregistrer dans `MahayawenRouter.executorRegistry`
4. Ajouter mappings dans `mahayawen-api-map.js`

### Ajouter un middleware

1. Créer `middlewares/middleware-[nom].js`
2. Implémenter `process(intent)` → `{ blocked: bool, ... }`
3. Enregistrer dans `MahayawenRouter.registerMiddleware()`

---

## 🐛 DÉBOGAGE

```javascript
// Activer logs détaillés
localStorage.setItem('MAHAYAWEN_DEBUG', 'true')

// Voir état du routeur
MahayawenRouter

// Voir API Map
MahayawenApiMap

// Historique des commandes
MahayawenAgent.state.executionHistory
```

---

## 📊 STATISTIQUES

- **API Map** : 70+ fonctions cartographiées
- **Domaines** : 7 (tasks, notes, mail, journal, calendar, crm, system)
- **Actions totales** : 60+
- **Middlewares** : 4 (confirmation, logging, permissions, ratelimit)
- **Exécuteurs** : 5 (task, mail, journal, chat, system)
- **Lignes de code** : ~2000 lignes (nouveau code)

---

## ✅ CHECKLIST DE VALIDATION

- [ ] Tous les scripts chargés dans index.html
- [ ] `MahayawenMain.getStats()` retourne version 3.0.0
- [ ] Commande test "Crée une tâche" fonctionne
- [ ] Actions destructives demandent confirmation
- [ ] Logs apparaissent dans le Journal
- [ ] Rate limiting bloque actions trop rapides
- [ ] Recherche globale retourne résultats
- [ ] Chat conversationnel répond aux salutations

---

## 🔄 BACKUP & RESTORE

**Backup créé** : `/var/www/productiveapp/backups/mahayawen-refonte-20260217-0020/`

**Restaurer** (si problème) :
```bash
cd /var/www/productiveapp/backups/mahayawen-refonte-20260217-0020/
./RESTORE.sh
```

---

## 🎉 RÉSULTAT

MahaYawen est maintenant un **véritable bras articulé** :
- ✅ Appelle les fonctions existantes de l'app (zéro duplication)
- ✅ Exécute des actions réelles (pas juste parler)
- ✅ Sécurisé (confirmation, rate limit, permissions, logs)
- ✅ Extensible (facile d'ajouter domaines/actions)
- ✅ Intelligent (interpréteur IA + contexte conversationnel)

**L'utilisateur dit "Envoie un mail" → C'est fait. Vraiment.**

---

**Version** : 3.0.0
**Date** : 2026-02-17
**Auteur** : Claude Sonnet 4.5
