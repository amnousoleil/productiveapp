// =============================================
// PRODUCTIVEAPP - CONFIG MODULE
// Configuration centralisée de l'application
// =============================================

const AppConfig = {
    // === CONFIGURATION API ===
    API: {
        TASKS: 'https://n8n.srv1053121.hstgr.cloud/webhook/tasks',
        JOURNAL: 'https://n8n.srv1053121.hstgr.cloud/webhook/journal',
        PROJECTS: 'https://n8n.srv1053121.hstgr.cloud/webhook/projects',
        CORRECT: 'https://n8n.srv1053121.hstgr.cloud/webhook/correct',
        CHATBOT: 'https://n8n.srv1053121.hstgr.cloud/webhook/f199f400-91f2-48ea-b115-26a330247dcc',
        BACKUP: 'https://n8n.srv1053121.hstgr.cloud/webhook/backup'
    },

    // === IDENTIFIANT TENANT ===
    TENANT_ID: 'digitalgiri',

    // === AUTHENTIFICATION ÉQUIPE ===
    // Un seul compte pour toute l'équipe, puis sélection du membre
    TEAM_AUTH: {
        email: 'contact@mahagiri.fr',
        password: 'Autopdutop63.G+htrhs7'
    },

    // === MEMBRES DE L'ÉQUIPE ===
    // Profils disponibles après authentification
    // Chaque membre a son onboarding privé et peut filtrer ses propres tâches
    USERS: [
        {
            id: 'maha',
            name: 'Maha Giri',
            avatar: '👑',
            loginImg: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fae4f07fb8_ChatGPTImage1f%C3%A9vr.202609_58_10.png',
            role: 'boss'
        },
        {
            id: 'brice',
            name: 'Brice',
            avatar: '🚀',
            loginImg: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697ff503b4fa8_ChatGPTImage2f%C3%A9vr.202601_51_06.png',
            role: 'team'
        },
        {
            id: 'lilian',
            name: 'Lilian',
            avatar: '🎯',
            loginImg: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fafd36f577_ChatGPTImage1f%C3%A9vr.202620_55_54.png',
            role: 'team'
        },
        {
            id: 'miheko',
            name: 'Mihéko',
            avatar: '✨',
            loginImg: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fafd36f577_ChatGPTImage1f%C3%A9vr.202620_55_54.png',
            role: 'team'
        },
        {
            id: 'karima',
            name: 'Karima',
            avatar: '💫',
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

    // === THÈMES ===
    THEMES: {
        pro: [
            { id: 'executive', name: 'Executive', color: '#d4af37', category: 'PRO/CEO' },
            { id: 'corporate', name: 'Corporate', color: '#6495ed', category: 'PRO/CEO' },
            { id: 'minimal', name: 'Minimal', color: '#007aff', category: 'PRO/CEO' },
            { id: 'slate', name: 'Slate', color: '#64748b', category: 'PRO/CEO' },
            { id: 'obsidian', name: 'Obsidian', color: '#a0a0a0', category: 'PRO/CEO' },
            { id: 'academie', name: 'Académie', color: '#daa520', category: 'PRO/CEO' }
        ],
        creative: [
            { id: 'sunset', name: 'Sunset', color: '#f97316', category: 'CRÉATIF/FUN' },
            { id: 'ocean', name: 'Ocean', color: '#00b4d8', category: 'CRÉATIF/FUN' },
            { id: 'forest', name: 'Forest', color: '#4ade80', category: 'CRÉATIF/FUN' },
            { id: 'bubblegum', name: 'Bubblegum', color: '#ff6b9d', category: 'CRÉATIF/FUN' },
            { id: 'aurora', name: 'Aurora', color: '#93c5fd', category: 'CRÉATIF/FUN' }
        ],
        geek: [
            { id: 'matrix', name: 'Matrix', color: '#00ff66', category: 'GEEK/TECH' },
            { id: 'cyberpunk', name: 'Cyberpunk', color: '#ff00ff', category: 'GEEK/TECH' },
            { id: 'terminal', name: 'Terminal', color: '#00ff00', category: 'GEEK/TECH' },
            { id: 'midnight', name: 'Midnight', color: '#7c9fff', category: 'GEEK/TECH' }
        ]
    },

    // === IMAGES GYROPHARE ===
    GYRO_IMAGES: {
        off: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fa2efd9d54_gyrophare.png',
        urgent: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fa2efd9d54_gyrophare.png',
        normal: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fa8fb04267_ChatGPTImage1f%C3%A9vr.202620_25_30.png',
        zen: 'https://d1yei2z3i6k35z.cloudfront.net/15127401/697fa94e3a225_3ced8da8-b8c7-4a26-9fd0-feb9a7715dae.png'
    },

    // === TAILLES DE POLICE CHATBOT ===
    FONT_SIZES: ['small', 'medium', 'large', 'xlarge'],

    // === VERSION ===
    VERSION: '3.0.0'
};

// Liste plate des thèmes pour compatibilité
AppConfig.ALL_THEMES = [
    ...AppConfig.THEMES.pro,
    ...AppConfig.THEMES.creative,
    ...AppConfig.THEMES.geek
];

// Exposer globalement pour compatibilité
window.AppConfig = AppConfig;
