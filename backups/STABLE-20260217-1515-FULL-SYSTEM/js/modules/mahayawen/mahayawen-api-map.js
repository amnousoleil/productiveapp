// =============================================
// MAHAYAWEN API MAP
// Cartographie COMPLÈTE de toutes les fonctions de ProductiveApp
// =============================================
// Ce fichier est le PONT entre MahaYawen et l'application.
// MahaYawen NE réimplémente AUCUNE logique - il APPELLE ces fonctions.
// Si une fonction change, MahaYawen suit automatiquement.
// =============================================

const MahayawenApiMap = {
    /**
     * ===================================
     * TASKS - 17 fonctions (ApiTasks)
     * ===================================
     */
    task: {
        // Lecture
        getAll: {
            fn: () => ApiTasks.getAll,
            params: ['filters'],
            description: 'Récupérer toutes les tâches avec filtres optionnels'
        },
        getById: {
            fn: () => ApiTasks.getById,
            params: ['taskId'],
            required: ['taskId'],
            description: 'Récupérer une tâche par ID'
        },
        getDueSoon: {
            fn: () => ApiTasks.getDueSoon,
            params: [],
            description: 'Tâches avec échéance dans les 7 prochains jours'
        },
        getOverdue: {
            fn: () => ApiTasks.getOverdue,
            params: [],
            description: 'Tâches en retard'
        },

        // Création & Modification
        create: {
            fn: () => ApiTasks.create,
            params: ['data'],
            required: ['data'],
            description: 'Créer une nouvelle tâche',
            example: { title: 'Ma tâche', priority: 'high', due_date: '2026-02-20' }
        },
        update: {
            fn: () => ApiTasks.update,
            params: ['taskId', 'data'],
            required: ['taskId', 'data'],
            description: 'Mettre à jour une tâche'
        },
        complete: {
            fn: () => ApiTasks.complete,
            params: ['taskId'],
            required: ['taskId'],
            description: 'Marquer une tâche comme terminée'
        },
        reopen: {
            fn: () => ApiTasks.reopen,
            params: ['taskId'],
            required: ['taskId'],
            description: 'Réouvrir une tâche terminée'
        },

        // Suppression (REQUIERT CONFIRMATION)
        remove: {
            fn: () => ApiTasks.remove,
            params: ['taskId'],
            required: ['taskId'],
            confirmation: true,
            description: 'Supprimer une tâche'
        },

        // Commentaires
        getComments: {
            fn: () => ApiTasks.getComments,
            params: ['taskId'],
            required: ['taskId'],
            description: 'Récupérer les commentaires d\'une tâche'
        },
        addComment: {
            fn: () => ApiTasks.addComment,
            params: ['taskId', 'content'],
            required: ['taskId', 'content'],
            description: 'Ajouter un commentaire'
        },
        deleteComment: {
            fn: () => ApiTasks.deleteComment,
            params: ['taskId', 'commentId'],
            required: ['taskId', 'commentId'],
            confirmation: true,
            description: 'Supprimer un commentaire'
        },

        // Sous-tâches
        getSubtasks: {
            fn: () => ApiTasks.getSubtasks,
            params: ['taskId'],
            required: ['taskId'],
            description: 'Récupérer les sous-tâches'
        },
        createSubtask: {
            fn: () => ApiTasks.createSubtask,
            params: ['taskId', 'data'],
            required: ['taskId', 'data'],
            description: 'Créer une sous-tâche'
        },

        // Actions rapides
        assign: {
            fn: () => ApiTasks.assign,
            params: ['taskId', 'userId'],
            required: ['taskId', 'userId'],
            description: 'Assigner une tâche à un utilisateur'
        },
        unassign: {
            fn: () => ApiTasks.unassign,
            params: ['taskId'],
            required: ['taskId'],
            description: 'Retirer l\'assignation'
        },
        setPriority: {
            fn: () => ApiTasks.setPriority,
            params: ['taskId', 'priority'],
            required: ['taskId', 'priority'],
            description: 'Définir la priorité (low, medium, high, urgent)'
        },
        setDueDate: {
            fn: () => ApiTasks.setDueDate,
            params: ['taskId', 'dueDate'],
            required: ['taskId', 'dueDate'],
            description: 'Définir la date d\'échéance'
        }
    },

    /**
     * ===================================
     * NOTES - 15 fonctions (ApiNotes)
     * ===================================
     */
    note: {
        // Lecture
        getAll: {
            fn: () => ApiNotes.getAll,
            params: ['filters'],
            description: 'Récupérer toutes les notes'
        },
        getById: {
            fn: () => ApiNotes.getById,
            params: ['noteId'],
            required: ['noteId'],
            description: 'Récupérer une note par ID'
        },
        search: {
            fn: () => ApiNotes.search,
            params: ['query'],
            required: ['query'],
            description: 'Rechercher dans les notes'
        },
        getDeleted: {
            fn: () => ApiNotes.getDeleted,
            params: [],
            description: 'Récupérer les notes supprimées (corbeille)'
        },

        // Création & Modification
        create: {
            fn: () => ApiNotes.create,
            params: ['data'],
            required: ['data'],
            description: 'Créer une nouvelle note',
            example: { title: 'Ma note', content: 'Contenu...', tags: ['important'] }
        },
        update: {
            fn: () => ApiNotes.update,
            params: ['noteId', 'data'],
            required: ['noteId', 'data'],
            description: 'Mettre à jour une note'
        },
        togglePin: {
            fn: () => ApiNotes.togglePin,
            params: ['noteId'],
            required: ['noteId'],
            description: 'Épingler/désépingler une note'
        },

        // Suppression
        remove: {
            fn: () => ApiNotes.remove,
            params: ['noteId'],
            required: ['noteId'],
            confirmation: true,
            description: 'Supprimer une note (soft delete)'
        },
        permanentDelete: {
            fn: () => ApiNotes.permanentDelete,
            params: ['noteId'],
            required: ['noteId'],
            confirmation: true,
            description: 'Supprimer définitivement une note'
        },
        restore: {
            fn: () => ApiNotes.restore,
            params: ['noteId'],
            required: ['noteId'],
            description: 'Restaurer une note supprimée'
        },

        // Versions
        getVersions: {
            fn: () => ApiNotes.getVersions,
            params: ['noteId'],
            required: ['noteId'],
            description: 'Récupérer l\'historique des versions'
        },
        restoreVersion: {
            fn: () => ApiNotes.restoreVersion,
            params: ['noteId', 'versionId'],
            required: ['noteId', 'versionId'],
            description: 'Restaurer une version spécifique'
        },

        // Liens entre notes
        link: {
            fn: () => ApiNotes.link,
            params: ['sourceNoteId', 'targetNoteId'],
            required: ['sourceNoteId', 'targetNoteId'],
            description: 'Lier deux notes'
        },
        unlink: {
            fn: () => ApiNotes.unlink,
            params: ['sourceNoteId', 'targetNoteId'],
            required: ['sourceNoteId', 'targetNoteId'],
            description: 'Délier deux notes'
        },
        getLinks: {
            fn: () => ApiNotes.getLinks,
            params: ['noteId'],
            required: ['noteId'],
            description: 'Récupérer les notes liées'
        }
    },

    /**
     * ===================================
     * MAIL - 13 fonctions (MailAPI)
     * ===================================
     */
    mail: {
        // Envoi
        send: {
            fn: () => MailAPI.send,
            params: ['mailData'],
            required: ['mailData'],
            description: 'Envoyer un email',
            example: { to: 'user@example.com', subject: 'Sujet', body: 'Corps...' }
        },
        getSentMails: {
            fn: () => MailAPI.getSentMails,
            params: ['filters'],
            description: 'Récupérer les emails envoyés'
        },
        getMailById: {
            fn: () => MailAPI.getMailById,
            params: ['mailId'],
            required: ['mailId'],
            description: 'Récupérer un email par ID'
        },

        // Brouillons
        saveDraft: {
            fn: () => MailAPI.saveDraft,
            params: ['draftData'],
            required: ['draftData'],
            description: 'Sauvegarder un brouillon'
        },
        getDrafts: {
            fn: () => MailAPI.getDrafts,
            params: [],
            description: 'Récupérer les brouillons'
        },
        deleteDraft: {
            fn: () => MailAPI.deleteDraft,
            params: ['draftId'],
            required: ['draftId'],
            confirmation: true,
            description: 'Supprimer un brouillon'
        },

        // Templates
        createTemplate: {
            fn: () => MailAPI.createTemplate,
            params: ['templateData'],
            required: ['templateData'],
            description: 'Créer un template d\'email'
        },
        getTemplates: {
            fn: () => MailAPI.getTemplates,
            params: [],
            description: 'Récupérer les templates'
        },
        getTemplateById: {
            fn: () => MailAPI.getTemplateById,
            params: ['templateId'],
            required: ['templateId'],
            description: 'Récupérer un template par ID'
        },
        updateTemplate: {
            fn: () => MailAPI.updateTemplate,
            params: ['templateId', 'templateData'],
            required: ['templateId', 'templateData'],
            description: 'Mettre à jour un template'
        },
        deleteTemplate: {
            fn: () => MailAPI.deleteTemplate,
            params: ['templateId'],
            required: ['templateId'],
            confirmation: true,
            description: 'Supprimer un template'
        },

        // Statistiques
        getStats: {
            fn: () => MailAPI.getStats,
            params: [],
            description: 'Récupérer les statistiques des emails'
        },
        checkConfig: {
            fn: () => MailAPI.checkConfig,
            params: [],
            description: 'Vérifier la configuration Resend'
        }
    },

    /**
     * ===================================
     * JOURNAL - 3 fonctions (Journal)
     * ===================================
     */
    journal: {
        load: {
            fn: () => Journal.load,
            params: [],
            description: 'Charger le journal depuis l\'API'
        },
        add: {
            fn: () => Journal.add,
            params: ['category', 'text', 'energy'],
            required: ['category', 'text'],
            description: 'Ajouter une entrée au journal',
            example: { category: 'win', text: 'Grosse session productive', energy: 3 }
        },
        render: {
            fn: () => Journal.render,
            params: [],
            description: 'Rafraîchir l\'affichage du journal'
        }
    },

    /**
     * ===================================
     * CALENDAR - 7 fonctions (CalendarApi)
     * ===================================
     */
    calendar: {
        listEvents: {
            fn: () => CalendarApi.listEvents,
            params: ['startDate', 'endDate', 'options'],
            required: ['startDate', 'endDate'],
            description: 'Lister les événements entre deux dates'
        },
        getUpcoming: {
            fn: () => CalendarApi.getUpcoming,
            params: ['days'],
            description: 'Récupérer les événements à venir (défaut: 7 jours)'
        },
        createEvent: {
            fn: () => CalendarApi.createEvent,
            params: ['data'],
            required: ['data'],
            description: 'Créer un nouvel événement',
            example: { title: 'Meeting', start_date: '2026-02-20T10:00', end_date: '2026-02-20T11:00' }
        },
        updateEvent: {
            fn: () => CalendarApi.updateEvent,
            params: ['eventId', 'data'],
            required: ['eventId', 'data'],
            description: 'Mettre à jour un événement'
        },
        deleteEvent: {
            fn: () => CalendarApi.deleteEvent,
            params: ['eventId'],
            required: ['eventId'],
            confirmation: true,
            description: 'Supprimer un événement'
        },
        syncTasks: {
            fn: () => CalendarApi.syncTasks,
            params: [],
            description: 'Synchroniser les tâches avec le calendrier'
        },
        syncInvoices: {
            fn: () => CalendarApi.syncInvoices,
            params: [],
            description: 'Synchroniser les factures avec le calendrier'
        }
    },

    /**
     * ===================================
     * CRM/CONTACTS - 12 fonctions (CRMApi)
     * ===================================
     */
    crm: {
        // Pipelines
        getPipelines: {
            fn: () => CRMApi.getPipelines,
            params: [],
            description: 'Récupérer les pipelines CRM'
        },
        createPipeline: {
            fn: () => CRMApi.createPipeline,
            params: ['data'],
            required: ['data'],
            description: 'Créer un nouveau pipeline'
        },
        updatePipeline: {
            fn: () => CRMApi.updatePipeline,
            params: ['pipelineId', 'data'],
            required: ['pipelineId', 'data'],
            description: 'Mettre à jour un pipeline'
        },

        // Deals
        listDeals: {
            fn: () => CRMApi.listDeals,
            params: ['filters'],
            description: 'Lister les deals avec filtres optionnels'
        },
        getDeal: {
            fn: () => CRMApi.getDeal,
            params: ['dealId'],
            required: ['dealId'],
            description: 'Récupérer un deal par ID'
        },
        createDeal: {
            fn: () => CRMApi.createDeal,
            params: ['data'],
            required: ['data'],
            description: 'Créer un nouveau deal'
        },
        updateDeal: {
            fn: () => CRMApi.updateDeal,
            params: ['dealId', 'data'],
            required: ['dealId', 'data'],
            description: 'Mettre à jour un deal'
        },
        deleteDeal: {
            fn: () => CRMApi.deleteDeal,
            params: ['dealId'],
            required: ['dealId'],
            confirmation: true,
            description: 'Supprimer un deal'
        },
        moveDeal: {
            fn: () => CRMApi.moveDeal,
            params: ['dealId', 'stage', 'probability'],
            required: ['dealId', 'stage'],
            description: 'Déplacer un deal vers un autre stage'
        },
        convertDeal: {
            fn: () => CRMApi.convertDeal,
            params: ['dealId'],
            required: ['dealId'],
            description: 'Convertir un deal en client'
        },
        getDealBoard: {
            fn: () => CRMApi.getDealBoard,
            params: [],
            description: 'Récupérer le board complet des deals'
        },

        // Activités
        listActivities: {
            fn: () => CRMApi.listActivities,
            params: ['dealId'],
            required: ['dealId'],
            description: 'Lister les activités d\'un deal'
        },
        addActivity: {
            fn: () => CRMApi.addActivity,
            params: ['dealId', 'data'],
            required: ['dealId', 'data'],
            description: 'Ajouter une activité à un deal'
        }
    },

    /**
     * ===================================
     * UTILITAIRES
     * ===================================
     */
    utils: {
        /**
         * Résoudre un nom de contact vers son ID/email
         */
        resolveContact(nameOrEmail) {
            // Si c'est déjà un email, retourner tel quel
            if (typeof nameOrEmail === 'string' && nameOrEmail.includes('@')) {
                return Promise.resolve(nameOrEmail);
            }

            // Chercher dans les membres de l'équipe (AppConfig.USERS)
            if (typeof AppConfig !== 'undefined' && AppConfig.USERS) {
                const member = AppConfig.USERS.find(u =>
                    u.name.toLowerCase().includes(nameOrEmail.toLowerCase())
                );
                if (member) return Promise.resolve(member.id);
            }

            // TODO: Chercher dans les contacts CRM
            return Promise.reject(new Error(`Contact "${nameOrEmail}" introuvable`));
        },

        /**
         * Parser une date relative ("demain", "la semaine prochaine", etc.)
         */
        parseRelativeDate(dateStr) {
            const today = new Date();
            const lowerStr = dateStr.toLowerCase();

            if (lowerStr.includes('aujourd\'hui') || lowerStr === 'today') {
                return today.toISOString().split('T')[0];
            }
            if (lowerStr.includes('demain') || lowerStr === 'tomorrow') {
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                return tomorrow.toISOString().split('T')[0];
            }
            if (lowerStr.includes('semaine prochaine') || lowerStr === 'next week') {
                const nextWeek = new Date(today);
                nextWeek.setDate(nextWeek.getDate() + 7);
                return nextWeek.toISOString().split('T')[0];
            }

            // Si format déjà ISO ou standard, retourner tel quel
            return dateStr;
        },

        /**
         * Formater une priorité textuelle vers enum
         */
        parsePriority(priorityStr) {
            const lowerStr = priorityStr.toLowerCase();
            if (lowerStr.includes('urgent')) return 'urgent';
            if (lowerStr.includes('high') || lowerStr.includes('haute') || lowerStr.includes('élevé')) return 'high';
            if (lowerStr.includes('low') || lowerStr.includes('basse') || lowerStr.includes('faible')) return 'low';
            return 'medium';
        }
    }
};

// Exposer globalement
if (typeof window !== 'undefined') {
    window.MahayawenApiMap = MahayawenApiMap;
}
