// =============================================
// PRODUCTIVEAPP - CONFIG MODULE
// Configuration centralisée de l'application
// =============================================

const AppConfig = {
    // === CONFIGURATION API ===
    // MIGRÉ DE N8N VERS PRODUCTIVE-CORE BACKEND (2026-02-06)
    API: {
        // Base URL du backend
        BASE: '/api/v1',

        // Endpoints principaux (productive-core)
        TASKS: '/api/v1/tasks',
        PROJECTS: '/api/v1/projects',
        NOTES: '/api/v1/notes',           // Remplace JOURNAL

        // Endpoints IA (OpenAI direct)
        AI_CHAT: '/api/v1/ai/chat',       // Chatbot intelligent
        AI_CORRECT: '/api/v1/ai/correct', // Correction de texte
        AI_GENERATE: '/api/v1/ai/generate', // Génération de contenu

        // Endpoints rapports IA
        AI_REPORTS: '/api/v1/reports/ai',

        // Autres endpoints
        AUTH: '/api/v1/auth',
        USERS: '/api/v1/users',
        WORKSPACES: '/api/v1/workspaces',
        CANVASES: '/api/v1/canvases',     // Galaxy view

        // LEGACY N8N (désactivé - garder pour référence)
        // _LEGACY_TASKS: 'https://n8n.srv1053121.hstgr.cloud/webhook/tasks',
        // _LEGACY_CHATBOT: 'https://n8n.srv1053121.hstgr.cloud/webhook/f199f400-91f2-48ea-b115-26a330247dcc',
    },

    // === IDENTIFIANT TENANT ===
    TENANT_ID: 'digitalgiri',

    // === AUTHENTIFICATION ÉQUIPE ===
    // Credentials retirées pour sécurité - l'utilisateur saisit manuellement
    TEAM_AUTH: null,

    // === MEMBRES DE L'ÉQUIPE ===
    // Profils disponibles après authentification
    // Chaque membre a son onboarding privé et peut filtrer ses propres tâches
    USERS: [
        {
            id: 'dd8db965-df93-4274-9ae9-8847a58730d3',
            name: 'Maha Giri',
            avatar: '👑',
            loginImg: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fae4f07fb8_ChatGPTImage1f%C3%A9vr.202609_58_10.png',
            role: 'boss'
        },
        {
            id: '7ea300fa-b086-4215-8641-bdb4dfb0c543',
            name: 'Brice',
            avatar: '🚀',
            loginImg: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697ff503b4fa8_ChatGPTImage2f%C3%A9vr.202601_51_06.png',
            role: 'team'
        },
        {
            id: 'fae3f5c9-c032-47f6-a7cd-45c510edf2ec',
            name: 'Lilian',
            avatar: '🎯',
            loginImg: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fafd36f577_ChatGPTImage1f%C3%A9vr.202620_55_54.png',
            role: 'team'
        },
        {
            id: 'a62984e6-d424-4803-a7c7-d55ab0814fad',
            name: 'Mihéko',
            avatar: '✨',
            loginImg: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fafd36f577_ChatGPTImage1f%C3%A9vr.202620_55_54.png',
            role: 'team'
        },
        {
            id: 'dc1b4c74-9da5-48c0-8057-a159cc661cb9',
            name: 'Karima',
            avatar: '💫',
            loginImg: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fafd36f577_ChatGPTImage1f%C3%A9vr.202620_55_54.png',
            role: 'team'
        },
        {
            id: '948f61a5-136a-4ff5-b4c2-aeb1e945a3a2',
            name: 'Edna',
            avatar: '❤️',
            loginImg: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fafd36f577_ChatGPTImage1f%C3%A9vr.202620_55_54.png',
            role: 'team'
        },
        {
            id: 'f74dabfd-4b33-4c6d-847d-f7cb7965ec4a',
            name: 'Satyavir',
            avatar: '🔱',
            loginImg: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fafd36f577_ChatGPTImage1f%C3%A9vr.202620_55_54.png',
            role: 'team'
        },
        {
            id: 'all',
            name: 'Tout le monde',
            avatar: '👥',
            loginImg: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fafd36f577_ChatGPTImage1f%C3%A9vr.202620_55_54.png',
            role: 'shared'
        }
    ],

    // === PROJETS PAR DÉFAUT ===
    DEFAULT_PROJECTS: [
        { id: 'bible', name: 'Bible des Thérapeutes', icon: '📖', color: '#e07840', desc: 'Livre + examen pour les thérapeutes' },
        { id: 'academie', name: 'Académie', icon: '🎓', color: '#f5e6d3', desc: 'Formations, abonnements mensuels, contenu' },
        { id: 'lives', name: 'Lives Quotidiens', icon: '🎥', color: '#a89078', desc: 'Contenu live daily' },
        { id: 'entreprise', name: 'Entreprise Interne', icon: '🏢', color: '#2d2117', desc: 'RH, recrutement, personnel, orga interne' },
        { id: 'brice', name: 'Évolution Brice', icon: '🚀', color: '#22c55e', desc: 'Suivi progression de Brice' },
        { id: 'retraites', name: 'Retraites Spirituelles', icon: '🧘', color: '#8b5cf6', desc: 'Organisation des retraites' },
        { id: 'digital', name: 'Digital Giri', icon: '💻', color: '#3b82f6', desc: 'La marque, le business global' },
        { id: 'agents', name: 'Agents IA', icon: '🤖', color: '#ec4899', desc: 'Projets tech, automation, IA' },
        { id: 'voyages', name: 'Voyages Monde', icon: '✈️', color: '#f59e0b', desc: 'Déplacements, logistics internationale' },
        { id: 'perso', name: 'Perso Maha', icon: '🌟', color: '#fbbf24', desc: 'Vie personnelle' },
        { id: 'general', name: 'Général', icon: '📌', color: '#6b7280', desc: 'Tâches diverses' }
    ],

    // === THÈMES v4.0 — 60 thèmes, 10 catégories ===
    THEMES: {
        elegance: [
            { id: 'executive', name: 'Executive', color: '#d4af37', category: 'ÉLÉGANCE' },
            { id: 'corporate', name: 'Corporate', color: '#6495ed', category: 'ÉLÉGANCE' },
            { id: 'ivory', name: 'Ivory', color: '#8B7355', category: 'ÉLÉGANCE' },
            { id: 'sterling', name: 'Sterling', color: '#C0C8D0', category: 'ÉLÉGANCE' },
            { id: 'diplomat', name: 'Diplomat', color: '#C4324A', category: 'ÉLÉGANCE' },
            { id: 'academie', name: 'Académie', color: '#daa520', category: 'ÉLÉGANCE' }
        ],
        nature: [
            { id: 'ocean', name: 'Ocean', color: '#00b4d8', category: 'NATURE' },
            { id: 'forest', name: 'Forest', color: '#4aaa64', category: 'NATURE' },
            { id: 'sunset', name: 'Sunset', color: '#f97316', category: 'NATURE' },
            { id: 'desert', name: 'Desert', color: '#e07840', category: 'NATURE' },
            { id: 'lavender', name: 'Lavender', color: '#B07CC8', category: 'NATURE' },
            { id: 'sakura', name: 'Sakura', color: '#D4688C', category: 'NATURE' },
            { id: 'moss', name: 'Moss', color: '#507832', category: 'NATURE' }
        ],
        atmosphere: [
            { id: 'aurora', name: 'Aurora', color: '#93c5fd', category: 'ATMOSPHÈRE' },
            { id: 'midnight', name: 'Midnight', color: '#7c9fff', category: 'ATMOSPHÈRE' },
            { id: 'twilight', name: 'Twilight', color: '#C490E0', category: 'ATMOSPHÈRE' },
            { id: 'candlelight', name: 'Candlelight', color: '#E8A840', category: 'ATMOSPHÈRE' },
            { id: 'moonlit', name: 'Moonlit', color: '#A0B8D8', category: 'ATMOSPHÈRE' },
            { id: 'golden-hour', name: 'Golden Hour', color: '#D4A040', category: 'ATMOSPHÈRE' },
            { id: 'storm', name: 'Storm', color: '#6B8DB5', category: 'ATMOSPHÈRE' },
            { id: 'ember', name: 'Ember', color: '#DC5020', category: 'ATMOSPHÈRE' }
        ],
        moderne: [
            { id: 'bubblegum', name: 'Bubblegum', color: '#ff6b9d', category: 'MODERNE' },
            { id: 'neon', name: 'Neon', color: '#FF1493', category: 'MODERNE' },
            { id: 'pastel', name: 'Pastel', color: '#A888C8', category: 'MODERNE' },
            { id: 'retrowave', name: 'Retrowave', color: '#FF6EC7', category: 'MODERNE' },
            { id: 'mint', name: 'Mint', color: '#3DA878', category: 'MODERNE' },
            { id: 'coral', name: 'Coral', color: '#FF6F61', category: 'MODERNE' }
        ],
        minimaliste: [
            { id: 'obsidian', name: 'Obsidian', color: '#a0a0a0', category: 'MINIMALISTE' },
            { id: 'paper', name: 'Paper', color: '#8B7B65', category: 'MINIMALISTE' },
            { id: 'clay', name: 'Clay', color: '#B89878', category: 'MINIMALISTE' },
            { id: 'porcelain', name: 'Porcelain', color: '#6888A8', category: 'MINIMALISTE' },
            { id: 'espresso', name: 'Espresso', color: '#A87848', category: 'MINIMALISTE' },
            { id: 'snow', name: 'Snow', color: '#6880A0', category: 'MINIMALISTE' },
            { id: 'charcoal', name: 'Charcoal', color: '#909AA4', category: 'MINIMALISTE' }
        ],
        tech: [
            { id: 'matrix', name: 'Matrix', color: '#00ff66', category: 'TECH' },
            { id: 'cyberpunk', name: 'Cyberpunk', color: '#ff00ff', category: 'TECH' },
            { id: 'terminal', name: 'Terminal', color: '#FFB000', category: 'TECH' },
            { id: 'tron', name: 'Tron', color: '#00D4FF', category: 'TECH' },
            { id: 'hologram', name: 'Hologram', color: '#88DDFF', category: 'TECH' },
            { id: 'bioluminescence', name: 'Bioluminescence', color: '#00C8DC', category: 'TECH' }
        ],
        artiste: [
            { id: 'zen', name: 'Zen', color: '#708058', category: 'ARTISTE' },
            { id: 'art-deco', name: 'Art Déco', color: '#C8A040', category: 'ARTISTE' },
            { id: 'watercolor', name: 'Watercolor', color: '#8888C0', category: 'ARTISTE' },
            { id: 'nordic', name: 'Nordic', color: '#5A7A6A', category: 'ARTISTE' },
            { id: 'cosmic', name: 'Cosmic', color: '#9966FF', category: 'ARTISTE' },
            { id: 'ukiyo-e', name: 'Ukiyo-e', color: '#B45038', category: 'ARTISTE' }
        ],
        saisons: [
            { id: 'printemps', name: 'Printemps', color: '#78B464', category: 'SAISONS' },
            { id: 'ete', name: 'Été', color: '#2890C0', category: 'SAISONS' },
            { id: 'automne', name: 'Automne', color: '#C85A28', category: 'SAISONS' },
            { id: 'hiver', name: 'Hiver', color: '#88B8E0', category: 'SAISONS' }
        ],
        precieux: [
            { id: 'amethyst', name: 'Amethyst', color: '#9060D8', category: 'PRÉCIEUX' },
            { id: 'jade', name: 'Jade', color: '#40A878', category: 'PRÉCIEUX' },
            { id: 'ruby', name: 'Ruby', color: '#D83040', category: 'PRÉCIEUX' },
            { id: 'pearl', name: 'Pearl', color: '#A098B0', category: 'PRÉCIEUX' },
            { id: 'copper', name: 'Copper', color: '#C87850', category: 'PRÉCIEUX' }
        ],
        voyage: [
            { id: 'sahara', name: 'Sahara', color: '#D2AF5A', category: 'VOYAGE' },
            { id: 'fjord', name: 'Fjord', color: '#3C8296', category: 'VOYAGE' },
            { id: 'bamboo', name: 'Bamboo', color: '#64803C', category: 'VOYAGE' },
            { id: 'bali', name: 'Bali', color: '#00B496', category: 'VOYAGE' },
            { id: 'provence', name: 'Provence', color: '#8C6EA0', category: 'VOYAGE' }
        ]
    },

    // === IMAGES GYROPHARE ===
    GYRO_IMAGES: {
        off: '/assets/images/icons/gyrophare-off.png',
        urgent: '/assets/images/icons/gyrophare-urgent.png',
        important: '/assets/images/icons/gyrophare-important.png',
        normal: '/assets/images/icons/gyrophare-normal.png',
        zen: '/assets/images/icons/gyrophare-zen.png'
    },

    // === TAILLES DE POLICE CHATBOT ===
    FONT_SIZES: ['small', 'medium', 'large', 'xlarge'],

    // === VERSION ===
    VERSION: '4.0.0'
};

// Liste plate des thèmes pour compatibilité
AppConfig.ALL_THEMES = [
    ...AppConfig.THEMES.elegance,
    ...AppConfig.THEMES.nature,
    ...AppConfig.THEMES.atmosphere,
    ...AppConfig.THEMES.moderne,
    ...AppConfig.THEMES.minimaliste,
    ...AppConfig.THEMES.tech,
    ...AppConfig.THEMES.artiste,
    ...AppConfig.THEMES.saisons,
    ...AppConfig.THEMES.precieux,
    ...AppConfig.THEMES.voyage
];

// Exposer globalement pour compatibilité
window.AppConfig = AppConfig;
