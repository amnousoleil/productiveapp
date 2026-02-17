/**
 * PROMPT FORGE - LIBRARY
 * ProductiveApp - Gestion de la bibliothèque de prompts
 * Version: 1.0
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
            category: promptData.category || 'productivity',
            prompt: promptData.prompt || '',
            createdAt: new Date().toISOString(),
            ...promptData
        };

        prompts.unshift(newPrompt); // Ajouter au début
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
     * Filtrer les prompts par catégorie
     */
    function filterByCategory(category) {
        const prompts = loadLibrary();
        if (!category || category === 'all') {
            return prompts;
        }
        return prompts.filter(p => p.category === category);
    }

    /**
     * Obtenir un prompt par ID
     */
    function getPromptById(id) {
        const prompts = loadLibrary();
        return prompts.find(p => p.id === id);
    }

    /**
     * Supprimer un prompt
     */
    function deletePrompt(id) {
        const prompts = loadLibrary();
        const filtered = prompts.filter(p => p.id !== id);
        saveLibrary(filtered);
        return true;
    }

    /**
     * Modifier un prompt existant
     */
    function updatePrompt(id, updates) {
        const prompts = loadLibrary();
        const index = prompts.findIndex(p => p.id === id);

        if (index === -1) {
            return null;
        }

        prompts[index] = {
            ...prompts[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        saveLibrary(prompts);
        return prompts[index];
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
                // Fallback pour anciens navigateurs
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
     * Obtenir le nombre de prompts
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
        filterByCategory,
        getPromptById,
        deletePrompt,
        updatePrompt,
        copyToClipboard,
        getCount,
        clearAll
    };
})();

// Export global
if (typeof window !== 'undefined') {
    window.PromptForgeLibrary = PromptForgeLibrary;
}
