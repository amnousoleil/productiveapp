# Backup OLD Galaxy 3D - Avant Migration

## État: ANCIEN SYSTÈME (THREE.js)

Cette sauvegarde contient l'ANCIEN système Galaxy View 3D avec THREE.js:

- galaxy-3d.js - Engine THREE.js avec ShaderPass, EffectComposer
- galaxy-ai.js - Intelligence artificielle pour galaxy
- index.html référençait ces fichiers avec ?v=1700

## IMPORTANT:

Ces fichiers ont été **DÉSACTIVÉS** dans index.html mais **PAS SUPPRIMÉS** du serveur.

## Pourquoi la migration:

1. ❌ galaxy-3d.js utilisait THREE.js (lourd, complexe)
2. ❌ Cache navigateur refusait de lâcher ces fichiers
3. ❌ Erreurs THREE.ShaderPass dans console
4. ✅ Remplacé par galaxy-canvas-v2.js (Canvas HTML5 + Rough.js)

## Pour restaurer l'ancien système (déconseillé):

```bash
# Décommenter dans index.html:
<script src="js/modules/canvases/galaxy-3d.js?v=1700"></script>
<script src="js/modules/canvases/galaxy-ai.js?v=1700"></script>

# Commenter le nouveau:
<!-- <script src="js/galaxy-canvas-v2.js"></script> -->
<!-- <script src="js/galaxy-constellation.js"></script> -->
```

⚠️ **Attention:** Le système THREE.js avait des problèmes de cache et de performances.

## Restauration fichiers:

```bash
# Si les fichiers ont été supprimés du serveur:
cp /var/www/productiveapp/backups/OLD-galaxy-3d-before-migration/galaxy-3d.js /var/www/productiveapp/js/modules/canvases/
cp /var/www/productiveapp/backups/OLD-galaxy-3d-before-migration/galaxy-ai.js /var/www/productiveapp/js/modules/canvases/
```

## Date:

- Backup: 2026-02-12 01:10 UTC
- Version: galaxy-3d.js?v=1700
- Status: DEPRECATED
