// =============================================
// MAHAYAWEN ACTION REGISTRY
// Registre complet de TOUTES les actions possibles dans ProductiveApp
// Version 2.0 - Agent Autonome
// =============================================

const MahayawenActionRegistry = {
    /**
     * TASKS ACTIONS (17)
     */
    TASKS: {
        CREATE: {
            id: 'task.create',
            description: 'Créer une nouvelle tâche',
            api: 'ApiTasks.create',
            params: ['title', 'projectId?', 'priority?', 'dueDate?'],
            keywords: ['créer tâche', 'nouvelle tâche', 'ajouter tâche', 'task'],
            examples: ['Crée une tâche "Appeler client"', 'Ajoute une tâche urgente pour demain'],
            requiresConfirmation: false
        },
        UPDATE: {
            id: 'task.update',
            description: 'Modifier une tâche existante',
            api: 'ApiTasks.update',
            params: ['taskId', 'updates'],
            keywords: ['modifier tâche', 'changer tâche', 'éditer tâche'],
            examples: ['Modifie la tâche "Rapport" pour la rendre urgente'],
            requiresConfirmation: false
        },
        DELETE: {
            id: 'task.delete',
            description: 'Supprimer une tâche',
            api: 'ApiTasks.remove',
            params: ['taskId'],
            keywords: ['supprimer tâche', 'effacer tâche', 'enlever tâche', 'delete task'],
            examples: ['Supprime la tâche "Test"'],
            requiresConfirmation: true
        },
        COMPLETE: {
            id: 'task.complete',
            description: 'Marquer une tâche comme terminée',
            api: 'ApiTasks.complete',
            params: ['taskId'],
            keywords: ['terminer', 'finir', 'compléter', 'done', 'fait'],
            examples: ['Marque "Rapport mensuel" comme fait', 'Termine la tâche urgente'],
            requiresConfirmation: false
        },
        REOPEN: {
            id: 'task.reopen',
            description: 'Réouvrir une tâche terminée',
            api: 'ApiTasks.reopen',
            params: ['taskId'],
            keywords: ['réouvrir', 'rouvrir', 'reopen'],
            examples: ['Réouvre la tâche "Vérification"'],
            requiresConfirmation: false
        },
        ASSIGN: {
            id: 'task.assign',
            description: 'Assigner une tâche à un membre',
            api: 'ApiTasks.assign',
            params: ['taskId', 'userId'],
            keywords: ['assigner', 'attribuer', 'déléguer', 'assign'],
            examples: ['Assigne "Rapport" à Marie', 'Délègue cette tâche à Jean'],
            requiresConfirmation: false
        },
        UNASSIGN: {
            id: 'task.unassign',
            description: 'Retirer l\'assignation d\'une tâche',
            api: 'ApiTasks.unassign',
            params: ['taskId'],
            keywords: ['désassigner', 'retirer assignation'],
            examples: ['Retire l\'assignation de cette tâche'],
            requiresConfirmation: false
        },
        SET_PRIORITY: {
            id: 'task.setPriority',
            description: 'Définir la priorité d\'une tâche',
            api: 'ApiTasks.setPriority',
            params: ['taskId', 'priority'],
            keywords: ['priorité', 'urgent', 'important', 'priority'],
            examples: ['Mets "Appel client" en urgent', 'Change la priorité à normale'],
            requiresConfirmation: false
        },
        SET_DUE_DATE: {
            id: 'task.setDueDate',
            description: 'Définir la date d\'échéance',
            api: 'ApiTasks.setDueDate',
            params: ['taskId', 'dueDate'],
            keywords: ['échéance', 'deadline', 'pour', 'avant'],
            examples: ['Mets l\'échéance à demain', 'Cette tâche pour vendredi'],
            requiresConfirmation: false
        },
        ADD_COMMENT: {
            id: 'task.addComment',
            description: 'Ajouter un commentaire',
            api: 'ApiTasks.addComment',
            params: ['taskId', 'content'],
            keywords: ['commenter', 'ajouter note', 'annoter'],
            examples: ['Ajoute un commentaire "Urgent client"'],
            requiresConfirmation: false
        },
        CREATE_SUBTASK: {
            id: 'task.createSubtask',
            description: 'Créer une sous-tâche',
            api: 'ApiTasks.createSubtask',
            params: ['taskId', 'subtaskData'],
            keywords: ['sous-tâche', 'subtask', 'découper'],
            examples: ['Crée 3 sous-tâches pour cette tâche'],
            requiresConfirmation: false
        },
        GET_DUE_SOON: {
            id: 'task.getDueSoon',
            description: 'Voir les tâches qui arrivent à échéance',
            api: 'ApiTasks.getDueSoon',
            params: [],
            keywords: ['échéances proches', 'bientôt', 'cette semaine'],
            examples: ['Quelles tâches arrivent bientôt à échéance ?'],
            requiresConfirmation: false
        },
        GET_OVERDUE: {
            id: 'task.getOverdue',
            description: 'Voir les tâches en retard',
            api: 'ApiTasks.getOverdue',
            params: [],
            keywords: ['retard', 'en retard', 'overdue', 'passées'],
            examples: ['Montre-moi les tâches en retard'],
            requiresConfirmation: false
        },
        REORDER: {
            id: 'task.reorder',
            description: 'Réorganiser l\'ordre des tâches',
            api: 'ApiTasks.reorder',
            params: ['taskIds'],
            keywords: ['réorganiser', 'trier', 'ordonner'],
            examples: ['Trie par priorité'],
            requiresConfirmation: false
        }
    },

    /**
     * NOTES ACTIONS (14)
     */
    NOTES: {
        CREATE: {
            id: 'note.create',
            description: 'Créer une nouvelle note',
            api: 'ApiNotes.create',
            params: ['title', 'content?', 'tags?'],
            keywords: ['créer note', 'nouvelle note', 'écrire note', 'note'],
            examples: ['Crée une note "Idées projet"', 'Note rapide sur la réunion'],
            requiresConfirmation: false
        },
        UPDATE: {
            id: 'note.update',
            description: 'Modifier une note',
            api: 'ApiNotes.update',
            params: ['noteId', 'updates'],
            keywords: ['modifier note', 'éditer note', 'changer note'],
            examples: ['Modifie ma note de réunion'],
            requiresConfirmation: false
        },
        DELETE: {
            id: 'note.delete',
            description: 'Supprimer une note',
            api: 'ApiNotes.remove',
            params: ['noteId'],
            keywords: ['supprimer note', 'effacer note', 'delete note'],
            examples: ['Supprime la note "Brouillon"'],
            requiresConfirmation: true
        },
        TOGGLE_PIN: {
            id: 'note.togglePin',
            description: 'Épingler/désépingler une note',
            api: 'ApiNotes.togglePin',
            params: ['noteId'],
            keywords: ['épingler', 'pin', 'fixer'],
            examples: ['Épingle cette note importante'],
            requiresConfirmation: false
        },
        LINK: {
            id: 'note.link',
            description: 'Lier deux notes ensemble',
            api: 'ApiNotes.link',
            params: ['sourceNoteId', 'targetNoteId'],
            keywords: ['lier notes', 'connecter', 'relier'],
            examples: ['Lie cette note à "Projet X"'],
            requiresConfirmation: false
        },
        SEARCH: {
            id: 'note.search',
            description: 'Rechercher dans les notes',
            api: 'ApiNotes.search',
            params: ['query'],
            keywords: ['chercher note', 'trouver note', 'recherche'],
            examples: ['Cherche les notes contenant "client"', 'Trouve mes notes de réunion'],
            requiresConfirmation: false
        },
        RESTORE: {
            id: 'note.restore',
            description: 'Restaurer une note supprimée',
            api: 'ApiNotes.restore',
            params: ['noteId'],
            keywords: ['restaurer note', 'récupérer note'],
            examples: ['Restaure la dernière note supprimée'],
            requiresConfirmation: false
        }
    },

    /**
     * PROJECTS ACTIONS (12)
     */
    PROJECTS: {
        CREATE: {
            id: 'project.create',
            description: 'Créer un nouveau projet',
            api: 'ApiProjects.create',
            params: ['name', 'description?', 'color?', 'icon?'],
            keywords: ['créer projet', 'nouveau projet', 'project'],
            examples: ['Crée un projet "Refonte site web"', 'Nouveau projet marketing'],
            requiresConfirmation: false
        },
        UPDATE: {
            id: 'project.update',
            description: 'Modifier un projet',
            api: 'ApiProjects.update',
            params: ['projectId', 'updates'],
            keywords: ['modifier projet', 'éditer projet', 'changer projet'],
            examples: ['Change la couleur du projet'],
            requiresConfirmation: false
        },
        DELETE: {
            id: 'project.delete',
            description: 'Supprimer un projet',
            api: 'ApiProjects.remove',
            params: ['projectId'],
            keywords: ['supprimer projet', 'effacer projet'],
            examples: ['Supprime le projet "Test"'],
            requiresConfirmation: true
        },
        ARCHIVE: {
            id: 'project.archive',
            description: 'Archiver un projet terminé',
            api: 'ApiProjects.archive',
            params: ['projectId'],
            keywords: ['archiver', 'archive', 'clore'],
            examples: ['Archive le projet terminé'],
            requiresConfirmation: false
        },
        RESTORE: {
            id: 'project.restore',
            description: 'Restaurer un projet archivé',
            api: 'ApiProjects.restore',
            params: ['projectId'],
            keywords: ['restaurer projet', 'rouvrir projet'],
            examples: ['Restaure le projet archivé'],
            requiresConfirmation: false
        },
        ADD_MEMBER: {
            id: 'project.addMember',
            description: 'Ajouter un membre au projet',
            api: 'ApiProjects.addMember',
            params: ['projectId', 'userId', 'role?'],
            keywords: ['ajouter membre', 'inviter', 'membre projet'],
            examples: ['Ajoute Marie au projet'],
            requiresConfirmation: false
        },
        GET_STATS: {
            id: 'project.getStats',
            description: 'Voir les statistiques du projet',
            api: 'ApiProjects.getStats',
            params: ['projectId'],
            keywords: ['stats projet', 'statistiques', 'avancement'],
            examples: ['Montre les stats du projet actuel'],
            requiresConfirmation: false
        },
        SUGGEST_NAME: {
            id: 'project.suggestName',
            description: 'Suggérer un nom de projet avec l\'IA',
            api: 'ApiProjects.suggestName',
            params: ['description'],
            keywords: ['suggère nom', 'trouve nom', 'nom projet'],
            examples: ['Suggère un nom pour mon projet de site e-commerce'],
            requiresConfirmation: false
        }
    },

    /**
     * MESSAGING ACTIONS (8)
     */
    MESSAGING: {
        SEND_MESSAGE: {
            id: 'messaging.send',
            description: 'Envoyer un message à un membre',
            api: 'MessagingAPI.sendMessage',
            params: ['conversationId', 'content'],
            keywords: ['envoyer message', 'message', 'écris à', 'dis à'],
            examples: ['Envoie un message à Marie "Réunion à 15h"', 'Écris à Jean pour le rapport'],
            requiresConfirmation: false
        },
        CREATE_CONVERSATION: {
            id: 'messaging.createConversation',
            description: 'Créer une nouvelle conversation',
            api: 'MessagingAPI.createConversation',
            params: ['participantIds', 'name?'],
            keywords: ['nouvelle conversation', 'créer chat', 'discussion'],
            examples: ['Crée une conversation avec Marie et Jean'],
            requiresConfirmation: false
        }
    },

    /**
     * MAIL ACTIONS (10)
     */
    MAIL: {
        COMPOSE: {
            id: 'mail.compose',
            description: 'Composer un nouvel email',
            api: 'MailAPI.compose',
            params: ['to', 'subject', 'body?'],
            keywords: ['envoyer email', 'email', 'mail', 'écris un email'],
            examples: ['Envoie un email à client@example.com', 'Compose un mail pour la réunion'],
            requiresConfirmation: true
        },
        CREATE_CAMPAIGN: {
            id: 'mail.createCampaign',
            description: 'Créer une campagne email marketing',
            api: 'MailAPI.createCampaign',
            params: ['name', 'subject', 'content', 'recipients'],
            keywords: ['campagne email', 'newsletter', 'envoi groupé'],
            examples: ['Crée une campagne newsletter'],
            requiresConfirmation: true
        }
    },

    /**
     * CALENDAR ACTIONS (6)
     */
    CALENDAR: {
        CREATE_EVENT: {
            id: 'calendar.createEvent',
            description: 'Créer un événement de calendrier',
            api: 'CalendarAPI.createEvent',
            params: ['title', 'startDate', 'endDate?', 'description?'],
            keywords: ['créer événement', 'rendez-vous', 'meeting', 'réunion'],
            examples: ['Crée un rendez-vous demain à 14h', 'Planifie une réunion vendredi'],
            requiresConfirmation: false
        }
    },

    /**
     * ACCOUNTING ACTIONS (25+)
     */
    ACCOUNTING: {
        CREATE_INVOICE: {
            id: 'accounting.createInvoice',
            description: 'Créer une facture',
            api: 'AccountingAPI.createInvoice',
            params: ['contactId', 'items', 'dueDate?'],
            keywords: ['créer facture', 'nouvelle facture', 'facturer'],
            examples: ['Crée une facture pour le client ABC', 'Facture de 1500€'],
            requiresConfirmation: false
        },
        CREATE_QUOTE: {
            id: 'accounting.createQuote',
            description: 'Créer un devis',
            api: 'AccountingAPI.createQuote',
            params: ['contactId', 'items', 'validUntil?'],
            keywords: ['créer devis', 'nouveau devis', 'devis'],
            examples: ['Crée un devis pour le nouveau client'],
            requiresConfirmation: false
        },
        CREATE_CONTACT: {
            id: 'accounting.createContact',
            description: 'Créer un contact comptable',
            api: 'AccountingAPI.createContact',
            params: ['name', 'email?', 'company?'],
            keywords: ['créer contact', 'nouveau client', 'ajouter fournisseur'],
            examples: ['Ajoute le contact "Société ABC"'],
            requiresConfirmation: false
        },
        SCAN_DOCUMENT: {
            id: 'accounting.scanDocument',
            description: 'Scanner un document avec FinScan',
            api: 'AccountingAPI.scanDocument',
            params: ['imageData'],
            keywords: ['scanner', 'finscan', 'numériser facture'],
            examples: ['Scanne cette facture', 'Analyse ce reçu'],
            requiresConfirmation: false
        }
    },

    /**
     * GAMIFICATION ACTIONS (8)
     */
    GAMIFICATION: {
        RECORD_XP: {
            id: 'gamification.recordXP',
            description: 'Enregistrer des points XP',
            api: 'GamificationAPI.recordAction',
            params: ['actionType', 'xpAmount?'],
            keywords: ['xp', 'points', 'expérience'],
            examples: ['Donne-moi 50 XP', 'Enregistre cette action'],
            requiresConfirmation: false
        },
        VIEW_STATS: {
            id: 'gamification.viewStats',
            description: 'Voir les statistiques de gamification',
            api: 'GamificationAPI.getStats',
            params: [],
            keywords: ['stats gamification', 'mon niveau', 'mes achievements'],
            examples: ['Quel est mon niveau ?', 'Montre mes stats'],
            requiresConfirmation: false
        }
    },

    /**
     * GIRI VISION ACTIONS (5)
     */
    GIRI_VISION: {
        CREATE_MEETING: {
            id: 'girivision.createMeeting',
            description: 'Créer une réunion vidéo',
            api: 'GiriVisionAPI.createMeeting',
            params: ['title', 'participants?'],
            keywords: ['créer réunion', 'vidéo', 'visio', 'meeting'],
            examples: ['Crée une réunion vidéo avec l\'équipe', 'Lance une visio'],
            requiresConfirmation: false
        }
    },

    /**
     * GALAXY ACTIONS (6)
     */
    GALAXY: {
        CREATE_CONSTELLATION: {
            id: 'galaxy.createConstellation',
            description: 'Créer une constellation IA dans Galaxy',
            api: 'GalaxyAI.generateConstellation',
            params: ['theme?'],
            keywords: ['constellation', 'galaxy', 'visualisation'],
            examples: ['Crée une constellation de mes projets', 'Visualise mon mind map'],
            requiresConfirmation: false
        },
        CREATE_MINDMAP: {
            id: 'galaxy.createMindmap',
            description: 'Générer une mind map',
            api: 'GalaxyAI.generateMindMap',
            params: ['topic'],
            keywords: ['mind map', 'carte mentale', 'brainstorm'],
            examples: ['Crée une mind map sur "Innovation produit"'],
            requiresConfirmation: false
        }
    },

    /**
     * ANALYTICS ACTIONS (4)
     */
    ANALYTICS: {
        GENERATE_REPORT: {
            id: 'analytics.generateReport',
            description: 'Générer un rapport analytique',
            api: 'AnalyticsAPI.generateReport',
            params: ['type', 'dateRange?'],
            keywords: ['rapport', 'analytics', 'analyse', 'statistiques'],
            examples: ['Génère un rapport mensuel', 'Analyse de la productivité'],
            requiresConfirmation: false
        }
    },

    /**
     * CRM ACTIONS (6)
     */
    CRM: {
        CREATE_LEAD: {
            id: 'crm.createLead',
            description: 'Créer un nouveau lead',
            api: 'CRMAPI.createLead',
            params: ['name', 'email?', 'company?'],
            keywords: ['créer lead', 'nouveau prospect', 'lead'],
            examples: ['Ajoute un lead "Société XYZ"'],
            requiresConfirmation: false
        },
        CREATE_DEAL: {
            id: 'crm.createDeal',
            description: 'Créer une opportunité commerciale',
            api: 'CRMAPI.createDeal',
            params: ['leadId', 'amount', 'stage?'],
            keywords: ['créer deal', 'opportunité', 'vente'],
            examples: ['Crée un deal de 5000€'],
            requiresConfirmation: false
        }
    },

    /**
     * NAVIGATION ACTIONS (10)
     */
    NAVIGATION: {
        GO_TO_VIEW: {
            id: 'navigation.goToView',
            description: 'Naviguer vers une vue',
            api: 'ViewRouter.navigate',
            params: ['viewName'],
            keywords: ['va à', 'ouvre', 'affiche', 'montre', 'navigation'],
            examples: ['Va au dashboard', 'Ouvre les tâches', 'Montre-moi les notes'],
            requiresConfirmation: false
        },
        TOGGLE_SIDEBAR: {
            id: 'navigation.toggleSidebar',
            description: 'Ouvrir/fermer la sidebar',
            api: 'Sidebar.toggle',
            params: [],
            keywords: ['sidebar', 'menu', 'barre latérale'],
            examples: ['Ouvre le menu', 'Cache la sidebar'],
            requiresConfirmation: false
        }
    },

    /**
     * Récupérer une action par ID
     */
    getActionById(actionId) {
        for (const category in this) {
            if (typeof this[category] === 'object' && this[category] !== null) {
                for (const action in this[category]) {
                    if (this[category][action].id === actionId) {
                        return this[category][action];
                    }
                }
            }
        }
        return null;
    },

    /**
     * Rechercher des actions par mots-clés
     */
    searchActions(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();

        for (const category in this) {
            if (typeof this[category] === 'object' && this[category] !== null) {
                for (const action in this[category]) {
                    const actionData = this[category][action];
                    if (!actionData.keywords) continue;

                    const matchScore = actionData.keywords.reduce((score, keyword) => {
                        if (lowerQuery.includes(keyword.toLowerCase())) {
                            return score + 10;
                        }
                        return score;
                    }, 0);

                    if (matchScore > 0) {
                        results.push({
                            ...actionData,
                            category,
                            matchScore
                        });
                    }
                }
            }
        }

        return results.sort((a, b) => b.matchScore - a.matchScore);
    },

    /**
     * Compter le nombre total d'actions
     */
    getTotalActionsCount() {
        let count = 0;
        for (const category in this) {
            if (typeof this[category] === 'object' && this[category] !== null) {
                count += Object.keys(this[category]).length;
            }
        }
        return count - 3; // Retirer les 3 méthodes utilitaires
    }
};

// Exposer globalement
if (typeof window !== 'undefined') {
    window.MahayawenActionRegistry = MahayawenActionRegistry;
}
