/**
 * PROMPT FORGE - CATEGORIES
 * ProductiveApp - Gestion des catégories de prompts
 * Version: 1.0
 */

const PromptForgeCategories = (function() {
    'use strict';

    // Catégories de prompts disponibles
    const CATEGORIES = [
        {
            id: 'learning',
            name: 'Apprentissage',
            icon: '🎓',
            color: '#6366f1',
            description: 'Prompts pour apprendre efficacement'
        },
        {
            id: 'business',
            name: 'Business',
            icon: '💼',
            color: '#10b981',
            description: 'Prompts pour le monde professionnel'
        },
        {
            id: 'creative',
            name: 'Créatif',
            icon: '🎨',
            color: '#f59e0b',
            description: 'Prompts pour la création de contenu'
        },
        {
            id: 'productivity',
            name: 'Productivité',
            icon: '⚡',
            color: '#ef4444',
            description: 'Prompts pour optimiser votre efficacité'
        },
        {
            id: 'coding',
            name: 'Code',
            icon: '💻',
            color: '#8b5cf6',
            description: 'Prompts pour les développeurs'
        },
        {
            id: 'health',
            name: 'Santé',
            icon: '🌿',
            color: '#22c55e',
            description: 'Prompts pour le bien-être'
        },
        {
            id: 'communication',
            name: 'Communication',
            icon: '💬',
            color: '#3b82f6',
            description: 'Prompts pour mieux communiquer'
        },
        {
            id: 'strategy',
            name: 'Stratégie',
            icon: '🎯',
            color: '#ec4899',
            description: 'Prompts pour la planification stratégique'
        }
    ];

    /**
     * Obtenir toutes les catégories
     */
    function getAll() {
        return [...CATEGORIES];
    }

    /**
     * Obtenir une catégorie par ID
     */
    function getById(id) {
        return CATEGORIES.find(cat => cat.id === id);
    }

    /**
     * Obtenir le nom d'une catégorie
     */
    function getName(id) {
        const category = getById(id);
        return category ? category.name : 'Autre';
    }

    /**
     * Obtenir l'icône d'une catégorie
     */
    function getIcon(id) {
        const category = getById(id);
        return category ? category.icon : '📝';
    }

    /**
     * Obtenir la couleur d'une catégorie
     */
    function getColor(id) {
        const category = getById(id);
        return category ? category.color : '#6b7280';
    }

    return {
        CATEGORIES,
        getAll,
        getById,
        getName,
        getIcon,
        getColor
    };
})();

// Export global
if (typeof window !== 'undefined') {
    window.PromptForgeCategories = PromptForgeCategories;
}
