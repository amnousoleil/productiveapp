/**
 * PROMPT FORGE - CORE
 * ProductiveApp - Logique principale et appel API
 * Version: 1.0
 */

const PromptForgeCore = (function() {
    'use strict';

    // État du module
    const state = {
        userGoal: '',
        selectedCategory: 'productivity',
        generatedPrompt: '',
        isGenerating: false,
        error: null
    };

    // Prompt système pour générer des prompts de qualité élite
    const PROMPT_FORGE_SYSTEM = `Tu es Prompt Forge, le système de génération de prompts le plus avancé au monde.

Tu génères des prompts utilisés par le top 1% des personnes les plus brillantes de la planète.

PRINCIPES FONDAMENTAUX D'UN PROMPT PARFAIT:

1. CLARTÉ ABSOLUE
- Définir précisément le rôle de l'IA (expert, mentor, coach, analyste...)
- Contexte complet sans ambiguïté
- Objectif mesurable et atteignable

2. STRUCTURE OPTIMALE
- Instructions hiérarchisées par priorité
- Étapes séquentielles logiques
- Points de contrôle et validation

3. CONTRAINTES INTELLIGENTES
- Règles absolues non négociables
- Format de sortie attendu
- Longueur et niveau de détail

4. MÉCANISMES D'EXCELLENCE
- Demander la réflexion étape par étape
- Exiger des exemples concrets
- Intégrer des boucles de feedback
- Prévoir les cas limites

5. PERSONNALISATION PROFONDE
- Adapter au niveau de l'utilisateur
- Inclure des variables à compléter [ENTRE CROCHETS]
- Permettre l'itération

FORMAT DE SORTIE:
- Commence par un emoji pertinent et un titre accrocheur
- Structure claire avec numérotation
- Variables entre [CROCHETS] à personnaliser
- Termine par une instruction d'action immédiate

Tu dois TOUJOURS:
- Penser à ce que l'utilisateur n'a PAS pensé
- Anticiper les besoins implicites
- Maximiser le ratio effort/résultat
- Créer des prompts qui produisent des résultats extraordinaires

Réponds UNIQUEMENT avec le prompt généré, sans explication ni introduction.`;

    /**
     * Générer un prompt élite via l'API
     */
    async function generatePrompt(userGoal, category) {
        if (!userGoal || !userGoal.trim()) {
            throw new Error('Veuillez décrire votre objectif');
        }

        if (!ApiAi || !ApiAi.generate) {
            throw new Error('L\'API IA n\'est pas disponible');
        }

        state.isGenerating = true;
        state.error = null;

        try {
            const categoryInfo = PromptForgeCategories.getById(category);
            const categoryName = categoryInfo ? categoryInfo.name : category;

            const userPrompt = `Catégorie: ${categoryName}\n\nObjectif de l'utilisateur: ${userGoal}\n\nGénère le prompt parfait.`;

            // Appel à l'API via ApiAi.generate(prompt, system)
            const generatedPrompt = await ApiAi.generate(userPrompt, PROMPT_FORGE_SYSTEM);

            state.generatedPrompt = generatedPrompt;
            state.isGenerating = false;

            return {
                success: true,
                prompt: generatedPrompt
            };
        } catch (error) {
            state.isGenerating = false;
            state.error = error.message;

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Définir l'objectif utilisateur
     */
    function setUserGoal(goal) {
        state.userGoal = goal;
    }

    /**
     * Définir la catégorie sélectionnée
     */
    function setCategory(category) {
        state.selectedCategory = category;
    }

    /**
     * Réinitialiser l'état
     */
    function reset() {
        state.userGoal = '';
        state.generatedPrompt = '';
        state.error = null;
        state.isGenerating = false;
    }

    /**
     * Obtenir l'état actuel
     */
    function getState() {
        return { ...state };
    }

    return {
        generatePrompt,
        setUserGoal,
        setCategory,
        reset,
        getState,
        state // Expose pour lecture directe
    };
})();

// Export global
if (typeof window !== 'undefined') {
    window.PromptForgeCore = PromptForgeCore;
}
