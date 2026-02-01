# 🌌 Galaxy View - Documentation Complète

**Version** : 2.0 Advanced
**Date** : 2026-02-01
**État** : Production - Toutes fonctionnalités actives ✅

---

## 📋 Vue d'ensemble

**Galaxy View** est un module révolutionnaire de visualisation de tâches pour ProductiveApp. Il transforme votre Kanban en un univers interactif où chaque tâche devient une "bulle" que vous pouvez déplacer, connecter et organiser dans un espace infini.

### Pourquoi Galaxy View?

- 🎯 **Vision globale** : Voir toutes tes tâches en un coup d'œil
- 🔗 **Connexions** : Relier les tâches parents-enfants (système méduse)
- 📿 **Motivation** : Collier de perles pour célébrer tes victoires
- 🎮 **Gamification** : Système XP avec niveaux et sons de victoire
- 🔄 **Synchronisation** : Import/Export avec le Kanban classique

---

## 🚀 Accéder à Galaxy View

### Depuis ProductiveApp
Cliquer sur le bouton **👁️** à côté de ton nom d'utilisateur en haut à gauche.

### Fermer Galaxy View
- Bouton **✕** en haut à droite
- Ou touche **Esc** du clavier

---

## 🎮 Fonctionnalités Principales

### 1. 🟣 Créer des Bulles

**Méthode 1 - Bouton**:
- Cliquer sur **"+ Nouvelle bulle"** en bas à gauche
- Remplir le titre
- Choisir la catégorie:
  - 🎨 **Créatif** (bleu) - Design, écriture, art
  - 💼 **Professionnel** (vert) - Travail, projets, réunions
  - 🏠 **Personnel** (violet) - Perso, famille, loisirs
  - ⭐ **Important** (or) - Urgences, deadlines

**Méthode 2 - Import Kanban**:
- Cliquer sur **"⬇️ Import"** en haut à gauche
- Tes tâches Kanban seront automatiquement importées

### 2. 🎯 Déplacer les Bulles

**Drag & Drop**:
- Cliquer et maintenir sur une bulle
- La déplacer où tu veux
- Relâcher pour la poser

**Navigation**:
- Cliquer-glisser sur le fond pour déplacer la caméra
- Molette souris pour zoomer/dézoomer
- Boutons **+** / **−** / **⊙** en bas à droite

### 3. ✅ Compléter une Bulle

**Double-clic** sur une bulle pour la marquer comme terminée:
- ✓ Checkmark apparaît
- +20 XP gagnés
- Ajoutée au collier de perles
- Son de victoire 🎵
- Particules de célébration ✨

### 4. 🔗 Système Méduse (Connexions)

**Connecter deux bulles** (parent → enfant):
1. Maintenir **Ctrl** enfoncé
2. Cliquer sur la première bulle (parent)
3. Cliquer sur la deuxième bulle (enfant)
4. Une ligne les relie automatiquement

**Exemple d'usage**:
```
Projet Site Web (parent)
    ├─ Design maquette (enfant)
    ├─ Développement (enfant)
    └─ Tests (enfant)
```

**Annuler** :
- Relâcher **Ctrl**
- Ou **Esc** pour annuler

### 5. 🔍 Recherche & Filtres

**Barre de recherche** (top-left):
- Taper du texte pour filtrer
- Raccourci: touche **F**
- Recherche dans les titres en temps réel

**Filtres par catégorie**:
- Cliquer sur une icône (🎨 💼 🏠 ⭐) pour activer/désactiver
- Les filtres se combinent avec la recherche
- Bulles filtrées = invisibles (mais conservées)

### 6. 📿 Collier de Perles

**Visualiser tes victoires**:
- Cliquer sur **"📿 Collier de perles"**
- Voir toutes les bulles complétées
- Arc de cercle poétique avec perles colorées
- Hover sur une perle pour voir le titre

**Légende des couleurs**:
- 🔵 Bleu = Tâches créatives
- 🟢 Vert = Tâches professionnelles
- 🟣 Violet = Tâches personnelles
- 🟡 Or = Tâches importantes

### 7. 🎮 Système XP

**Gagner de l'XP**:
- +20 XP par bulle complétée
- Barre de progression en haut
- Level up automatique

**Niveaux**:
- Niveau 1: 0-100 XP
- Niveau 2: 100-250 XP
- Niveau 3: 250-525 XP
- ... (seuil × 1.5 à chaque niveau)

**Notification de level up**:
- Animation spectaculaire
- Accord musical triomphant
- Affichage du nouveau niveau

### 8. 🔄 Import/Export Kanban

**Importer** (⬇️):
- Récupère toutes tes tâches du Kanban
- Les dispose en grille automatique
- Mappe les catégories intelligemment
- Évite les doublons

**Exporter** (⬆️):
- Envoie tes bulles Galaxy vers le Kanban
- Crée de nouvelles tâches
- État conservé (todo/done)
- Synchronisation bidirectionnelle

---

## ⌨️ Raccourcis Clavier

| Touche | Action |
|--------|--------|
| **Ctrl** | Activer mode connexion méduse |
| **F** | Focus sur la recherche |
| **Delete** | Supprimer bulle sélectionnée |
| **Esc** | Annuler connexion ou fermer Galaxy View |
| **+** ou **=** | Zoom avant |
| **-** | Zoom arrière |
| **0** | Reset caméra (retour au centre) |
| **Double-clic** | Marquer bulle comme complétée |

---

## 🎨 Interface Expliquée

### En Haut (Header)
```
┌────────────────────────────────────────────────────┐
│ 🌌 Galaxy View | Barre XP  [Niveau X] [XP/100] │✕│
└────────────────────────────────────────────────────┘
```

### À Gauche (Toolbar)
```
┌─────────────────────┐
│ 🔍 Rechercher...    │
│ 🎨 💼 🏠 ⭐ (filtres)│
│ ⬇️ Import ⬆️ Export│
│ 💡 Hint: Ctrl+Clic │
└─────────────────────┘
```

### En Bas à Gauche (Actions)
```
│ + Nouvelle bulle │
│ 📿 Collier perles│
```

### En Bas à Droite (Zoom)
```
│ + │
│ ⊙ │
│ − │
```

---

## 💾 Sauvegarde Automatique

### Système Activé ✅

**Fréquence**: Toutes les 6 heures (0h, 6h, 12h, 18h)

**Contenu sauvegardé**:
- Commit Git automatique
- Tag horodaté (`auto-backup-YYYYMMDD-HHMMSS`)
- Archive tar.gz compressée
- Conserve les 10 dernières sauvegardes

**Emplacement**:
- Archives: `/var/www/backups/productiveapp-auto-*.tar.gz`
- Log: `/var/log/productiveapp-backup.log`
- Script: `/usr/local/bin/backup-productiveapp.sh`

**Restaurer une sauvegarde**:
```bash
# Lister les sauvegardes disponibles
ls -lh /var/www/backups/

# Restaurer une sauvegarde spécifique
cd /var/www
mv productiveapp productiveapp-old-$(date +%Y%m%d)
tar -xzf backups/productiveapp-auto-20260201-062813.tar.gz
systemctl reload nginx
```

---

## 📱 Mobile & Responsive

Galaxy View est **100% responsive**:

### Tablet (< 768px)
- Toolbar vertical
- Contrôles redimensionnés
- Header en colonne

### Phone (< 480px)
- Labels masqués automatiquement
- Icons uniquement
- Touch optimisé

---

## 🎵 Sons & Animations

### Sons disponibles:
- **Création de bulle**: Beep doux (800 Hz)
- **Victoire**: Montée harmonieuse Do → Sol
- **Level up**: Accord triomphant Do-Mi-Sol

### Animations:
- Icône galaxie qui tourne (20s)
- Barre XP avec effet brillance
- Particules de célébration colorées
- Perles qui pop à l'apparition
- Glow pulsant sur les bulles

---

## 🔧 Données & Persistance

### LocalStorage
Toutes tes données Galaxy View sont sauvegardées automatiquement dans le navigateur:
- Bulles (position, titre, catégorie, état)
- Connexions méduse
- Pearls (collier de perles)
- XP et niveau
- Position de la caméra

### Synchronisation
- Sauvegarde auto à chaque modification
- Restauration au chargement
- Compatible multi-onglets
- Données isolées par utilisateur

---

## 🐛 Résolution de Problèmes

### Les bulles ne s'affichent pas
- Vérifier les filtres (désactiver tous les filtres)
- Vider la recherche
- Appuyer sur **0** pour reset caméra

### Le mode connexion ne marche pas
- Bien maintenir **Ctrl** enfoncé
- Curseur doit être en croix (crosshair)
- Cliquer sur deux bulles différentes

### Les sauvegardes auto ne fonctionnent pas
```bash
# Vérifier le cron
crontab -l

# Tester le script manuellement
/usr/local/bin/backup-productiveapp.sh

# Voir les logs
tail -f /var/log/productiveapp-backup.log
```

### Données perdues
```bash
# Restaurer depuis Git
git checkout <tag-auto-backup>

# Ou restaurer depuis archive
tar -xzf /var/www/backups/productiveapp-auto-<date>.tar.gz
```

---

## 📊 Statistiques & Limites

### Performances
- **Bulles max recommandées**: 500
- **FPS**: 60 (animation fluide)
- **Zoom min**: 0.3x (vue d'ensemble)
- **Zoom max**: 3x (détails)

### Stockage
- **LocalStorage**: ~5 MB disponibles
- **Backup size**: ~400 KB par archive
- **10 backups**: ~4 MB d'espace disque

---

## 🚀 Roadmap Future (Idées)

Fonctionnalités potentielles pour v3.0:
- [ ] Templates de bulles pré-configurés
- [ ] Thèmes visuels pour le canvas
- [ ] Export PDF du Galaxy
- [ ] Mode collaboratif temps réel
- [ ] IA pour suggérer des connexions
- [ ] Statistiques avancées (graphiques)
- [ ] Raccourcis personnalisables

---

## 📞 Support

- **Fichier**: [GALAXY-VIEW.md](GALAXY-VIEW.md)
- **Repo**: https://github.com/amnousoleil/productiveapp.git
- **Tags**: `v1.1-galaxy-view-base`, `auto-backup-*`
- **Version actuelle**: galaxy-view.js v2

---

## 🎓 Conseils d'Utilisation

### Organisation recommandée

**1. Par Projets (Méduse)**:
```
Projet A (parent)
    ├─ Tâche 1
    ├─ Tâche 2
    └─ Tâche 3

Projet B (parent)
    └─ ...
```

**2. Par Thématiques (Zones)**:
```
Zone Gauche = Créatif 🎨
Zone Centre = Pro 💼
Zone Droite = Perso 🏠
```

**3. Par Priorité (Proximité)**:
```
Centre = Important ⭐
Périphérie = Peut attendre
```

### Workflow efficace

1. **Matin**: Importer nouvelles tâches Kanban
2. **Organisation**: Placer les bulles par zone/projet
3. **Travail**: Consulter le Galaxy, déplacer en cours
4. **Soir**: Marquer les complétées (double-clic)
5. **Fin semaine**: Admirer le collier de perles 📿

---

*Dernière mise à jour: 2026-02-01 par Claude Sonnet 4.5*
*Bonne exploration de ton Galaxy! 🌌✨*
