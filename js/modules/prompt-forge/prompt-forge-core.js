/**
 * PROMPT FORGE - CORE v2.0
 * ProductiveApp - Logique principale + auto-détection catégorie IA
 * Version: 2.0
 */

const PromptForgeCore = (function() {
    'use strict';

    // État du module
    const state = {
        userGoal: '',
        detectedCategory: '',   // Catégorie auto-détectée par l'IA
        generatedPrompt: '',
        isGenerating: false,
        error: null
    };

    // Prompt système : génère un prompt élite + détecte la catégorie automatiquement
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

FORMAT DE SORTIE STRICT — RESPECTER EXACTEMENT:
Ligne 1: CATEGORY: [1 à 3 mots en français décrivant la thématique]
Lignes suivantes: le prompt complet généré

Exemples de CATEGORY valides: Marketing Digital, Psychologie, Finance Personnelle,
Développement Web, Créativité, Apprentissage, Santé & Bien-être, Productivité,
Communication, Stratégie, Analyse de Données, Leadership, etc.

NE METS RIEN avant "CATEGORY:". Commence TOUJOURS par cette ligne.

Le prompt doit:
- Commencer par un emoji pertinent et un titre accrocheur
- Avoir une structure claire avec numérotation
- Contenir des variables entre [CROCHETS] à personnaliser
- Se terminer par une instruction d'action immédiate
- Anticiper les besoins implicites de l'utilisateur
- Maximiser le ratio effort/résultat`;

    /**
     * Générer un prompt élite via l'API + détecter la catégorie
     */
    async function generatePrompt(userGoal, _ignored) {
        if (!userGoal || !userGoal.trim()) {
            throw new Error('Veuillez décrire votre objectif');
        }

        if (!ApiAi || !ApiAi.generate) {
            throw new Error('L\'API IA n\'est pas disponible');
        }

        state.isGenerating = true;
        state.error = null;

        try {
            const userPrompt = `Objectif de l'utilisateur: ${userGoal}\n\nGénère le prompt parfait en respectant le format CATEGORY: [catégorie] puis le prompt.`;

            const raw = await ApiAi.generate(userPrompt, PROMPT_FORGE_SYSTEM);

            // Parser CATEGORY: sur la première ligne
            const lines = (raw || '').trim().split('\n');
            let detectedCategory = 'Général';
            let promptText = raw;

            if (lines.length > 1 && lines[0].trim().toUpperCase().startsWith('CATEGORY:')) {
                const catPart = lines[0].split(':').slice(1).join(':').trim();
                if (catPart) detectedCategory = catPart;
                promptText = lines.slice(1).join('\n').trim();
            }

            state.detectedCategory = detectedCategory;
            state.generatedPrompt = promptText;
            state.isGenerating = false;

            return { success: true, prompt: promptText, category: detectedCategory };
        } catch (error) {
            state.isGenerating = false;
            state.error = error.message;
            return { success: false, error: error.message };
        }
    }

    /**
     * Définir l'objectif utilisateur
     */
    function setUserGoal(goal) {
        state.userGoal = goal;
    }

    /**
     * Charger un prompt existant depuis la bibliothèque (bouton Utiliser)
     */
    function loadFromLibrary(promptData) {
        state.userGoal = promptData.userGoal || '';
        state.generatedPrompt = promptData.prompt || '';
        state.detectedCategory = promptData.category || '';
        state.error = null;
    }

    /**
     * Réinitialiser l'état
     */
    function reset() {
        state.userGoal = '';
        state.generatedPrompt = '';
        state.detectedCategory = '';
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
        loadFromLibrary,
        reset,
        getState,
        state
    };
})();

// Export global
if (typeof window !== 'undefined') {
    window.PromptForgeCore = PromptForgeCore;
}
