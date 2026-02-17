// =============================================
// JOURNAL EXECUTOR
// Exécute toutes les actions liées au journal
// =============================================

const JournalExecutor = {
    /**
     * Charge le journal
     */
    async load(params = {}) {
        const fn = MahayawenApiMap.journal.load.fn();
        const journal = await fn();

        return {
            success: true,
            message: `📔 Journal chargé`,
            data: journal,
            count: journal?.length || 0
        };
    },

    /**
     * Ajoute une entrée au journal
     */
    async add(params) {
        const { text, category, energy, mood } = params;

        if (!text) throw new Error('Texte de l\'entrée obligatoire');

        // Catégories valides: task, idea, reflection, blocker, win
        const validCategories = ['task', 'idea', 'reflection', 'blocker', 'win'];
        const finalCategory = category && validCategories.includes(category.toLowerCase())
            ? category.toLowerCase()
            : this.detectCategory(text);

        // Énergie: 1 (basse), 2 (normale), 3 (haute)
        const finalEnergy = energy || this.detectEnergy(text);

        // Appeler l'API Journal
        const fn = MahayawenApiMap.journal.add.fn();
        await fn(finalCategory, text, finalEnergy);

        const categoryEmojis = {
            task: '✅',
            idea: '💡',
            reflection: '🤔',
            blocker: '🚧',
            win: '🏆'
        };

        return {
            success: true,
            message: `${categoryEmojis[finalCategory]} Entrée ajoutée au journal`,
            category: finalCategory,
            energy: finalEnergy,
            text: text.substring(0, 100) + (text.length > 100 ? '...' : '')
        };
    },

    /**
     * Rafraîchit l'affichage du journal
     */
    async render(params = {}) {
        const fn = MahayawenApiMap.journal.render.fn();
        fn(); // Synchrone, pas de retour

        return {
            success: true,
            message: `🔄 Journal rafraîchi`
        };
    },

    /**
     * Détecte automatiquement la catégorie à partir du texte
     */
    detectCategory(text) {
        const lowerText = text.toLowerCase();

        // Wins
        if (lowerText.includes('terminé') || lowerText.includes('fini') || lowerText.includes('réussi') ||
            lowerText.includes('victoire') || lowerText.includes('gagné') || lowerText.includes('succès')) {
            return 'win';
        }

        // Blockers
        if (lowerText.includes('bloqué') || lowerText.includes('problème') || lowerText.includes('bug') ||
            lowerText.includes('erreur') || lowerText.includes('coincé') || lowerText.includes('difficile')) {
            return 'blocker';
        }

        // Ideas
        if (lowerText.includes('idée') || lowerText.includes('penser') || lowerText.includes('peut-être') ||
            lowerText.includes('essayer') || lowerText.includes('améliorer') || lowerText.startsWith('et si')) {
            return 'idea';
        }

        // Reflections
        if (lowerText.includes('réflex') || lowerText.includes('apprendre') || lowerText.includes('leçon') ||
            lowerText.includes('comprendre') || lowerText.includes('noter') || lowerText.includes('important')) {
            return 'reflection';
        }

        // Task par défaut
        return 'task';
    },

    /**
     * Détecte automatiquement le niveau d'énergie à partir du texte
     */
    detectEnergy(text) {
        const lowerText = text.toLowerCase();

        // Haute énergie (3)
        if (lowerText.includes('super') || lowerText.includes('excellent') || lowerText.includes('génial') ||
            lowerText.includes('!') || lowerText.includes('🔥') || lowerText.includes('⚡')) {
            return 3;
        }

        // Basse énergie (1)
        if (lowerText.includes('fatigué') || lowerText.includes('difficile') || lowerText.includes('lent') ||
            lowerText.includes('dur') || lowerText.includes('épuisé') || lowerText.includes('...')) {
            return 1;
        }

        // Normale (2) par défaut
        return 2;
    }
};

// Exposer globalement
if (typeof window !== 'undefined') {
    window.JournalExecutor = JournalExecutor;
}
