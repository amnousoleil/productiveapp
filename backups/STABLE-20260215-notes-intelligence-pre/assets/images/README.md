# 📁 Images - ProductiveApp

Organisation des images de l'application.

## 📂 Structure

```
assets/images/
├── avatars/          # Photos de personnes (Maître, utilisateurs)
│   └── maha-giri-master.jpg (132K)
│
├── icons/            # Icônes UI et navigation
│   ├── eye-of-horus.png (à uploader)
│   └── menu-icon.png (194K)
│
├── logos/            # Logos de l'application
│   └── (vide pour l'instant)
│
└── decorations/      # Éléments décoratifs
    └── (vide pour l'instant)
```

## 🎨 Catégories

### `avatars/` - Visages et personnages
- **Maître Maha Giri** : Photo spirituelle utilisée sur l'écran de connexion
  - Effet divin avec glow et rayons de soleil
  - Taille : 800x1200px, 132K
  - Format : JPEG

### `icons/` - Icônes d'interface
- **Œil d'Horus** : Icône sacrée pour Galaxy View
  - Particules dorées divines au hover
  - Taille recommandée : 512x512px
  - Format : PNG avec transparence
  - **⚠️ À uploader**

- **Menu Icon** : Icône hamburger du menu
  - Effet glow premium
  - Taille : 256x256px, 194K
  - Format : PNG

### `logos/` - Logos d'application
- Logos officiels de ProductiveApp
- Différentes tailles et variantes

### `decorations/` - Éléments décoratifs
- Backgrounds, patterns, ornements
- Effets visuels thématiques

## 📝 Conventions de nommage

- **Minuscules** : Tout en minuscules
- **Tirets** : Utiliser des tirets pour séparer les mots
- **Descriptif** : Nom clair et explicite

Exemples :
- ✅ `maha-giri-master.jpg`
- ✅ `eye-of-horus.png`
- ✅ `logo-productiveapp-dark.svg`
- ❌ `Image1.PNG`
- ❌ `photo_maitre.jpg`

## 💾 Base de données

Les images sont référencées dans PostgreSQL via la table `app_images`.

Voir : [database/schema-images.sql](../../database/schema-images.sql)

## 📊 Utilisation actuelle

| Image | Utilisation | Fichier CSS/HTML |
|-------|-------------|------------------|
| Maître Maha Giri | Écran connexion (background) | `css/style-base.css:164` |
| Œil d'Horus | Icône Galaxy View (header) | `index.html:62` |
| Menu Icon | Bouton menu hamburger | `index.html:73` |

## 🚀 Ajout d'une nouvelle image

1. Placer l'image dans le bon dossier (`avatars/`, `icons/`, etc.)
2. Respecter les conventions de nommage
3. Optimiser l'image (compression, taille)
4. Référencer dans `database/schema-images.sql`
5. Mettre à jour ce README

---

*Dernière mise à jour : 2026-02-01 - Claude Sonnet 4.5*
