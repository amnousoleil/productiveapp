# 🤖 CLAUDE.md - ProductiveApp Documentation

> **Dernière mise à jour** : 2026-02-02 12:00
> **Version** : 3.0.0
> **Statut** : ✅ Production STABLE - Architecture Modulaire + Backup PostgreSQL

---

## 📋 Vue d'ensemble

**ProductiveApp** est une application web de gestion de tâches Kanban avec système de thèmes visuels et chatbot IA intégré.

### Utilisateurs
- **Maha** (Perso Maha) - Utilisateur principal, Boss
- **Brice** - Utilisateur secondaire, Team
- **Team** - Utilisateur partagé

### URLs de production
- **Production** : https://giri-app.com (via Cloudflare + Traefik)
- **Direct VPS** : http://srv1053121.hstgr.cloud:8080
- **Repo GitHub** : https://github.com/amnousoleil/productiveapp.git

---

## 🏗️ Architecture technique v3.0 (MODULAIRE)

### Stack
- **Frontend** : HTML5 + CSS3 + JavaScript vanilla (ES6+) - Architecture Modulaire
- **Backend** : N8N workflows (automation via webhooks)
- **Base de données** : PostgreSQL (via N8N API)
- **Backup** : PostgreSQL automatique (30 min) + LocalStorage (5 min)
- **Serveur** : VPS Ubuntu + Nginx (port 8080) + Traefik (reverse proxy 80/443)
- **SSL** : Let's Encrypt (auto-renouvelé via Traefik)
- **Déploiement** : Git push → webhook auto-deploy

### Structure modulaire (v3.0 - 2026-02-02)

```
/var/www/productiveapp/
├── index.html                 # Point d'entrée (565 lignes)
│
├── css/                       # 🎨 Tous les fichiers CSS
│   ├── style-base.css        # Variables, reset, layout
│   ├── style-components.css  # Composants UI
│   ├── style-themes.css      # 16 thèmes visuels
│   ├── style-dragdrop.css    # Drag & drop
│   ├── style-overrides.css   # Overrides spécifiques
│   └── galaxy.css            # Galaxy view
│
├── js/                        # ⚙️ JavaScript - Architecture Modulaire
│   │
│   ├── modules/              # 📦 MODULES FONCTIONNELS
│   │   ├── config.js         # Configuration (API, users, themes)
│   │   ├── state.js          # Gestion d'état centralisée
│   │   ├── utils.js          # Fonctions utilitaires
│   │   ├── auth.js           # Authentification
│   │   ├── themes.js         # Gestion des thèmes
│   │   ├── tasks.js          # Logique tâches (CRUD, rendu)
│   │   ├── projects.js       # Logique projets
│   │   ├── journal.js        # Journal d'activité
│   │   ├── chatbot.js        # Chatbot IA + média
│   │   ├── effects.js        # Animations et effets
│   │   ├── report.js         # Rapports et export
│   │   └── backup.js         # Sauvegarde PostgreSQL
│   │
│   ├── services/             # 🔌 SERVICES
│   │   └── api.service.js    # Service API centralisé
│   │
│   ├── app-modular.js        # 🚀 Orchestrateur principal
│   ├── app.js                # (Legacy - conservé pour backup)
│   ├── dragdrop.js           # Drag & drop Kanban
│   └── galaxy.js             # Vue Galaxy
│
├── assets/                    # 🖼️ Ressources statiques
│   └── images/icons/
│
├── docs/                      # 📚 Documentation
│   └── N8N-BACKUP-WORKFLOW.md
│
├── CLAUDE.md                  # 📖 Ce fichier (mémoire du projet)
├── README-ARCHITECTURE.md     # 🏗️ Documentation architecture
├── INFRASTRUCTURE.md          # 🚀 Infrastructure serveur
├── BACKUP-RESTORE.md          # 🛡️ Guide sauvegarde/restauration
└── .git/                      # 🔧 Repository Git
```

**Ordre de chargement JavaScript** (IMPORTANT) :
```html
<!-- 1. Configuration et utilitaires -->
<script src="js/modules/config.js"></script>
<script src="js/modules/state.js"></script>
<script src="js/modules/utils.js"></script>

<!-- 2. Services -->
<script src="js/services/api.service.js"></script>

<!-- 3. Modules fonctionnels -->
<script src="js/modules/auth.js"></script>
<script src="js/modules/themes.js"></script>
<script src="js/modules/tasks.js"></script>
<script src="js/modules/projects.js"></script>
<script src="js/modules/journal.js"></script>
<script src="js/modules/chatbot.js"></script>
<script src="js/modules/effects.js"></script>
<script src="js/modules/report.js"></script>
<script src="js/modules/backup.js"></script>

<!-- 4. Modules externes -->
<script src="js/dragdrop.js"></script>
<script src="js/galaxy.js"></script>

<!-- 5. Application principale -->
<script src="js/app-modular.js"></script>
```

---

## 🎯 Versions actuelles (2026-02-02)

| Composant | Version | Lignes | Description |
|-----------|---------|--------|-------------|
| **config.js** | v1 | 111 | API, users, themes, constantes |
| **state.js** | v1 | 269 | Gestion d'état centralisée |
| **utils.js** | v1 | 280 | Fonctions utilitaires |
| **api.service.js** | v1 | 522 | Service API unifié |
| **auth.js** | v1 | 215 | Authentification |
| **tasks.js** | v1 | 600 | Logique tâches |
| **projects.js** | v1 | 289 | Logique projets |
| **journal.js** | v1 | 126 | Journal d'activité |
| **chatbot.js** | v1 | 688 | Chatbot IA complet |
| **effects.js** | v1 | 340 | Animations |
| **report.js** | v1 | 165 | Rapports |
| **backup.js** | v1 | 266 | Sauvegarde PostgreSQL |
| **app-modular.js** | v1 | 212 | Orchestrateur |
| **TOTAL MODULES** | - | **4083** | vs 2867 lignes monolithique |

### Avantages v3.0
- ✅ Code modulaire et maintenable
- ✅ Service API centralisé (plus de duplication)
- ✅ État global géré proprement (AppState)
- ✅ Sauvegarde automatique PostgreSQL
- ✅ Chaque module est testable individuellement
- ✅ Compatibilité totale avec l'ancien code

---

## 🚨 NOUVELLE FONCTIONNALITÉ : Bouton Gyrophare URGENT (2026-02-01)

### Description
Bouton avec icône gyrophare rouge à côté du sélecteur utilisateur. Permet de **trier instantanément toutes les tâches par priorité** (urgentes en premier).

### Emplacement
`user-filter-bar` → après le `<select id="user-filter-select">`

### Comportement (3 modes)
- **Clic 1** : Mode URGENT (Rouge) - Filtre priorité 1
- **Clic 2** : Mode NORMAL (Bleu) - Filtre priorité 2
- **Clic 3** : Mode ZEN (Blanc) - Filtre priorité 3
- **Clic 4** : Désactivé (retour normal)

### Images gyrophare
- Rouge: `697fa2efd9d54_gyrophare.png`
- Bleu: `697fa8fb04267_ChatGPTImage...png`
- Blanc: `697fa94e3a225_3ced8da8...png`

### Fichiers modifiés
- `index.html:121-124` - Bouton HTML avec image gyrophare
- `css/style-overrides.css` - Styles + animations (gyroGlow, gyroSpin, firefly)
- `js/app.js:77` - Variable `urgentFilterActive`
- `js/app.js:989-996` - Tri dans `renderTasks()`
- `js/app.js:2025-2030` - Event listener

### Commit
`c75ad5c` - Bouton Gyrophare URGENT - Tri par priorité

---

## 👤 AVATARS IMAGES PERSONNALISÉS (Session 2026-02-01)

### URLs des avatars
- **Maha** : `697fae4f07fb8_ChatGPTImage...png` (couronne roi)
- **Brice** : `697fae4f029ae_ChatGPTImage...png`
- **Team** : `697fafd36f577_ChatGPTImage...png`

### Implémentation
- `USERS[]` dans app.js contient les URLs au lieu d'emojis
- `getUserAvatar()` détecte les URLs et retourne `<img>` automatiquement
- Dropdown custom pour filtre utilisateur (remplace select natif)
- Images visibles dans : login, dropdown filtre, bulles tâches

### Fichiers
- `js/app.js` : USERS, getUserAvatar(), renderUserFilter(), selectUserFilter()
- `css/style-overrides.css` : .user-avatar-img, .custom-user-select, .custom-select-*

---

## 🎨 UI PREMIUM (Session 2026-02-01)

### Selects améliorés
- Fond sombre (#1a1a1f) pour dropdown options
- Flèche SVG custom orange
- Border-radius 12px, transitions smooth

### Favicon
- Boule dorée (logo) comme favicon

### Supprimé
- Bouton reformulation (bugué)
- Glow doré sur avatars (rendu bizarre)

---

## 🐛 BUGS CORRIGÉS (Session 2026-02-01)

### ✅ Bug #1 : Drag & Drop (Commit c6365d9)
**Problème** : Transparence trop forte, pas de magnétisation, drop première position cassé

**Solution** :
- Opacité : 0.7 → 0.95 (quasi invisible)
- Transitions CSS smooth (cubic-bezier)
- Transform scale(1.02) effet lift
- Gestion drop sur colonne pour première position
- Logique insertBefore améliorée

**Fichiers** : `css/style-dragdrop.css`, `js/dragdrop.js`

---

### ✅ Bug #2 : Notes penchées (Commit 1543706)
**Problème** : Effet rotation sur les bulles qui dérange le regard

**Solution** :
- Suppression de TOUS les rotate() dans le CSS
- Hover bubbles : rotate(1deg) → supprimé
- Animation celebrate : rotate(±5deg) → supprimé
- Animations thématiques (desert, fantasy) : rotations supprimées

**Fichiers** : `css/style-components.css`

---

### ✅ Bug #3 : Thème Académie (Commit 95f596b)
**Problème** : Effet bizarre en haut à droite (logo), menu pas premium

**Solution** :
- Animation pageFlip (pages qui tournent) supprimée
- Pseudo-élément ::before désactivé
- Bouton vue : "Vue" → "Colonnes" (plus descriptif)
- Icône vue : 📊 → ▦ (plus élégante)
- Hover menu : rotation supprimée, scale + glow premium

**Fichiers** : `css/style-components.css`, `index.html`

---

### ✅ Bug #4 : Thème Sunset (Commit 95f596b)
**Problème** : Carré qui tourne horrible (conic-gradient rotatif)

**Solution** :
- Animation sunRotate supprimée
- Gradient circulaire désactivé
- Visuel propre sans distraction

**Fichiers** : `css/style-components.css`

---

### ✅ Bug #5 : Boutons priorité (Commit 5e7bee2)
**Problème** : Design basique, pas premium

**Solution** :
- Gradient background (primary → secondary)
- Box shadow douce avec hover augmenté
- Style spécial pour #priority-select (gradient orange)
- Focus ring de 4px (accent 15%)
- Emojis améliorés : ⚡ Normal, 🔥 Urgent, 💤 Basse

**Fichiers** : `css/style-overrides.css`, `index.html`

---

### ✅ Bug #6 : Chatbot IA (Commits 1e27f13 + a85392c)
**Problème** : Dit "c'est fait" mais ne supprime pas vraiment les doublons

**Solution** :
- **Phase 1** : Ajout commande ACTION:DELETE_DUPLICATES dans processAIActions()
- **Phase 2** : Détection locale FRONTEND (Option B - meilleure solution !)
  - Détection avant N8N via handleLocalCommands()
  - Exécution instantanée sans round-trip API
  - 4 commandes locales implémentées

**Fichiers** : `js/app.js`

---

## 🤖 Chatbot IA - Commandes locales (v2.2)

### Architecture
Le chatbot utilise maintenant une **détection locale** pour certaines commandes, qui s'exécutent AVANT de passer par N8N.

**Avantages** :
- ⚡ Réponse instantanée
- 🎯 Fiabilité totale (pas de dépendance N8N)
- 🔒 Code 100% sous contrôle
- 🚀 Extensible facilement

### Commandes disponibles

#### 1. Supprimer les doublons
**Détection** : "supprime les doublons", "nettoie", "enlève les duplicates"
**Action** : Identifie (même texte + même projet) et supprime via deleteTaskAPI()
**Feedback** : Liste détaillée des doublons supprimés

#### 2. Compter urgents
**Détection** : "combien de tâches urgentes", "combien urgent"
**Action** : Compte et liste les tâches priorité 1
**Feedback** : Nombre + liste complète

#### 3. Compter en cours
**Détection** : "combien en cours", "combien de tâches en cours"
**Action** : Compte les tâches status inprogress
**Feedback** : Nombre + liste complète

#### 4. Stats globales
**Détection** : "stats", "statistiques", "résumé", "bilan"
**Action** : Calcule tous les compteurs
**Feedback** : Dashboard complet (todo/progress/done/urgent/total)

### Fonctions principales

```javascript
async function handleLocalCommands(message) {
    // Détecte et exécute les commandes locales
    // Retourne true si traité, false sinon
}

async function handleDeleteDuplicates() {
    // Suppression intelligente des doublons
    // Map<"text|project", Task> pour détecter
}
```

**Si commande locale détectée** → Exécution directe + return
**Sinon** → Envoi normal à N8N (comportement existant)

---

## 🎨 Système de thèmes

### 16 thèmes disponibles

**Catégorie PRO / CEO** (sobres, élégants) :
1. **Executive** - Or & Anthracite
2. **Corporate** - Bleu Marine
3. **Minimal** - Apple Style (clair)
4. **Slate** - Ardoise
5. **Obsidian** - Premium Dark
6. **Academie** - Beige Doré ✨ FIX : Animation supprimée

**Catégorie CRÉATIF / FUN** (colorés, dynamiques) :
7. **Sunset** - Chaleureux ✨ FIX : Carré rotatif supprimé
8. **Ocean** - Apaisant
9. **Forest** - Organique
10. **Bubblegum** - Fun & Jeune
11. **Aurora** - Moderne

**Catégorie GEEK / TECH** (futuristes, néon) :
12. **Matrix** - Hacker vert
13. **Cyberpunk** - Futuriste
14. **Terminal** - Old School
15. **Midnight** - Nuit Étoilée

### Variables CSS par thème
Chaque thème définit ses propres couleurs via CSS variables dans `style-themes.css`.

**Application thème** : `document.body.dataset.theme = 'matrix'`

---

## 🔧 Conventions de code

### CSS
- **Important** : Utiliser `!important` pour styles de bulles (priorité sur thèmes)
- **Versioning** : Incrémenter `?v=XX` dans index.html à chaque modif CSS
- **Ordre** : Respecter l'ordre de chargement (base → components → themes → overrides)
- **Variables** : Privilégier CSS variables (`var(--accent)`)

### JavaScript
- **Vanilla JS** : Pas de framework
- **ES6+** : Arrow functions, const/let, template strings
- **Async/Await** : Pour appels API
- **Nommage** : camelCase fonctions, UPPERCASE constantes
- **DOM** : `$('id')` au lieu de `document.getElementById('id')`

### Git
- **Commits** : Messages descriptifs en français avec emojis
- **Co-Author** : Toujours inclure `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`
- **Tags** : Créer tags pour versions stables (`v2.2-chatbot-local`)
- **Push** : Actuellement manuel

### Déploiement
```bash
# 1. Modifications locales
nano css/style-overrides.css

# 2. Incrémenter version dans index.html
# Changer ?v=41 → ?v=42

# 3. Commit
git add .
git commit -m "Description

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 4. Push (webhook auto-déploie)
git push origin main

# 5. Recharger Nginx
nginx -t && systemctl reload nginx
```

---

## 📊 Historique des décisions importantes

### 2026-02-01 : Restructuration Architecture v2.0
**Décision** : Réorganiser entièrement le projet en structure modulaire

**Raison** :
- index.html trop long (1031 lignes)
- CSS inline (627 lignes) difficile à maintenir
- Fichiers à la racine chaotiques

**Résultat** :
- index.html : 1031 → 401 lignes (-60%)
- Dossiers css/, js/, assets/
- Nouveau fichier style-overrides.css
- README-ARCHITECTURE.md créé (500+ lignes)

**Tag** : `v2.0-architecture-pro`

---

### 2026-02-01 : Correction 6 bugs majeurs
**Décision** : Corriger tous les bugs avant nouvelles fonctionnalités

**Bugs corrigés** :
1. Drag & Drop : Transparence + fluidité + drop première position
2. Notes penchées : Suppression rotations
3. Thème Académie : Animation pageFlip supprimée
4. Thème Sunset : Carré rotatif supprimé
5. Boutons priorité : Design premium
6. Chatbot IA : Suppression doublons fonctionnelle

**Commits** : 6 commits (c6365d9, 1543706, 95f596b, 5e7bee2, 1e27f13, a85392c)

**Tag** : `v2.1-bugs-fixed`

---

### 2026-02-01 : Chatbot local (Option B)
**Décision** : Implémenter détection locale au lieu de modifier N8N

**Raison** :
- Plus rapide (pas de round-trip API)
- Plus fiable (pas de dépendance N8N)
- Plus simple à maintenir (code local)
- Extensible facilement

**Résultat** :
- handleLocalCommands() : Router intelligent
- 4 commandes locales fonctionnelles
- Temps de réponse : ~0ms vs ~500ms+ (N8N)

**Tag** : `v2.2-chatbot-local`

---

### 2026-02-01 : Texte blanc sur bulles
**Problème** : Texte coloré illisible sur certains thèmes

**Solution** :
- Force texte blanc (`#ffffff`) avec `!important`
- Fix dans style-components.css et style-overrides.css
- Thèmes clairs (Minimal, Academie) : texte noir

**Versioning CSS** : v13 → v15

---

## 🛡️ Sauvegardes automatiques

### Système actif ✅
- **Fréquence** : Toutes les 6 heures (0h, 6h, 12h, 18h)
- **Contenu** : Commit Git + Tag + Archive tar.gz
- **Rétention** : 10 dernières sauvegardes
- **Emplacement** : `/var/www/backups/`
- **Script** : `/usr/local/bin/backup-productiveapp.sh`
- **Cron** : `0 */6 * * *`

### Restaurer une sauvegarde
```bash
# Lister les sauvegardes
ls -lh /var/www/backups/

# Restaurer
cd /var/www
mv productiveapp productiveapp-old-$(date +%Y%m%d)
tar -xzf backups/productiveapp-auto-YYYYMMDD-HHMMSS.tar.gz
systemctl reload nginx
```

---

## 🚀 API N8N

### Endpoints utilisés
- **Tasks** : `https://n8n.srv1053121.hstgr.cloud/webhook/tasks`
- **Journal** : `https://n8n.srv1053121.hstgr.cloud/webhook/journal`
- **Projects** : `https://n8n.srv1053121.hstgr.cloud/webhook/projects`
- **Correct** : `https://n8n.srv1053121.hstgr.cloud/webhook/correct`
- **Chatbot** : `https://n8n.srv1053121.hstgr.cloud/webhook/f199f400-91f2-48ea-b115-26a330247dcc`

### Fonctions API principales

```javascript
// Tâches
async function createTaskAPI(taskData)
async function updateTaskAPI(taskId, status, priority)
async function deleteTaskAPI(taskId)
async function reorderTaskAPI(taskId, status, position)

// Journal
async function addJournalEntry(category, text, energy)

// Chatbot (avec détection locale v2.2)
async function handleLocalCommands(message)  // NOUVEAU
async function sendChatMessage()
```

---

## 📞 Support & Documentation

### Fichiers de documentation
- **CLAUDE.md** : Ce fichier (mémoire du projet)
- **README-ARCHITECTURE.md** : Architecture détaillée (500+ lignes)
- **INFRASTRUCTURE.md** : Infra serveur (Traefik, Nginx, SSL)
- **BACKUP-RESTORE.md** : Guide sauvegarde/restauration

### URLs utiles
- **Repo GitHub** : https://github.com/amnousoleil/productiveapp.git
- **Site prod** : https://giri-app.com
- **Serveur** : VPS Ubuntu (72.60.215.20)

---

## 🎯 Prochaines étapes (Roadmap)

### Immédiat
- [x] Corriger tous les bugs (v2.1)
- [x] Architecture modulaire (v2.0)
- [x] Chatbot local (v2.2)

### Court terme (v2.3)
- [ ] Modulariser js/app.js en fichiers séparés
  - js/modules/config.js
  - js/modules/auth.js
  - js/modules/tasks.js
  - js/modules/journal.js
  - js/modules/themes.js
  - js/modules/chatbot.js

### Moyen terme (v3.0)
- [ ] Ajouter plus de commandes chatbot locales
- [ ] Système de notifications push
- [ ] Mode hors ligne (Service Worker)
- [ ] PWA (Progressive Web App)
- [ ] Tests unitaires (Jest)

### Long terme
- [ ] Migration TypeScript ?
- [ ] Framework moderne (React/Vue) ?
- [ ] Build process (Webpack/Vite) ?

---

## 📈 Statistiques

### Projet
- **Lignes de code** : ~7300 (HTML+CSS+JS)
- **Fichiers** : 13 fichiers principaux
- **Commits** : 100+ commits
- **Tags** : 6 tags stables
- **Documentation** : 4 fichiers MD (60K+)

### Taille des fichiers
| Fichier | Lignes | Taille | Évolution |
|---------|--------|--------|-----------|
| index.html | 401 | 20K | -60% (v1.0: 1031 lignes) |
| app.js | 1980 | 73K | Stable |
| dragdrop.js | 400 | 14K | Stable |
| style-components.css | 1400 | 43K | Stable |
| style-overrides.css | 626 | 18K | ✨ NOUVEAU v2.0 |

### Versions CSS/JS
- **CSS** : v41 (incrément +26 depuis v1.0)
- **JS app.js** : v34 (incrément +3 depuis v2.0)
- **JS dragdrop.js** : v30 (incrément +1 depuis v2.0)

---

## 🔑 Points critiques à retenir

1. **CSS Overrides** : style-overrides.css doit TOUJOURS être en dernier
2. **Versioning** : Incrémenter `?v=XX` après chaque modif CSS/JS
3. **Bulles** : Utiliser `!important` pour garantir lisibilité (texte blanc/noir)
4. **Drag & Drop** : Opacité gérée par CSS, pas JS (fluidité)
5. **Chatbot** : Commandes locales AVANT N8N (performance)
6. **Git** : Toujours inclure Co-Author Claude
7. **Thèmes** : Pas d'animations rotatives (dérangent le regard)
8. **API** : Utilise PostgreSQL via N8N (pas localStorage direct)

---

## 🎉 Résumé session 2026-02-01

**Achievements** :
- ✅ Architecture v2.0 modulaire professionnelle
- ✅ 6 bugs majeurs corrigés
- ✅ Chatbot local avec 4 commandes instantanées
- ✅ Documentation complète mise à jour
- ✅ 7 commits + 3 tags Git

**Résultat** :
- Application 100% fonctionnelle
- Code propre et organisé
- Performance optimale
- Prête pour futures évolutions

**État** : 🟢 STABLE - Production ready

---

*Dernière modification : 2026-02-01 par Claude Sonnet 4.5*
*ProductiveApp v2.2 - Architecture Modulaire + Chatbot Local*
