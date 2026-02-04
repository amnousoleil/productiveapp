# Architecture Multi-Claude - ProductiveApp

## Règle d'or
**Chaque Claude travaille dans SON dossier. Pas de conflit.**

---

## Structure des dossiers

```
/var/www/productiveapp/
│
├── _modules/                    # 🔨 ZONE DE TRAVAIL CLAUDE
│   ├── sidebar/                 # Claude A - Sidebar
│   ├── messaging/               # Claude B - Messaging
│   ├── dashboard/               # Claude C - Dashboard
│   ├── accounting/              # Claude D - Comptabilité
│   └── [feature]/               # Claude X - Nouvelle feature
│
├── css/                         # ⚠️ NE PAS TOUCHER DIRECTEMENT
├── js/                          # ⚠️ NE PAS TOUCHER DIRECTEMENT
└── index.html                   # ⚠️ NE PAS TOUCHER DIRECTEMENT
```

---

## Workflow

### 1. Claude commence une feature
```bash
# Créer son dossier de travail
mkdir -p _modules/[feature-name]
```

### 2. Claude développe dans son dossier
```
_modules/ma-feature/
├── style.css          # CSS de la feature
├── core.js            # Logique principale
├── render.js          # Rendu HTML (si besoin)
├── events.js          # Events (si besoin)
├── init.js            # Initialisation
├── README.md          # Documentation
└── INSTALL.sh         # Script d'intégration
```

### 3. Quand la feature est prête
- Claude signale que c'est prêt
- Un Claude "intégrateur" fusionne dans les vrais dossiers
- Ou on utilise le script INSTALL.sh

---

## Assignation actuelle

| Dossier | Claude | Status |
|---------|--------|--------|
| `_modules/sidebar/` | Claude A (moi) | ✅ Prêt dans `_sidebar-v5/` |
| `_modules/messaging/` | Claude B | 🔄 En cours |
| `_modules/accounting/` | ? | - |
| `_modules/psycho-audit/` | ? | - |

---

## Fichiers partagés (ATTENTION)

Ces fichiers sont utilisés par tout le monde - coordination requise :

| Fichier | Responsable | Notes |
|---------|-------------|-------|
| `index.html` | Intégrateur | Scripts et CSS imports |
| `css/style-overrides.css` | Intégrateur | Dernière couche CSS |
| `js/app-modular.js` | Intégrateur | Orchestrateur principal |
| `js/modules/router.js` | Intégrateur | Navigation entre vues |

---

## Convention de nommage

### Variables CSS
Chaque module préfixe ses variables :
```css
/* Sidebar */
--sb-width: 260px;
--sb-bg: #0a0a0f;

/* Messaging */
--msg-width: 400px;
--msg-bg: #1a1a24;

/* Accounting */
--acc-primary: #22c55e;
```

### Classes CSS
Chaque module préfixe ses classes :
```css
/* Sidebar */
.sidebar-item { }
.sidebar-nav { }

/* Messaging */
.msg-panel { }
.msg-bubble { }

/* Accounting */
.acc-table { }
.acc-row { }
```

---

## Intégration finale

Quand tous les Claudes ont fini :

```bash
# 1. Lister les modules prêts
ls _modules/

# 2. Intégrer chaque module
cd _modules/sidebar && bash INSTALL.sh
cd _modules/messaging && bash INSTALL.sh
# etc.

# 3. Incrémenter les versions CSS/JS dans index.html

# 4. Tester

# 5. Commit
git add -A && git commit -m "Intégration modules v5"
```

---

## Communication

Pour éviter les conflits, chaque Claude doit :

1. **Annoncer** sur quel dossier il travaille
2. **Ne JAMAIS** modifier un fichier hors de son dossier
3. **Signaler** quand sa feature est prête
4. **Documenter** son README.md

---

*Créé le 2026-02-03*
