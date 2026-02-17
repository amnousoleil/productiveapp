// =============================================
// CHAT EXECUTOR
// Gère les réponses conversationnelles (pas d'action)
// =============================================

const ChatExecutor = {
    /**
     * Répond de manière conversationnelle
     * Utilisé quand l'utilisateur ne demande pas d'action spécifique
     */
    async respond(params) {
        const { message, context } = params;

        // Pour l'instant, réponse simple
        // TODO: Intégrer vraiment l'IA Claude pour des réponses intelligentes

        return {
            success: true,
            message: this.generateResponse(message, context),
            conversational: true
        };
    },

    /**
     * Génère une réponse basique
     * (Sera remplacé par vraie IA plus tard)
     */
    generateResponse(message, context) {
        const lowerMsg = message.toLowerCase();

        // Salutations
        if (lowerMsg.match(/^(salut|bonjour|hello|hey|coucou)/)) {
            const greetings = [
                'Salut ! Comment puis-je t\'aider ?',
                'Hey ! Que puis-je faire pour toi ?',
                'Bonjour ! Prêt à être productif ?',
                'Coucou ! Dis-moi ce que tu veux accomplir !'
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        }

        // Remerciements
        if (lowerMsg.match(/(merci|thanks|thx)/)) {
            const thanks = [
                'De rien ! 😊',
                'Avec plaisir !',
                'Toujours là pour t\'aider ! 💪',
                'C\'est mon job ! ⚡'
            ];
            return thanks[Math.floor(Math.random() * thanks.length)];
        }

        // Comment ça va ?
        if (lowerMsg.match(/(comment|ça va|how are you)/)) {
            return 'Je suis en pleine forme ! Prêt à t\'aider à accomplir tes tâches 🚀';
        }

        // Questions sur les capacités
        if (lowerMsg.match(/(que peux|what can|aide|help|capable)/)) {
            return `Je peux t'aider avec :
📋 Tâches (créer, modifier, assigner)
✉️ Emails (envoyer, gérer brouillons)
📝 Notes (créer, chercher)
📔 Journal (ajouter des entrées)
📅 Calendrier (créer événements)
💼 CRM (gérer deals)

Essaie par exemple : "Crée une tâche urgente" ou "Envoie un mail à..."`;
        }

        // Réponse par défaut
        return `Je n'ai pas bien compris. Peux-tu reformuler ?

Essaie une commande comme :
• "Crée une tâche..."
• "Envoie un mail à..."
• "Ajoute au journal..."
• Ou tape /help pour voir toutes les commandes`;
    }
};

// Exposer globalement
if (typeof window !== 'undefined') {
    window.ChatExecutor = ChatExecutor;
}
