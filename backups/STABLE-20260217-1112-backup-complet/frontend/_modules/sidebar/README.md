# Sidebar v5.0 - ProductiveApp

## Comportement

- **Par défaut**: Sidebar OUVERTE (260px)
- **Clic chevron**: Replie/Déplie
- **État sauvegardé**: localStorage (persiste entre sessions)
- **Raccourci**: `Ctrl+B` pour toggle

## Fichiers

```
_sidebar-v5/
├── style-sidebar.css     # CSS complet
├── sidebar-core.js       # Logique principale
├── sidebar-render.js     # Rendu HTML
├── sidebar-events.js     # Event handlers
├── sidebar-init.js       # Initialisation
└── README.md             # Ce fichier
```

## Intégration

### 1. CSS

Remplacer dans `index.html`:
```html
<!-- Ancien -->
<link rel="stylesheet" href="css/sidebar.css?v=X">
<link rel="stylesheet" href="css/style-sidebar.css?v=X">
<link rel="stylesheet" href="css/sidebar-nav.css?v=X">

<!-- Nouveau (un seul fichier) -->
<link rel="stylesheet" href="css/style-sidebar.css?v=1">
```

Copier le contenu de `_sidebar-v5/style-sidebar.css` vers `css/style-sidebar.css`.

### 2. JavaScript

Remplacer les fichiers dans `js/modules/sidebar/`:
```bash
cp _sidebar-v5/sidebar-core.js js/modules/sidebar/
cp _sidebar-v5/sidebar-render.js js/modules/sidebar/
cp _sidebar-v5/sidebar-events.js js/modules/sidebar/
cp _sidebar-v5/sidebar-init.js js/modules/sidebar/
```

### 3. style-overrides.css

Supprimer toutes les anciennes règles sidebar et ajouter:
```css
/* SIDEBAR v5 - margins handled in style-sidebar.css */
/* Nothing to add here */
```

### 4. Vider les fichiers inutiles

Ces fichiers peuvent être vidés (garder juste un commentaire):
- `css/sidebar.css`
- `css/sidebar-nav.css`

## Variables CSS

```css
:root {
    --sb-width-open: 260px;
    --sb-width-closed: 64px;
    --sb-bg: #0a0a0f;
    --sb-accent: #6366f1;
}
```

## API JavaScript

```javascript
// Toggle
Sidebar.toggleCollapse()  // Replie/Déplie
Sidebar.expand()          // Ouvre
Sidebar.collapse()        // Ferme

// Navigation
Sidebar.navigate('dashboard')
Sidebar.setActiveItem('tasks')

// État
Sidebar.state.collapsed   // boolean
Sidebar.state.activeItem  // string
```

## Nettoyage localStorage

Si problèmes, exécuter dans la console:
```javascript
localStorage.removeItem('productiveapp_sidebar_v5');
location.reload();
```
