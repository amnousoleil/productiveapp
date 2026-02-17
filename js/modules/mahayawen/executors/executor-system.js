// =============================================
// SYSTEM EXECUTOR
// Actions système (navigation, recherche globale, aide, etc.)
// =============================================

const SystemExecutor = {
    /**
     * Recherche globale dans toute l'application
     */
    async search(params) {
        const { query } = params;

        if (!query) throw new Error('Terme de recherche manquant');

        // Rechercher dans tous les modules
        const results = {
            tasks: [],
            notes: [],
            mails: [],
            deals: [],
            total: 0
        };

        try {
            // Tâches
            if (typeof ApiTasks !== 'undefined') {
                const tasks = await ApiTasks.getAll({ search: query });
                results.tasks = tasks.slice(0, 5);
            }

            // Notes
            if (typeof ApiNotes !== 'undefined') {
                const notes = await ApiNotes.search(query);
                results.notes = notes.slice(0, 5);
            }

            // CRM Deals
            if (typeof CRMApi !== 'undefined') {
                const deals = await CRMApi.listDeals({ search: query });
                const dealsArray = Array.isArray(deals.data) ? deals.data : deals;
                results.deals = dealsArray.slice(0, 5);
            }

            results.total = results.tasks.length + results.notes.length +
                            results.mails.length + results.deals.length;

            const summary = [];
            if (results.tasks.length) summary.push(`📋 ${results.tasks.length} tâches`);
            if (results.notes.length) summary.push(`📝 ${results.notes.length} notes`);
            if (results.mails.length) summary.push(`✉️ ${results.mails.length} emails`);
            if (results.deals.length) summary.push(`💼 ${results.deals.length} deals`);

            return {
                success: true,
                message: `🔍 Résultats pour "${query}" : ${summary.join(', ')}`,
                data: results,
                count: results.total
            };

        } catch (error) {
            console.error('[SystemExecutor] Search error:', error);
            throw error;
        }
    },

    /**
     * Affiche l'aide et la liste des commandes
     */
    async help(params = {}) {
        return {
            success: true,
            message: `📚 **Guide MahaYawen - Commandes disponibles**

**📋 TÂCHES**
• "Crée une tâche [titre]"
• "Marque [tâche] comme terminée"
• "Assigne [tâche] à [personne]"
• "Mets [tâche] en urgent"
• "Quelles tâches j'ai aujourd'hui ?"
• "Tâches en retard ?"

**✉️ EMAILS**
• "Envoie un mail à [personne] : [message]"
• "Emails envoyés aujourd'hui ?"
• "Sauvegarde ce brouillon"

**📝 NOTES**
• "Crée une note [titre]"
• "Cherche dans les notes [terme]"
• "Lie la note [A] avec [B]"

**📔 JOURNAL**
• "Note dans mon journal : [texte]"
• "Ajoute une victoire : [texte]"
• "Bloqueur : [texte]"

**📅 CALENDRIER**
• "Planifie un événement [titre] demain à 10h"
• "Événements de la semaine ?"

**🔍 SYSTÈME**
• "Recherche [terme]"
• "Aide" ou "/help"
• "Résume ma journée"

**Astuces :**
• Tape / pour voir les commandes slash
• @ pour mentionner des contacts
• Utilise des dates relatives : "demain", "la semaine prochaine"`,
            conversational: true
        };
    },

    /**
     * Résume l'activité de l'utilisateur
     */
    async summary(params = {}) {
        const { period = 'today' } = params;

        try {
            const stats = {
                tasks_completed: 0,
                tasks_pending: 0,
                mails_sent: 0,
                journal_entries: 0,
                time_active: '0h'
            };

            // Récupérer les statistiques
            if (typeof ApiTasks !== 'undefined') {
                const allTasks = await ApiTasks.getAll();
                stats.tasks_completed = allTasks.filter(t => t.status === 'completed').length;
                stats.tasks_pending = allTasks.filter(t => t.status !== 'completed').length;
            }

            if (typeof MailAPI !== 'undefined') {
                try {
                    const mails = await MailAPI.getSentMails();
                    const mailsArray = Array.isArray(mails.data) ? mails.data : mails;
                    stats.mails_sent = mailsArray.length;
                } catch (e) {
                    // Mail API peut ne pas être disponible
                }
            }

            if (typeof AppState !== 'undefined' && AppState.journal) {
                const today = new Date().toDateString();
                stats.journal_entries = AppState.journal.filter(e =>
                    new Date(e.date).toDateString() === today
                ).length;
            }

            return {
                success: true,
                message: `📊 **Résumé de votre ${period === 'today' ? 'journée' : 'période'}**

• ✅ Tâches complétées : ${stats.tasks_completed}
• 📋 Tâches en cours : ${stats.tasks_pending}
• ✉️ Emails envoyés : ${stats.mails_sent}
• 📔 Entrées journal : ${stats.journal_entries}

${stats.tasks_completed > 5 ? '🔥 Belle productivité !' : '💪 Continue comme ça !'}`,
                data: stats
            };

        } catch (error) {
            console.error('[SystemExecutor] Summary error:', error);
            throw error;
        }
    },

    /**
     * Navigue vers une vue
     */
    async navigate(params) {
        const { view } = params;

        if (!view) throw new Error('Vue cible manquante');

        // Utiliser le router existant de l'app
        if (typeof ViewRouter !== 'undefined' && ViewRouter.navigate) {
            ViewRouter.navigate(view);
            return {
                success: true,
                message: `📍 Navigation vers ${view}`
            };
        }

        throw new Error('Router de navigation non disponible');
    },

    /**
     * État de l'application
     */
    async status(params = {}) {
        const status = {
            user: AppState?.currentUser?.name || 'Inconnu',
            online: navigator.onLine,
            modules: {
                tasks: typeof ApiTasks !== 'undefined',
                notes: typeof ApiNotes !== 'undefined',
                mail: typeof MailAPI !== 'undefined',
                calendar: typeof CalendarApi !== 'undefined',
                crm: typeof CRMApi !== 'undefined'
            }
        };

        const activeModules = Object.entries(status.modules)
            .filter(([_, active]) => active)
            .map(([name, _]) => name)
            .join(', ');

        return {
            success: true,
            message: `ℹ️ **État de l'application**

👤 Utilisateur : ${status.user}
${status.online ? '🟢' : '🔴'} Connexion : ${status.online ? 'En ligne' : 'Hors ligne'}
📦 Modules actifs : ${activeModules}`,
            data: status
        };
    }
};

// Exposer globalement
if (typeof window !== 'undefined') {
    window.SystemExecutor = SystemExecutor;
}
