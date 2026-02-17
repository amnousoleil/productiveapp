// ============================================================
// PRODUCTIVE APP — ANIMATION LIBRARY v1.0
// Catalogue complet des 63 animations disponibles
// ============================================================

(function() {
'use strict';

// ============================================================
// ANIMATION LIBRARY - Métadonnées complètes
// ============================================================
window.AnimationLibrary = {
    version: '1.0',

    // Toutes les animations disponibles avec métadonnées
    animations: {
        // ============================================================
        // CATÉGORIE : ÉLÉGANCE (6 animations)
        // ============================================================
        executive: {
            id: 'executive',
            name: 'Executive',
            category: 'elegance',
            description: 'Polygones dorés art-déco en rotation élégante',
            defaultColors: ['#d4af37', '#f0d975', '#c9a000'],
            intensity: 'medium',
            interactivity: 'mouse', // Nouvelle fonctionnalité à implémenter
            preview: 'executive-preview.png', // TODO: générer miniatures
            tags: ['géométrique', 'élégant', 'business', 'doré']
        },
        corporate: {
            id: 'corporate',
            name: 'Corporate',
            category: 'elegance',
            description: 'Flux de données bleus continus et fluides',
            defaultColors: ['#6495ed', '#89b4f7', '#4169e1'],
            intensity: 'medium',
            interactivity: 'none',
            tags: ['professionnel', 'flux', 'données', 'bleu']
        },
        ivory: {
            id: 'ivory',
            name: 'Ivory',
            category: 'elegance',
            description: 'Soie fluide aux tons ivoire subtils',
            defaultColors: ['#B8A080', '#D4C8B8', '#C8B898'],
            intensity: 'low',
            interactivity: 'none',
            tags: ['subtil', 'élégant', 'soie', 'ivoire']
        },
        sterling: {
            id: 'sterling',
            name: 'Sterling',
            category: 'elegance',
            description: 'Flocons de neige argentés en mouvement doux',
            defaultColors: ['#C0C8D0', '#D8DDE5', '#A8B0C0'],
            intensity: 'medium',
            interactivity: 'none',
            tags: ['argent', 'flocons', 'hiver', 'subtil']
        },
        diplomat: {
            id: 'diplomat',
            name: 'Diplomat',
            category: 'elegance',
            description: 'Monnaies du monde tombant en colonnes dorées + "Maître Maha Giri"',
            defaultColors: ['#C4A040', '#E0C060', '#A08830'],
            intensity: 'medium',
            interactivity: 'none',
            tags: ['monnaies', 'prestige', 'richesse', 'exclusif'],
            specialFeature: 'easter-egg' // "Maître Maha Giri" apparitions
        },
        academie: {
            id: 'academie',
            name: 'Académie',
            category: 'elegance',
            description: 'Pages de livre tournantes et particules de connaissance',
            defaultColors: ['#daa520', '#f0c850', '#b8860b'],
            intensity: 'medium',
            interactivity: 'none',
            tags: ['livre', 'savoir', 'académique', 'doré']
        },

        // ============================================================
        // CATÉGORIE : NATURE (7 animations)
        // ============================================================
        ocean: {
            id: 'ocean',
            name: 'Océan',
            category: 'nature',
            description: 'Vagues ondulantes avec poissons lumineux',
            defaultColors: ['#00b4d8', '#48cae4', '#06d6a0'],
            intensity: 'high',
            interactivity: 'none',
            tags: ['mer', 'vagues', 'poissons', 'bleu']
        },
        forest: {
            id: 'forest',
            name: 'Forêt',
            category: 'nature',
            description: 'Feuilles vertes tombant doucement',
            defaultColors: ['#4aaa64', '#70c888', '#a3e635'],
            intensity: 'medium',
            interactivity: 'none',
            tags: ['vert', 'feuilles', 'nature', 'forêt']
        },
        sunset: {
            id: 'sunset',
            name: 'Coucher de soleil',
            category: 'nature',
            description: 'Rayons divins dorés montant vers le ciel',
            defaultColors: ['#f97316', '#fbbf24', '#ef4444', '#fb7185'],
            intensity: 'high',
            interactivity: 'none',
            tags: ['soleil', 'rayons', 'doré', 'orange']
        },
        desert: {
            id: 'desert',
            name: 'Désert',
            category: 'nature',
            description: 'Tempête de sable tourbillonnante',
            defaultColors: ['#e07840', '#f4a261', '#fbbf24'],
            intensity: 'medium',
            interactivity: 'none',
            tags: ['sable', 'désert', 'tempête', 'ocre']
        },
        lavender: {
            id: 'lavender',
            name: 'Lavande',
            category: 'nature',
            description: 'Champ de lavande ondulant avec papillons',
            defaultColors: ['#B07CC8', '#D0A0E8', '#E8C0FF'],
            intensity: 'medium',
            interactivity: 'none',
            tags: ['lavande', 'violet', 'papillons', 'fleurs']
        },
        sakura: {
            id: 'sakura',
            name: 'Cerisier',
            category: 'nature',
            description: 'Pétales roses en spirale poétique',
            defaultColors: ['#D4688C', '#E890A8', '#F0B0C0'],
            intensity: 'medium',
            interactivity: 'none',
            tags: ['cerisier', 'pétales', 'rose', 'japon']
        },
        moss: {
            id: 'moss',
            name: 'Sous-bois',
            category: 'nature',
            description: 'Mycélium organique luminescent',
            defaultColors: ['#507832', '#70A048', '#3A5A20'],
            intensity: 'low',
            interactivity: 'none',
            tags: ['mousse', 'vert', 'forêt', 'organique']
        },

        // ============================================================
        // CATÉGORIE : ATMOSPHÈRE (8 animations)
        // ============================================================
        aurora: {
            id: 'aurora',
            name: 'Aurore boréale',
            category: 'atmosphere',
            description: 'Ondes lumineuses magiques auto-animées',
            defaultColors: ['#93c5fd', '#c4b5fd', '#86efac', '#a7f3d0'],
            intensity: 'high',
            interactivity: 'autonomous', // Pas de souris, mouvement propre
            tags: ['aurore', 'lumière', 'magique', 'arc-en-ciel']
        },
        midnight: {
            id: 'midnight',
            name: 'Minuit',
            category: 'atmosphere',
            description: 'Ciel étoilé avec constellations scintillantes',
            defaultColors: ['#7c9fff', '#a0c0ff', '#88d8a0'],
            intensity: 'medium',
            interactivity: 'none',
            tags: ['étoiles', 'nuit', 'bleu', 'cosmos']
        },
        twilight: {
            id: 'twilight',
            name: 'Crépuscule',
            category: 'atmosphere',
            description: 'Nuages violets doux et flottants',
            defaultColors: ['#C490E0', '#D8B0F0', '#A080C8'],
            intensity: 'low',
            interactivity: 'none',
            tags: ['crépuscule', 'nuages', 'violet', 'doux']
        },
        candlelight: {
            id: 'candlelight',
            name: 'Lueur de bougie',
            category: 'atmosphere',
            description: 'Flammes dansantes chaleureuses',
            defaultColors: ['#E8A840', '#F0C060', '#FFE080'],
            intensity: 'medium',
            interactivity: 'none',
            tags: ['bougie', 'flamme', 'chaleur', 'doré']
        },
        moonlit: {
            id: 'moonlit',
            name: 'Clair de lune',
            category: 'atmosphere',
            description: 'Rayons de lune argentés perçant les nuages',
            defaultColors: ['#A0B8D8', '#C0D0E8', '#8098B8'],
            intensity: 'low',
            interactivity: 'none',
            tags: ['lune', 'rayons', 'argent', 'nuit']
        },
        goldenhour: {
            id: 'goldenhour',
            name: 'Heure dorée',
            category: 'atmosphere',
            description: 'Lumière dorée chaude et enveloppante',
            defaultColors: ['#D4A040', '#E8C060', '#F0D880'],
            intensity: 'high',
            interactivity: 'none',
            tags: ['doré', 'lumière', 'chaleur', 'photographique']
        },
        storm: {
            id: 'storm',
            name: 'Orage',
            category: 'atmosphere',
            description: 'Éclairs dramatiques et pluie intense',
            defaultColors: ['#6B8DB5', '#90B0D0', '#4A7098'],
            intensity: 'high',
            interactivity: 'none',
            tags: ['orage', 'éclair', 'pluie', 'dramatique']
        },
        ember: {
            id: 'ember',
            name: 'Braises',
            category: 'atmosphere',
            description: 'Braises volantes rougeoyantes',
            defaultColors: ['#DC5020', '#F07040', '#FF9060'],
            intensity: 'medium',
            interactivity: 'none',
            tags: ['braises', 'feu', 'rouge', 'chaleur']
        },

        // ============================================================
        // CATÉGORIE : MODERNE (6 animations)
        // ============================================================
        bubblegum: {
            id: 'bubblegum',
            name: 'Bubble Gum',
            category: 'moderne',
            description: 'Bulles roses pétillantes qui éclatent',
            defaultColors: ['#ff6b9d', '#ff9ec4', '#ffc0d0', '#38bdf8'],
            intensity: 'high',
            interactivity: 'click', // Bulles éclatent au clic
            tags: ['bulles', 'rose', 'fun', 'pétillant']
        },
        neonp: {
            id: 'neonp',
            name: 'Néon',
            category: 'moderne',
            description: 'Réseau géométrique néon avec connexions lumineuses',
            defaultColors: ['#FF1493', '#FF69B4', '#00FFAA', '#FFD700'],
            intensity: 'high',
            interactivity: 'mouse',
            tags: ['néon', 'géométrie', 'cyberpunk', 'lumineux']
        },
        pastel: {
            id: 'pastel',
            name: 'Pastel',
            category: 'moderne',
            description: 'Aquarelle diffuse aux tons doux',
            defaultColors: ['#A888C8', '#C8A8E0', '#88B8D8'],
            intensity: 'low',
            interactivity: 'none',
            tags: ['pastel', 'aquarelle', 'doux', 'artistique']
        },
        retrowave: {
            id: 'retrowave',
            name: 'Retrowave',
            category: 'moderne',
            description: 'Grille synthwave avec soleil rétro',
            defaultColors: ['#FF6EC7', '#FF90D8', '#00E5A0', '#8866FF'],
            intensity: 'high',
            interactivity: 'none',
            tags: ['retrowave', '80s', 'synthwave', 'grille']
        },
        mint: {
            id: 'mint',
            name: 'Fraîcheur',
            category: 'moderne',
            description: 'Feuilles de menthe flottantes',
            defaultColors: ['#3DA878', '#60C898', '#88E0B8'],
            intensity: 'low',
            interactivity: 'none',
            tags: ['menthe', 'fraîcheur', 'vert', 'feuilles']
        },
        coral: {
            id: 'coral',
            name: 'Corail',
            category: 'moderne',
            description: 'Récif de corail ondulant',
            defaultColors: ['#FF6F61', '#FF9488'],
            intensity: 'medium',
            interactivity: 'none',
            tags: ['corail', 'récif', 'orange', 'mer']
        },

        // ============================================================
        // CATÉGORIE : MINIMALISTE (7 animations)
        // ============================================================
        obsidian: {
            id: 'obsidian',
            name: 'Obsidienne',
            category: 'minimaliste',
            description: 'Particules violettes subtiles sur fond sombre',
            defaultColors: ['#a78bfa', '#8b5cf6'],
            intensity: 'low',
            interactivity: 'none',
            tags: ['violet', 'minimaliste', 'subtil', 'particules']
        },
        paper: {
            id: 'paper',
            name: 'Papier',
            category: 'minimaliste',
            description: 'Fibres de papier organiques',
            defaultColors: ['#8B7B65', '#B0A088', '#C8B8A0'],
            intensity: 'very-low',
            interactivity: 'none',
            tags: ['papier', 'beige', 'organique', 'subtil']
        },
        clay: {
            id: 'clay',
            name: 'Argile',
            category: 'minimaliste',
            description: 'Texture d\'argile mouvante',
            defaultColors: ['#B89878', '#D0B898', '#C8A878'],
            intensity: 'low',
            interactivity: 'none',
            tags: ['argile', 'terre', 'texture', 'naturel']
        },
        porcelain: {
            id: 'porcelain',
            name: 'Porcelaine',
            category: 'minimaliste',
            description: 'Motifs céramique délicats',
            defaultColors: ['#6888A8', '#88A8C8', '#A0C0D8'],
            intensity: 'very-low',
            interactivity: 'none',
            tags: ['porcelaine', 'bleu', 'céramique', 'délicat']
        },
        espresso: {
            id: 'espresso',
            name: 'Espresso',
            category: 'minimaliste',
            description: 'Vapeur de café montante',
            defaultColors: ['#A87848', '#C89868', '#B08858'],
            intensity: 'low',
            interactivity: 'none',
            tags: ['café', 'vapeur', 'marron', 'chaleur']
        },
        zen: {
            id: 'zen',
            name: 'Zen',
            category: 'minimaliste',
            description: 'Cercles concentriques apaisants',
            defaultColors: ['#708058', '#90A070', '#A8B888'],
            intensity: 'very-low',
            interactivity: 'none',
            tags: ['zen', 'cercles', 'calme', 'vert']
        },
        snow: {
            id: 'snow',
            name: 'Neige',
            category: 'minimaliste',
            description: 'Tempête de neige avec flocons dorés occasionnels',
            defaultColors: ['#6880A0', '#88A0C0', '#A0B8D0'],
            intensity: 'medium',
            interactivity: 'none',
            specialFeature: 'golden-flakes', // Flocons dorés aléatoires
            tags: ['neige', 'flocons', 'hiver', 'bleu']
        },

        // ============================================================
        // CATÉGORIE : TECH (6 animations)
        // ============================================================
        matrix: {
            id: 'matrix',
            name: 'Matrix',
            category: 'tech',
            description: 'Code vert Matrix tombant',
            defaultColors: ['#00CC33', '#66E68C'],
            intensity: 'high',
            interactivity: 'none',
            tags: ['matrix', 'code', 'vert', 'cyber']
        },
        cyberpunk: {
            id: 'cyberpunk',
            name: 'Cyberpunk',
            category: 'tech',
            description: 'Réseau cyberpunk avec point focal central',
            defaultColors: ['#ff00ff', '#00ffff', '#ff0088', '#8800ff'],
            intensity: 'high',
            interactivity: 'none',
            tags: ['cyberpunk', 'réseau', 'néon', 'futuriste']
        },
        terminal: {
            id: 'terminal',
            name: 'Terminal',
            category: 'tech',
            description: 'Lignes de commande défilant + ECG battement cœur',
            defaultColors: ['#FFB000', '#FFD060', '#FF8800'],
            intensity: 'medium',
            interactivity: 'none',
            specialFeature: 'ecg-heartbeat', // Animation ECG hôpital
            tags: ['terminal', 'code', 'orange', 'système']
        },
        trongrid: {
            id: 'trongrid',
            name: 'Tron',
            category: 'tech',
            description: 'Grille Tron lumineuse',
            defaultColors: ['#00D4FF', '#40E0FF', '#0080A0'],
            intensity: 'high',
            interactivity: 'none',
            tags: ['tron', 'grille', 'cyan', 'futuriste']
        },
        hologram: {
            id: 'hologram',
            name: 'Hologramme',
            category: 'tech',
            description: 'Effet holographique multicolore',
            defaultColors: ['#88DDFF', '#FF88DD', '#88FFBB', '#FFDD88'],
            intensity: 'low',
            interactivity: 'none',
            tags: ['hologramme', 'sci-fi', 'multicolore', 'futuriste']
        },
        pipboy: {
            id: 'pipboy',
            name: 'Pip-Boy',
            category: 'tech',
            description: 'Interface Fallout vintage',
            defaultColors: ['#00FF77', '#00CC55'],
            intensity: 'high',
            interactivity: 'none',
            tags: ['fallout', 'vintage', 'vert', 'retro-tech']
        },

        // ============================================================
        // CATÉGORIE : ARTISTE (5 animations)
        // ============================================================
        watercolor: {
            id: 'watercolor',
            name: 'Aquarelle',
            category: 'artiste',
            description: 'Taches d\'aquarelle qui se mélangent',
            defaultColors: ['#8888C0', '#A8A8D8', '#9898B8'],
            intensity: 'low',
            interactivity: 'none',
            tags: ['aquarelle', 'peinture', 'artistique', 'violet']
        },
        nordic: {
            id: 'nordic',
            name: 'Scandinave',
            category: 'artiste',
            description: 'Flocons géométriques nordiques',
            defaultColors: ['#5A7A6A', '#78A890', '#90C0A8'],
            intensity: 'low',
            interactivity: 'none',
            tags: ['nordique', 'scandinave', 'géométrique', 'vert']
        },
        artdeco: {
            id: 'artdeco',
            name: 'Art Déco',
            category: 'artiste',
            description: 'Fleur de vie dorée fixe + motifs rayonnants',
            defaultColors: ['#C8A040', '#E0C060'],
            intensity: 'medium',
            interactivity: 'none',
            tags: ['art-déco', 'doré', 'géométrique', 'vintage']
        },
        cosmic: {
            id: 'cosmic',
            name: 'Cosmique',
            category: 'artiste',
            description: 'Nébuleuse cosmique en expansion',
            defaultColors: ['#9966FF', '#B888FF', '#7744DD'],
            intensity: 'high',
            interactivity: 'none',
            tags: ['cosmos', 'nébuleuse', 'violet', 'espace']
        },
        ukiyoe: {
            id: 'ukiyoe',
            name: 'Ukiyo-e',
            category: 'artiste',
            description: 'Vagues japonaises Hokusai',
            defaultColors: ['#B45038', '#D07050'],
            intensity: 'medium',
            interactivity: 'none',
            tags: ['ukiyo-e', 'japon', 'vagues', 'traditionnel']
        },

        // ============================================================
        // CATÉGORIE : SAISONS (4 animations)
        // ============================================================
        printemps: {
            id: 'printemps',
            name: 'Printemps',
            category: 'saisons',
            description: 'Fleurs multicolores éclosant',
            defaultColors: ['#78B464', '#98D080', '#B8E8A0'],
            intensity: 'medium',
            interactivity: 'none',
            tags: ['printemps', 'fleurs', 'éclosion', 'vert']
        },
        ete: {
            id: 'ete',
            name: 'Été',
            category: 'saisons',
            description: 'Rayons de soleil vibrants',
            defaultColors: ['#2890C0', '#48B0E0', '#F0D080'],
            intensity: 'high',
            interactivity: 'none',
            tags: ['été', 'soleil', 'rayons', 'chaleur']
        },
        automne: {
            id: 'automne',
            name: 'Automne',
            category: 'saisons',
            description: 'Feuilles dorées tourbillonnantes',
            defaultColors: ['#C85A28', '#E07840', '#D8A030'],
            intensity: 'high',
            interactivity: 'none',
            tags: ['automne', 'feuilles', 'doré', 'orange']
        },
        hiver: {
            id: 'hiver',
            name: 'Hiver',
            category: 'saisons',
            description: 'Tempête de neige avec intensité réglable',
            defaultColors: ['#88B8E0', '#A8D0F0', '#C0D8F0'],
            intensity: 'medium',
            interactivity: 'none',
            tags: ['hiver', 'neige', 'flocons', 'bleu']
        },

        // ============================================================
        // CATÉGORIE : PRÉCIEUX (5 animations)
        // ============================================================
        amethyst: {
            id: 'amethyst',
            name: 'Améthyste',
            category: 'precieux',
            description: 'Cristaux violets avec étoiles filantes',
            defaultColors: ['#9060D8', '#B080F0', '#7040B8'],
            intensity: 'medium',
            interactivity: 'none',
            specialFeature: 'shooting-stars', // Étoiles filantes aléatoires
            tags: ['améthyste', 'cristaux', 'violet', 'gemme']
        },
        jade: {
            id: 'jade',
            name: 'Jade',
            category: 'precieux',
            description: 'Spirales de jade fluides',
            defaultColors: ['#40A878', '#60C898', '#308860'],
            intensity: 'high',
            interactivity: 'none',
            tags: ['jade', 'vert', 'spirales', 'gemme']
        },
        ruby: {
            id: 'ruby',
            name: 'Rubis',
            category: 'precieux',
            description: 'Gemmes rouges pulsantes éclatantes',
            defaultColors: ['#D83040', '#F05060'],
            intensity: 'medium',
            interactivity: 'none',
            tags: ['rubis', 'rouge', 'gemme', 'éclat']
        },
        pearl: {
            id: 'pearl',
            name: 'Perle',
            category: 'precieux',
            description: 'Perles nacrées irisées',
            defaultColors: ['#A098B0', '#B8B0C8', '#D0C8D8'],
            intensity: 'very-low',
            interactivity: 'none',
            tags: ['perle', 'nacre', 'violet', 'délicat']
        },
        copper: {
            id: 'copper',
            name: 'Cuivre',
            category: 'precieux',
            description: 'Étincelles de cuivre avec perles géantes occasionnelles',
            defaultColors: ['#C87850', '#E09870', '#A06038'],
            intensity: 'medium',
            interactivity: 'none',
            specialFeature: 'large-sparks', // Perles plus grosses aléatoires
            tags: ['cuivre', 'étincelles', 'orange', 'métal']
        },

        // ============================================================
        // CATÉGORIE : VOYAGE (5 animations)
        // ============================================================
        bamboo: {
            id: 'bamboo',
            name: 'Jardin Zen',
            category: 'voyage',
            description: 'Tiges de bambou ondulantes avec éléments zen',
            defaultColors: ['#64803C', '#88A858', '#A0C070'],
            intensity: 'low',
            interactivity: 'none',
            tags: ['bambou', 'zen', 'vert', 'japon']
        },
        provence: {
            id: 'provence',
            name: 'Champs de lavande',
            category: 'voyage',
            description: 'Champs de lavande denses ondulant au vent',
            defaultColors: ['#8C6EA0', '#A888C0', '#C0A0D0'],
            intensity: 'high',
            interactivity: 'none',
            tags: ['provence', 'lavande', 'violet', 'france']
        },
        waves: {
            id: 'waves',
            name: 'Fjord',
            category: 'voyage',
            description: 'Vagues nordiques puissantes',
            defaultColors: ['#3C8296', '#58A8C0', '#286878'],
            intensity: 'medium',
            interactivity: 'none',
            tags: ['fjord', 'vagues', 'bleu', 'norvège']
        },
        charcoal: {
            id: 'charcoal',
            name: 'Cendres',
            category: 'voyage',
            description: 'Cubes de cendres montant très haut + "Maître Maha Giri"',
            defaultColors: ['#909AA4', '#B0B8C0'],
            intensity: 'medium',
            interactivity: 'none',
            specialFeature: 'easter-egg', // "Maître Maha Giri" apparitions
            tags: ['cendres', 'gris', 'cubes', 'volcanique']
        }
    },

    // ============================================================
    // CATÉGORIES
    // ============================================================
    categories: {
        elegance: {
            id: 'elegance',
            name: 'Élégance',
            description: 'Animations sophistiquées pour professionnels',
            icon: '👔',
            color: '#d4af37'
        },
        nature: {
            id: 'nature',
            name: 'Nature',
            description: 'Inspirées par les éléments naturels',
            icon: '🌿',
            color: '#4aaa64'
        },
        atmosphere: {
            id: 'atmosphere',
            name: 'Atmosphère',
            description: 'Ambiances lumineuses et météo',
            icon: '🌅',
            color: '#93c5fd'
        },
        moderne: {
            id: 'moderne',
            name: 'Moderne',
            description: 'Designs contemporains et colorés',
            icon: '🎨',
            color: '#ff6b9d'
        },
        minimaliste: {
            id: 'minimaliste',
            name: 'Minimaliste',
            description: 'Effets subtils et épurés',
            icon: '⚪',
            color: '#a78bfa'
        },
        tech: {
            id: 'tech',
            name: 'Tech',
            description: 'Univers futuristes et cyber',
            icon: '💻',
            color: '#00CC33'
        },
        artiste: {
            id: 'artiste',
            name: 'Artiste',
            description: 'Inspirations artistiques et picturales',
            icon: '🖼️',
            color: '#9966FF'
        },
        saisons: {
            id: 'saisons',
            name: 'Saisons',
            description: 'Les quatre saisons de l\'année',
            icon: '🍂',
            color: '#C85A28'
        },
        precieux: {
            id: 'precieux',
            name: 'Précieux',
            description: 'Gemmes et métaux rares',
            icon: '💎',
            color: '#9060D8'
        },
        voyage: {
            id: 'voyage',
            name: 'Voyage',
            description: 'Destinations du monde',
            icon: '🗺️',
            color: '#40A878'
        }
    },

    // ============================================================
    // MÉTHODES UTILITAIRES
    // ============================================================

    /**
     * Récupère toutes les animations d'une catégorie
     */
    getByCategory(categoryId) {
        return Object.values(this.animations).filter(anim => anim.category === categoryId);
    },

    /**
     * Récupère une animation par son ID
     */
    getById(animId) {
        return this.animations[animId] || null;
    },

    /**
     * Récupère les animations favorites depuis localStorage
     */
    getFavorites() {
        const favs = localStorage.getItem('productiveapp_animation_favorites');
        return favs ? JSON.parse(favs) : [];
    },

    /**
     * Ajoute/retire une animation des favoris
     */
    toggleFavorite(animId) {
        const favs = this.getFavorites();
        const index = favs.indexOf(animId);

        if (index === -1) {
            favs.push(animId);
        } else {
            favs.splice(index, 1);
        }

        localStorage.setItem('productiveapp_animation_favorites', JSON.stringify(favs));

        // Émettre event pour update UI
        window.dispatchEvent(new CustomEvent('animationFavoritesChanged', { detail: favs }));

        return favs;
    },

    /**
     * Vérifie si une animation est en favori
     */
    isFavorite(animId) {
        return this.getFavorites().includes(animId);
    },

    /**
     * Recherche d'animations par tags
     */
    searchByTags(tags) {
        const searchTags = Array.isArray(tags) ? tags : [tags];
        return Object.values(this.animations).filter(anim =>
            anim.tags.some(tag => searchTags.includes(tag))
        );
    },

    /**
     * Récupère les animations avec fonctionnalités spéciales
     */
    getWithSpecialFeatures() {
        return Object.values(this.animations).filter(anim => anim.specialFeature);
    },

    /**
     * Récupère toutes les catégories
     */
    getAllCategories() {
        return Object.values(this.categories);
    },

    /**
     * Statistiques
     */
    getStats() {
        const anims = Object.values(this.animations);
        return {
            total: anims.length,
            byCategory: this.getAllCategories().map(cat => ({
                category: cat.name,
                count: this.getByCategory(cat.id).length
            })),
            withInteractivity: anims.filter(a => a.interactivity !== 'none').length,
            withSpecialFeatures: anims.filter(a => a.specialFeature).length
        };
    }
};

// ============================================================
// INITIALISATION
// ============================================================
console.log('🎨 AnimationLibrary v1.0 chargé -', AnimationLibrary.getStats().total, 'animations disponibles');

})();
