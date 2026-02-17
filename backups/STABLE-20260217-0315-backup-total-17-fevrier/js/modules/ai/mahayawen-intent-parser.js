// =============================================
// MAHAYAWEN INTENT PARSER
// Comprend les demandes en langage naturel et les transforme en actions
// Version 2.0 - NLP Intelligent
// =============================================

const MahayawenIntentParser = {
    /**
     * Parse une commande vocale/texte et retourne l'action + paramètres
     * @param {string} input - La commande de l'utilisateur
     * @param {object} context - Contexte actuel (vue, filtres, etc.)
     * @returns {object} - { action, params, confidence }
     */
    async parse(input, context = {}) {
        const normalized = this.normalize(input);

        // 1. Détection de l'intent principal
        const intent = await this.detectIntent(normalized, context);

        // 2. Extraction des entités (noms, dates, nombres, etc.)
        const entities = this.extractEntities(normalized, intent);

        // 3. Construction des paramètres d'action
        const params = this.buildParams(intent, entities, context);

        // 4. Résolution des références contextuelles
        const resolvedParams = await this.resolveReferences(params, context);

        return {
            action: intent.action,
            params: resolvedParams,
            confidence: intent.confidence,
            rawInput: input,
            entities
        };
    },

    /**
     * Normalise l'entrée utilisateur
     */
    normalize(input) {
        return input
            .toLowerCase()
            .trim()
            // Remplacer les formes verbales variées
            .replace(/créé|crées|créez|créer|crée/g, 'créer')
            .replace(/supprimé|supprimes|supprimez|supprimer/g, 'supprimer')
            .replace(/modifié|modifies|modifiez|modifier/g, 'modifier')
            .replace(/envoie|envoies|envoyez|envoyer/g, 'envoyer')
            .replace(/ouvre|ouvres|ouvrez|ouvrir/g, 'ouvrir')
            // Remplacer les synonymes communs
            .replace(/efface|enlève|retire/g, 'supprimer')
            .replace(/ajoute|insère/g, 'créer')
            .replace(/change|édite/g, 'modifier')
            .replace(/va à|aller à|montre|affiche/g, 'ouvrir')
            .replace(/écris à|dis à/g, 'envoyer message');
    },

    /**
     * Détecte l'intention principale
     */
    async detectIntent(normalized, context) {
        // Recherche directe dans le registre d'actions
        const matches = MahayawenActionRegistry.searchActions(normalized);

        if (matches.length > 0) {
            return {
                action: matches[0],
                confidence: matches[0].matchScore / 10 // Score 0-10 -> 0-1
            };
        }

        // Fallback : utiliser l'IA pour comprendre l'intent
        return await this.detectIntentWithAI(normalized, context);
    },

    /**
     * Utilise l'IA pour détecter l'intent si pas de match direct
     */
    async detectIntentWithAI(normalized, context) {
        try {
            const prompt = `Tu es un assistant qui identifie les intentions d'utilisateur.

Commande utilisateur: "${normalized}"
Contexte actuel: Vue ${context.currentView || 'dashboard'}, Projet ${context.currentProject || 'aucun'}

Actions disponibles:
${this.getAvailableActionsPrompt()}

Retourne UNIQUEMENT un JSON avec:
{
  "actionId": "l'ID de l'action la plus appropriée",
  "confidence": 0.8,
  "reasoning": "pourquoi cette action"
}`;

            const response = await ApiAi.generate(prompt, {
                maxTokens: 150,
                temperature: 0.3
            });

            if (response && response.text) {
                const parsed = JSON.parse(response.text.trim());
                const action = MahayawenActionRegistry.getActionById(parsed.actionId);

                return {
                    action: action || MahayawenActionRegistry.NAVIGATION.GO_TO_VIEW,
                    confidence: parsed.confidence || 0.5,
                    aiReasoning: parsed.reasoning
                };
            }
        } catch (error) {
            console.error('❌ AI intent detection failed:', error);
        }

        // Fallback ultime : navigation
        return {
            action: MahayawenActionRegistry.NAVIGATION.GO_TO_VIEW,
            confidence: 0.3
        };
    },

    /**
     * Génère la liste des actions pour le prompt IA
     */
    getAvailableActionsPrompt() {
        const actions = [];
        for (const category in MahayawenActionRegistry) {
            if (typeof MahayawenActionRegistry[category] === 'object') {
                for (const action in MahayawenActionRegistry[category]) {
                    const a = MahayawenActionRegistry[category][action];
                    if (a.id) {
                        actions.push(`- ${a.id}: ${a.description}`);
                    }
                }
            }
        }
        return actions.slice(0, 30).join('\n'); // Top 30 pour éviter token overflow
    },

    /**
     * Extrait les entités (noms, dates, nombres, etc.)
     */
    extractEntities(normalized, intent) {
        const entities = {
            titles: [],
            dates: [],
            numbers: [],
            emails: [],
            names: [],
            priorities: [],
            projects: []
        };

        // Extraction des titres entre guillemets
        const titleMatches = normalized.match(/"([^"]+)"|«([^»]+)»/g);
        if (titleMatches) {
            entities.titles = titleMatches.map(m => m.replace(/["«»]/g, ''));
        }

        // Extraction des dates relatives
        const datePatterns = [
            { pattern: /demain/g, value: this.getRelativeDate(1) },
            { pattern: /aujourd'hui/g, value: this.getRelativeDate(0) },
            { pattern: /après-demain/g, value: this.getRelativeDate(2) },
            { pattern: /lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/g, value: this.getNextWeekday },
            { pattern: /dans (\d+) jours?/g, value: (match) => this.getRelativeDate(parseInt(match[1])) },
            { pattern: /la semaine prochaine/g, value: this.getRelativeDate(7) }
        ];

        datePatterns.forEach(({ pattern, value }) => {
            const matches = normalized.matchAll(pattern);
            for (const match of matches) {
                entities.dates.push(typeof value === 'function' ? value(match) : value);
            }
        });

        // Extraction des nombres
        const numberMatches = normalized.match(/\d+/g);
        if (numberMatches) {
            entities.numbers = numberMatches.map(n => parseInt(n));
        }

        // Extraction des emails
        const emailMatches = normalized.match(/[\w.-]+@[\w.-]+\.\w+/g);
        if (emailMatches) {
            entities.emails = emailMatches;
        }

        // Extraction des priorités
        if (normalized.includes('urgent') || normalized.includes('priorité haute') || normalized.includes('important')) {
            entities.priorities.push('high');
        } else if (normalized.includes('normal') || normalized.includes('moyen')) {
            entities.priorities.push('medium');
        } else if (normalized.includes('bas') || normalized.includes('faible')) {
            entities.priorities.push('low');
        }

        // Extraction des noms de projets depuis AppState
        if (typeof AppState !== 'undefined' && AppState.projects) {
            AppState.projects.forEach(project => {
                const projectName = project.name.toLowerCase();
                if (normalized.includes(projectName)) {
                    entities.projects.push(project.id);
                }
            });
        }

        // Extraction des noms de membres d'équipe
        if (typeof AppConfig !== 'undefined' && AppConfig.USERS) {
            AppConfig.USERS.forEach(user => {
                const userName = user.name.toLowerCase();
                if (normalized.includes(userName)) {
                    entities.names.push(user.id);
                }
            });
        }

        return entities;
    },

    /**
     * Construit les paramètres pour l'action
     */
    buildParams(intent, entities, context) {
        const params = {};
        const action = intent.action;

        if (!action || !action.params) return params;

        // Mapping intelligent des entités vers les paramètres requis
        action.params.forEach(param => {
            const paramName = param.replace('?', ''); // Retirer le ? des optionnels

            switch (paramName) {
                case 'title':
                    params.title = entities.titles[0] || entities.titles.join(' ') || '';
                    break;
                case 'content':
                    params.content = entities.titles.join(' ') || '';
                    break;
                case 'dueDate':
                    params.dueDate = entities.dates[0] || null;
                    break;
                case 'priority':
                    params.priority = entities.priorities[0] || 'medium';
                    break;
                case 'projectId':
                    params.projectId = entities.projects[0] || context.currentProject || null;
                    break;
                case 'userId':
                    params.userId = entities.names[0] || null;
                    break;
                case 'to':
                case 'email':
                    params[paramName] = entities.emails[0] || '';
                    break;
                case 'amount':
                    params.amount = entities.numbers[0] || 0;
                    break;
                case 'viewName':
                    params.viewName = this.detectViewName(entities, context);
                    break;
            }
        });

        return params;
    },

    /**
     * Résout les références contextuelles (ex: "cette tâche", "le projet actuel")
     */
    async resolveReferences(params, context) {
        const resolved = { ...params };

        // Résolution de "cette tâche" / "cette note" / etc.
        if (!params.taskId && context.selectedTaskId) {
            resolved.taskId = context.selectedTaskId;
        }
        if (!params.noteId && context.selectedNoteId) {
            resolved.noteId = context.selectedNoteId;
        }
        if (!params.projectId && context.currentProject) {
            resolved.projectId = context.currentProject;
        }

        return resolved;
    },

    /**
     * Détecte le nom de la vue pour la navigation
     */
    detectViewName(entities, context) {
        const viewMap = {
            'dashboard': ['dashboard', 'accueil', 'tableau de bord'],
            'tasks': ['tâches', 'tache', 'tasks', 'todo'],
            'notes': ['notes', 'note'],
            'projects': ['projets', 'projet', 'projects'],
            'calendar': ['calendrier', 'agenda', 'calendar'],
            'messaging': ['messages', 'messagerie', 'chat', 'équipe'],
            'mail': ['mail', 'email', 'emails'],
            'accounting': ['comptabilité', 'factures', 'compta'],
            'crm': ['crm', 'clients', 'leads'],
            'reports': ['rapports', 'reports', 'analytics'],
            'gamification': ['gamification', 'xp', 'niveau'],
            'galaxie': ['galaxy', 'galaxie', 'visualisation'],
            'giriVision': ['giri', 'video', 'visio', 'réunion']
        };

        for (const [view, keywords] of Object.entries(viewMap)) {
            if (keywords.some(kw => entities.titles.some(t => t.includes(kw)))) {
                return view;
            }
        }

        return 'dashboard';
    },

    /**
     * Obtient une date relative
     */
    getRelativeDate(daysFromNow) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toISOString();
    },

    /**
     * Obtient le prochain jour de la semaine
     */
    getNextWeekday(match) {
        const days = {
            'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4,
            'vendredi': 5, 'samedi': 6, 'dimanche': 0
        };
        const targetDay = days[match[0]];
        const today = new Date();
        const currentDay = today.getDay();
        let daysUntil = targetDay - currentDay;
        if (daysUntil <= 0) daysUntil += 7;

        const date = new Date();
        date.setDate(date.getDate() + daysUntil);
        return date.toISOString();
    }
};

// Exposer globalement
if (typeof window !== 'undefined') {
    window.MahayawenIntentParser = MahayawenIntentParser;
}
