# 🤖 CLAUDE.md - ProductiveApp Documentation

> **Dernière mise à jour** : 2026-02-01
> **Version** : 1.0.0
> **Statut** : Production active

---

## 📋 Vue d'ensemble

**ProductiveApp** est une application web de gestion de tâches Kanban avec système de thèmes visuels et chatbot intégré.

### Utilisateurs
- **Maha** (Perso Maha) - Utilisateur principal
- **Lino** (Perso Lino) - Utilisateur secondaire

### URL de production
- **VPS Ubuntu** : Nginx sur port 8080
- **Repo GitHub** : https://github.com/amnousoleil/productiveapp.git

---

## 🏗️ Architecture technique

### Stack
- **Frontend** : HTML5 + CSS3 + JavaScript vanilla (ES6+)
- **Backend** : N8N workflows (automation)
- **Base de données** : PostgreSQL
- **Serveur** : VPS Ubuntu + Nginx (port 8080)
- **Déploiement** : Git + webhook auto-déploiement

### Fichiers principaux

#### HTML
- `index.html` - Structure principale de l'app

#### JavaScript
- `app.js` (1900+ lignes) - Logique métier principale
- `dragdrop.js` - Système drag & drop des tâches Kanban
- `chatbot.js` - Intégration chatbot (si présent)

#### CSS
- `style-base.css` - Variables CSS, reset, layout général
- `style-components.css` - Composants UI (bulles, boutons, modals, chatbot)
- `style-themes.css` - 10 thèmes visuels avec variables
- `style-dragdrop.css` - Styles pour le drag & drop

**Ordre de chargement CSS** (important !) :
```html
<link rel="stylesheet" href="style-base.css?v=15">
<link rel="stylesheet" href="style-components.css?v=15">
<link rel="stylesheet" href="style-themes.css?v=15">
<link rel="stylesheet" href="style-dragdrop.css?v=15">
```

---

## 🎨 Système de thèmes

### 10 thèmes disponibles
1. **Desert** (défaut) - Orange/sable
2. **Academie** 📚 - Gris ardoise + beige doré
3. **Matrix** 💚 - Vert néon Matrix
4. **Hacker** 🖤 - Noir + or
5. **Ocean** 🌊 - Bleu océan
6. **Fantasy** 🔮 - Violet/magenta
7. **Sunset** 🌅 - Orange/rouge coucher de soleil
8. **Forest** 🌲 - Vert forêt
9. **Bubblegum** 🍬 - Rose bonbon
10. **Midnight** 🌙 - Bleu nuit

### Variables CSS par thème
Chaque thème définit ses propres variables dans `style-themes.css` :
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
- `--text`, `--text-muted`
- `--accent`, `--accent-light`, `--accent-glow`
- `--bubble-bg`, `--bubble-border`, `--bubble-glow`
- `--bubble-inprogress-*`
- `--bubble-done-*`

---

## 🔧 Conventions de code

### CSS
- **Important** : Toujours utiliser `!important` pour les styles de bulles (risque d'écrasement par thèmes)
- **Versioning CSS** : Incrémenter `?v=XX` dans index.html à chaque modification CSS pour forcer le rechargement cache navigateur
- **Ordre de spécificité** : style-themes.css se charge EN DERNIER et peut écraser style-components.css

### Git
- **Commits** : Messages descriptifs en français
- **Co-Author** : Toujours inclure `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`
- **Push** : Actuellement manuel (credentials GitHub non configurés)

### Déploiement
- Push sur main → webhook auto-déploie sur VPS
- Nginx redémarre automatiquement

---

## 📝 Historique des décisions

### 2026-02-01 : Fix lisibilité texte bulles

**Problème** : Texte des bulles illisible sur certains thèmes (jaune/vert difficile à lire)

**Solution** :
1. Modification de toutes les couleurs de texte des bulles en blanc (`#ffffff`) dans `style-components.css` :
   - Ligne 126 : `.bubble.inprogress .bubble-text` → `color: #ffffff !important;`
   - Ligne 156 : `.bubble.done .bubble-text` → `color: #ffffff !important;`
   - Ligne 196 : `.bubble-text, .task-text` → `color: #ffffff !important;`

2. Ajout d'un fix de lisibilité global dans `style-themes.css` (lignes 362-369) :
   ```css
   .bubble-text,
   .task-text,
   .bubble.done .bubble-text,
   .task-bubble.done .task-text,
   .bubble.inprogress .bubble-text,
   .task-bubble.inprogress .task-text {
       color: #ffffff !important;
   }
   ```

3. Bug corrigé ligne 367 : `.task-bubble.inprogress .bubble-text` → `.task-bubble.inprogress .task-text`

**Commits** :
- `87fd34e` - Uniformise couleur texte bulles en blanc (#ffffff)
- `31eb5ac` - Force rechargement CSS v14 - texte blanc bulles
- `86131a1` - Fix texte blanc bulles v15 - corrige sélecteur CSS

**Versioning CSS** : Passé de v=13 → v=15

---

## ⚠️ Problèmes connus et résolus

### ✅ Résolu : Texte coloré illisible sur les bulles
**Symptôme** : Texte jaune (#fbbf24) pour "En cours", vert (#4ade80) pour "Terminé"
**Cause** : Variables CSS des thèmes + sélecteur CSS incorrect
**Solution** : Force texte blanc avec `!important` + correction sélecteur `.task-text`

### ✅ Résolu : Cache CSS ne se rafraîchit pas
**Symptôme** : Modifications CSS non visibles malgré hard refresh
**Cause** : Paramètre `?v=XX` dans index.html garde l'ancienne version en cache
**Solution** : Incrémenter le numéro de version CSS à chaque modification

### ⚠️ En attente : Git push automatique
**Symptôme** : `git push` échoue avec "could not read Username"
**Cause** : Credentials GitHub non configurés
**Solution proposée** : Configurer Personal Access Token ou SSH key
**Statut** : Utilisateur fait push manuel pour l'instant

---

## 🎯 États des tâches/bulles

### 3 états possibles
1. **À faire** (todo) - Orange par défaut
2. **En cours** (inprogress) - Glow jaune/orange pulsant
3. **Terminé** (done) - Glow vert, texte barré

### Classes CSS
- `.bubble` ou `.task-bubble` - Base
- `.bubble.inprogress` - En cours
- `.bubble.done` - Terminé
- `.bubble-text` ou `.task-text` - Texte de la tâche

---

## 🚀 Workflow de développement

### Pour modifier le CSS

1. **Modifier** le fichier CSS concerné
2. **Incrémenter** la version dans `index.html` : `?v=XX` → `?v=XX+1`
3. **Commit** avec message descriptif
4. **Push** (manuel pour l'instant)
5. **Tester** avec hard refresh (`Ctrl+Shift+R`)

### Pour débugger un problème CSS

1. Vérifier que le serveur a les bons fichiers : `curl -I http://localhost:8080/fichier.css`
2. Vérifier le contenu CSS du serveur : `curl -s http://localhost:8080/fichier.css | grep "sélecteur"`
3. Vérifier la version chargée dans DevTools (F12) → Network → chercher `fichier.css?v=XX`
4. Si cache : incrémenter version dans index.html

---

## 📦 Structure du projet

```
/var/www/productiveapp/
├── index.html              # Structure HTML principale
├── app.js                  # Logique métier (1900+ lignes)
├── dragdrop.js            # Drag & drop Kanban
├── style-base.css         # Variables + reset
├── style-components.css   # Composants UI
├── style-themes.css       # 10 thèmes visuels
├── style-dragdrop.css     # Styles drag & drop
├── CLAUDE.md              # Ce fichier (documentation)
└── .git/                  # Repo Git
```

---

## 🔑 Points critiques à retenir

1. **TOUJOURS** incrémenter `?v=XX` dans index.html après modification CSS
2. **TOUJOURS** utiliser `!important` pour les styles de bulles
3. **style-themes.css** se charge EN DERNIER et peut écraser style-components.css
4. Le fix de lisibilité dans style-themes.css (lignes 362-369) est PRIORITAIRE
5. Git push est manuel (pas de credentials configurés)
6. Webhook auto-déploie sur push vers main

---

## 📞 Contact & Support

- **Repo GitHub** : https://github.com/amnousoleil/productiveapp.git
- **Serveur** : VPS Ubuntu sur port 8080
- **Utilisateur principal** : Maha

---

*Dernière modification : 2026-02-01 par Claude Sonnet 4.5*
