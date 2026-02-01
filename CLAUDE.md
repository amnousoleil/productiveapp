# 🤖 CLAUDE.md - ProductiveApp Documentation

> **Dernière mise à jour** : 2026-02-01
> **Version** : 2.2.0
> **Statut** : ✅ Production - Tous bugs corrigés + Architecture modulaire + Chatbot local

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

## 🏗️ Architecture technique v2.0

### Stack
- **Frontend** : HTML5 + CSS3 + JavaScript vanilla (ES6+)
- **Backend** : N8N workflows (automation via webhooks)
- **Base de données** : PostgreSQL (via N8N API)
- **Serveur** : VPS Ubuntu + Nginx (port 8080) + Traefik (reverse proxy 80/443)
- **SSL** : Let's Encrypt (auto-renouvelé via Traefik)
- **Déploiement** : Git push → webhook auto-deploy

### Structure modulaire (v2.0 - 2026-02-01)

```
/var/www/productiveapp/
├── index.html                 # Point d'entrée (401 lignes, -60% vs v1.0)
│
├── css/                       # 🎨 Tous les fichiers CSS
│   ├── style-base.css        # Variables, reset, layout (22K)
│   ├── style-components.css  # Composants UI (43K)
│   ├── style-themes.css      # 16 thèmes visuels (22K)
│   ├── style-dragdrop.css    # Drag & drop (4K)
│   └── style-overrides.css   # Overrides spécifiques (18K) ✨ NOUVEAU
│
├── js/                        # ⚙️ Tous les fichiers JavaScript
│   ├── app.js                # Logique métier (1980 lignes + chatbot local)
│   ├── dragdrop.js           # Drag & drop Kanban (400+ lignes)
│   └── animations.js         # Animations (désactivé)
│
├── assets/                    # 🖼️ Ressources statiques
│   └── images/
│       ├── menu-icon.png
│       └── maha-giri-master.jpg
│
├── CLAUDE.md                  # 📖 Ce fichier (mémoire du projet)
├── README-ARCHITECTURE.md     # 🏗️ Documentation architecture détaillée
├── INFRASTRUCTURE.md          # 🚀 Infrastructure serveur
├── BACKUP-RESTORE.md          # 🛡️ Guide sauvegarde/restauration
└── .git/                      # 🔧 Repository Git
```

**Ordre de chargement CSS** (IMPORTANT) :
```html
<link rel="stylesheet" href="css/style-base.css?v=41">
<link rel="stylesheet" href="css/style-components.css?v=41">
<link rel="stylesheet" href="css/style-themes.css?v=41">
<link rel="stylesheet" href="css/style-dragdrop.css?v=41">
<link rel="stylesheet" href="css/style-overrides.css?v=41">  <!-- Doit être EN DERNIER -->
```

**Scripts chargés** :
```html
<script src="js/dragdrop.js?v=30"></script>
<script src="js/app.js?v=34"></script>
```

---

## 🎯 Versions actuelles (2026-02-01)

| Composant | Version | Dernière modif |
|-----------|---------|----------------|
| **CSS** | v45 | Gyrophare 3 modes |
| **JS app.js** | v37 | Filtre priorité 3 modes |
| **JS dragdrop.js** | v30 | Bug #1 corrigé (fluidité) |
| **index.html** | 418 lignes | + Bouton Gyrophare |
| **Architecture** | v2.3 | + Filtre priorité |
| **Git tag** | v2.3-gyrophare | Stable + tri urgent |

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
