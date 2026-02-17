/**
 * PROMPT FORGE - CATEGORIES v2.0
 * ProductiveApp - Couleurs et icônes dynamiques pour catégories auto-générées
 * Version: 2.0
 */

const PromptForgeCategories = (function() {
    'use strict';

    // Palette de couleurs pour les catégories dynamiques
    const PALETTE = [
        '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#22c55e', '#3b82f6', '#ec4899', '#f97316', '#14b8a6',
        '#a855f7', '#06b6d4', '#84cc16', '#fb923c', '#e11d48'
    ];

    // Mots-clés → icônes pour détecter automatiquement l'icône de catégorie
    const ICON_MAP = [
        { keys: ['marketing', 'vente', 'commerce', 'pub', 'brand'], icon: '📣' },
        { keys: ['code', 'dev', 'web', 'programm', 'tech', 'software'], icon: '💻' },
        { keys: ['psycho', 'mental', 'émotion', 'thérap', 'bien-être', 'santé'], icon: '🧠' },
        { keys: ['finance', 'argent', 'invest', 'budget', 'comptab', 'économ'], icon: '💰' },
        { keys: ['créat', 'art', 'design', 'music', 'écrit', 'photo'], icon: '🎨' },
        { keys: ['apprent', 'étude', 'formation', 'cours', 'éducat'], icon: '🎓' },
        { keys: ['product', 'organis', 'efficac', 'gestion', 'temps'], icon: '⚡' },
        { keys: ['commun', 'langue', 'rédact', 'copywrite', 'discours'], icon: '💬' },
        { keys: ['stratég', 'plan', 'vision', 'objectif', 'business'], icon: '🎯' },
        { keys: ['analys', 'données', 'rapport', 'recherche', 'science'], icon: '📊' },
        { keys: ['leader', 'manage', 'équipe', 'rh', 'recrutement'], icon: '👑' },
        { keys: ['sport', 'fitness', 'nutrition', 'corps', 'entraîn'], icon: '💪' },
        { keys: ['voyage', 'aventure', 'exploration', 'découverte'], icon: '✈️' },
        { keys: ['amour', 'relation', 'social', 'couple', 'famille'], icon: '❤️' },
        { keys: ['cuisine', 'recette', 'food', 'gastronomie'], icon: '🍽️' },
        { keys: ['nature', 'écolog', 'environ', 'durabilité'], icon: '🌿' },
        { keys: ['spirit', 'méditat', 'yoga', 'mindful', 'inner'], icon: '🌟' }
    ];

    /**
     * Générer une couleur déterministe depuis un nom de catégorie
     */
    function getColorForCategory(name) {
        if (!name) return PALETTE[0];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = ((hash << 5) - hash) + name.charCodeAt(i);
            hash |= 0;
        }
        return PALETTE[Math.abs(hash) % PALETTE.length];
    }

    /**
     * Détecter l'icône depuis le nom de catégorie
     */
    function getIconForCategory(name) {
        if (!name) return '📝';
        const lower = name.toLowerCase();
        for (const entry of ICON_MAP) {
            if (entry.keys.some(k => lower.includes(k))) return entry.icon;
        }
        return '📁';
    }

    return {
        getColorForCategory,
        getIconForCategory
    };
})();

// Export global
if (typeof window !== 'undefined') {
    window.PromptForgeCategories = PromptForgeCategories;
}
