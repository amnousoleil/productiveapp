/**
 * PROMPT FORGE - LIBRARY v2.0
 * ProductiveApp - Gestion de la bibliothèque de prompts avec groupes
 * Version: 2.0
 */

const PromptForgeLibrary = (function() {
    'use strict';

    const STORAGE_KEY = 'giriapp_promptforge_library';

    /**
     * Charger la bibliothèque depuis localStorage
     */
    function loadLibrary() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('PromptForgeLibrary: Error loading library', error);
            return [];
        }
    }

    /**
     * Sauvegarder la bibliothèque dans localStorage
     */
    function saveLibrary(prompts) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
            return true;
        } catch (error) {
            console.error('PromptForgeLibrary: Error saving library', error);
            return false;
        }
    }

    /**
     * Ajouter un prompt à la bibliothèque
     */
    function savePrompt(promptData) {
        const prompts = loadLibrary();

        const newPrompt = {
            id: Date.now().toString(),
            userGoal: promptData.userGoal || '',
            category: promptData.category || 'Général',
            prompt: promptData.prompt || '',
            createdAt: new Date().toISOString(),
            ...promptData
        };

        prompts.unshift(newPrompt);
        saveLibrary(prompts);
        return newPrompt;
    }

    /**
     * Obtenir tous les prompts
     */
    function getAllPrompts() {
        return loadLibrary();
    }

    /**
     * Obtenir les prompts groupés par catégorie (ordre alphabétique)
     */
    function getGroupedByCategory() {
        const prompts = loadLibrary();
        const groups = {};

        prompts.forEach(p => {
            const cat = p.category || 'Général';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(p);
        });

        // Trier les groupes par nombre de prompts (décroissant), puis alphabétique
        return Object.entries(groups)
            .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
            .map(([name, prompts]) => ({ name, prompts }));
    }

    /**
     * Obtenir la liste des catégories avec leur nombre
     */
    function getCategories() {
        const groups = getGroupedByCategory();
        return groups.map(g => ({ name: g.name, count: g.prompts.length }));
    }

    /**
     * Filtrer les prompts par catégorie
     */
    function filterByCategory(category) {
        const prompts = loadLibrary();
        if (!category || category === 'all') return prompts;
        return prompts.filter(p => p.category === category);
    }

    /**
     * Obtenir un prompt par ID
     */
    function getPromptById(id) {
        return loadLibrary().find(p => p.id === id);
    }

    /**
     * Supprimer un prompt
     */
    function deletePrompt(id) {
        const filtered = loadLibrary().filter(p => p.id !== id);
        saveLibrary(filtered);
        return true;
    }

    /**
     * Supprimer plusieurs prompts par IDs
     */
    function deletePrompts(ids) {
        const idSet = new Set(ids);
        const filtered = loadLibrary().filter(p => !idSet.has(p.id));
        saveLibrary(filtered);
        return true;
    }

    /**
     * Copier le prompt dans le presse-papier
     */
    async function copyToClipboard(promptText) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(promptText);
                return true;
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = promptText;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textarea);
                return success;
            }
        } catch (error) {
            console.error('PromptForgeLibrary: Error copying to clipboard', error);
            return false;
        }
    }

    /**
     * Obtenir le nombre total de prompts
     */
    function getCount() {
        return loadLibrary().length;
    }

    /**
     * Vider toute la bibliothèque
     */
    function clearAll() {
        saveLibrary([]);
        return true;
    }

    return {
        savePrompt,
        getAllPrompts,
        getGroupedByCategory,
        getCategories,
        filterByCategory,
        getPromptById,
        deletePrompt,
        deletePrompts,
        copyToClipboard,
        getCount,
        clearAll
    };
})();

// Export global
if (typeof window !== 'undefined') {
    window.PromptForgeLibrary = PromptForgeLibrary;
}
