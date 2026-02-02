// =============================================
// PRODUCTIVEAPP - API SERVICE
// Service API centralisé pour toutes les requêtes
// =============================================

const ApiService = {
    /**
     * Timeout par défaut (30 secondes)
     */
    DEFAULT_TIMEOUT: 30000,

    /**
     * Effectue une requête POST avec gestion d'erreur
     * @param {string} url - URL de l'API
     * @param {Object} data - Données à envoyer
     * @param {Object} options - Options supplémentaires
     * @returns {Promise<any>} - Réponse parsée
     */
    async post(url, data, options = {}) {
        const {
            timeout = this.DEFAULT_TIMEOUT,
            defaultReturn = null,
            parseJson = true
        } = options;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const text = await response.text();

            if (!text || text.trim() === '') {
                console.log('⚠️ Réponse vide, retour par défaut');
                return defaultReturn;
            }

            if (!parseJson) {
                return text;
            }

            try {
                const parsed = JSON.parse(text);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch (parseError) {
                console.log('⚠️ JSON invalide, retour texte brut');
                return text;
            }
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.error('❌ Timeout de la requête:', url);
            } else {
                console.error('❌ Erreur API:', error);
            }
            return defaultReturn;
        }
    },

    // =============================================
    // API TASKS
    // =============================================

    /**
     * Charge toutes les tâches
     * @returns {Promise<Array>} - Liste des tâches
     */
    async loadTasks() {
        console.log('📡 Chargement des tâches...');
        const result = await this.post(AppConfig.API.TASKS, {
            action: 'get',
            tenant_id: AppConfig.TENANT_ID
        }, { defaultReturn: [] });

        if (!Array.isArray(result)) {
            console.error('❌ Réponse API invalide:', result);
            return [];
        }

        const tasks = result.map(t => {
            const parts = Utils.parseTaskText(t.text);
            return {
                id: t.task_id,
                text: parts.title,
                description: parts.description,
                status: t.status,
                priority: { level: t.priority, label: Utils.getPriorityLabel(t.priority) },
                project: t.project_id,
                userId: t.user_id,
                userName: Utils.getUserName(t.user_id),
                position: t.position || 0,
                createdAt: t.created_at,
                updatedAt: t.updated_at,
                completedAt: t.completed_at
            };
        });

        console.log(`✅ ${tasks.length} tâches chargées`);
        return tasks;
    },

    /**
     * Crée une nouvelle tâche
     * @param {Object} taskData - Données de la tâche
     * @returns {Promise<Object|null>} - Tâche créée ou null
     */
    async createTask(taskData) {
        const taskId = Utils.generateId('task');
        const fullText = Utils.combineTaskText(taskData.text, taskData.description);

        const payload = {
            action: 'create',
            tenant_id: AppConfig.TENANT_ID,
            task_id: taskId,
            user_id: taskData.userId,
            project_id: taskData.project,
            text: fullText,
            priority: taskData.priority.level
        };

        console.log('📤 Création tâche:', payload);

        const result = await this.post(AppConfig.API.TASKS, payload, {
            defaultReturn: [{
                task_id: taskId,
                text: fullText,
                status: 'todo',
                priority: taskData.priority.level,
                project_id: taskData.project,
                user_id: taskData.userId,
                created_at: new Date().toISOString()
            }]
        });

        if (result && Array.isArray(result) && result.length > 0) {
            console.log('✅ Tâche créée:', result[0]);
            return result[0];
        }

        return null;
    },

    /**
     * Met à jour une tâche (statut et priorité)
     * @param {string} taskId - ID de la tâche
     * @param {string} status - Nouveau statut
     * @param {number} priority - Nouvelle priorité
     * @returns {Promise<boolean>}
     */
    async updateTask(taskId, status, priority) {
        const result = await this.post(AppConfig.API.TASKS, {
            action: 'update',
            tenant_id: AppConfig.TENANT_ID,
            task_id: taskId,
            status: status,
            priority: priority
        });

        console.log('✅ Tâche mise à jour:', taskId);
        return !!result;
    },

    /**
     * Met à jour complètement une tâche
     * @param {string} taskId - ID de la tâche
     * @param {Object} data - Nouvelles données
     * @returns {Promise<boolean>}
     */
    async updateTaskFull(taskId, data) {
        const fullText = Utils.combineTaskText(data.title, data.description);

        const result = await this.post(AppConfig.API.TASKS, {
            action: 'update_full',
            tenant_id: AppConfig.TENANT_ID,
            task_id: taskId,
            text: fullText,
            project_id: data.projectId,
            priority: data.priority,
            user_id: data.userId
        });

        console.log('✅ Tâche mise à jour (complète):', taskId);
        return !!result;
    },

    /**
     * Supprime une tâche
     * @param {string} taskId - ID de la tâche
     * @returns {Promise<boolean>}
     */
    async deleteTask(taskId) {
        const result = await this.post(AppConfig.API.TASKS, {
            action: 'delete',
            tenant_id: AppConfig.TENANT_ID,
            task_id: taskId
        });

        console.log('✅ Tâche supprimée:', taskId);
        return !!result;
    },

    /**
     * Réordonne une tâche
     * @param {string} taskId - ID de la tâche
     * @param {string} status - Statut
     * @param {number} position - Nouvelle position
     * @returns {Promise<boolean>}
     */
    async reorderTask(taskId, status, position) {
        const result = await this.post(AppConfig.API.TASKS, {
            action: 'reorder',
            tenant_id: AppConfig.TENANT_ID,
            task_id: taskId,
            status: status,
            position: position
        });

        console.log('✅ Tâche réordonnée:', taskId);
        return !!result;
    },

    // =============================================
    // API PROJECTS
    // =============================================

    /**
     * Charge tous les projets
     * @returns {Promise<Array>} - Liste des projets
     */
    async loadProjects() {
        console.log('📡 Chargement des projets...');
        const result = await this.post(AppConfig.API.PROJECTS, {
            action: 'get',
            tenant_id: AppConfig.TENANT_ID
        }, { defaultReturn: [] });

        // Commencer avec les projets par défaut
        let projects = [...AppConfig.DEFAULT_PROJECTS];

        if (Array.isArray(result) && result.length > 0) {
            result.forEach(p => {
                const existingIndex = projects.findIndex(proj =>
                    proj.id === p.project_id || proj.name.toLowerCase() === p.name.toLowerCase()
                );

                if (existingIndex === -1) {
                    projects.push({
                        id: p.project_id,
                        name: p.name,
                        icon: p.icon || '📁',
                        color: p.color || '#6b7280',
                        desc: p.description || p.name
                    });
                }
            });
        }

        console.log(`✅ ${projects.length} projets chargés`);
        return projects;
    },

    /**
     * Crée un nouveau projet
     * @param {Object} projectData - Données du projet
     * @returns {Promise<Object|null>} - Projet créé ou null
     */
    async createProject(projectData) {
        const projectId = projectData.id || Utils.generateId('proj');

        const payload = {
            action: 'create',
            tenant_id: AppConfig.TENANT_ID,
            project_id: projectId,
            name: projectData.name,
            icon: projectData.icon || '📁',
            color: projectData.color || '#6b7280',
            description: projectData.desc || projectData.name
        };

        console.log('📤 Création projet:', payload);

        const result = await this.post(AppConfig.API.PROJECTS, payload, {
            defaultReturn: [{ project_id: projectId, ...payload }]
        });

        if (result && result.length > 0) {
            console.log('✅ Projet créé:', result[0]);
            return result[0];
        }

        return null;
    },

    /**
     * Supprime un projet
     * @param {string} projectId - ID du projet
     * @returns {Promise<boolean>}
     */
    async deleteProject(projectId) {
        const result = await this.post(AppConfig.API.PROJECTS, {
            action: 'delete',
            tenant_id: AppConfig.TENANT_ID,
            project_id: projectId
        });

        console.log('✅ Projet supprimé:', projectId);
        return !!result;
    },

    // =============================================
    // API JOURNAL
    // =============================================

    /**
     * Charge le journal
     * @returns {Promise<Array>} - Entrées du journal
     */
    async loadJournal() {
        console.log('📡 Chargement du journal...');
        const result = await this.post(AppConfig.API.JOURNAL, {
            action: 'get',
            tenant_id: AppConfig.TENANT_ID
        }, { defaultReturn: [] });

        if (!Array.isArray(result)) {
            console.error('❌ Réponse journal invalide:', result);
            return [];
        }

        const journal = result.map(j => ({
            id: j.id,
            category: j.category,
            text: j.text,
            energy: j.energy,
            time: Utils.formatTime(j.created_at),
            date: j.created_at,
            userId: j.user_id,
            userName: Utils.getUserName(j.user_id)
        }));

        console.log(`✅ ${journal.length} entrées journal chargées`);
        return journal;
    },

    /**
     * Crée une entrée journal
     * @param {Object} entry - Données de l'entrée
     * @returns {Promise<Object|null>} - Entrée créée ou null
     */
    async createJournalEntry(entry) {
        const result = await this.post(AppConfig.API.JOURNAL, {
            action: 'create',
            tenant_id: AppConfig.TENANT_ID,
            user_id: entry.userId,
            category: entry.category,
            text: entry.text,
            energy: entry.energy
        }, {
            defaultReturn: [{
                id: Date.now(),
                category: entry.category,
                text: entry.text,
                energy: entry.energy,
                user_id: entry.userId,
                created_at: new Date().toISOString()
            }]
        });

        if (result && result.length > 0) {
            console.log('✅ Entrée journal créée');
            return result[0];
        }

        return null;
    },

    // =============================================
    // API CORRECTION TEXTE (IA)
    // =============================================

    /**
     * Corrige ou reformule un texte via l'IA
     * @param {string} text - Texte à corriger
     * @param {string} mode - 'fix' ou 'reformulate'
     * @returns {Promise<string>} - Texte corrigé
     */
    async correctText(text, mode = 'fix') {
        if (!text || text.trim().length < 5) return text;

        try {
            const response = await fetch(AppConfig.API.CORRECT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, mode })
            });

            const data = await response.json();
            console.log('📝 Réponse correction brute:', data);

            const result = Array.isArray(data)
                ? Utils.extractText(data[0])
                : Utils.extractText(data);

            if (result) return result;

            console.log('⚠️ Format réponse correction inattendu:', data);
            return text;
        } catch (error) {
            console.error('❌ Erreur correction:', error);
            return text;
        }
    },

    // =============================================
    // API CHATBOT
    // =============================================

    /**
     * Envoie un message au chatbot
     * @param {Object} payload - Données du message
     * @returns {Promise<string>} - Réponse du chatbot
     */
    async sendChatMessage(payload) {
        try {
            const response = await fetch(AppConfig.API.CHATBOT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...payload,
                    tenant_id: AppConfig.TENANT_ID
                })
            });

            let aiResponse = await response.text();

            try {
                const json = JSON.parse(aiResponse);
                aiResponse = json.response || json.text || aiResponse;
            } catch (e) {
                // Pas du JSON, on garde le texte brut
            }

            return aiResponse;
        } catch (error) {
            console.error('❌ Erreur chatbot:', error);
            throw error;
        }
    },

    // =============================================
    // API BACKUP (PostgreSQL)
    // =============================================

    /**
     * Crée une sauvegarde complète dans PostgreSQL
     * @returns {Promise<Object>} - Résultat de la sauvegarde
     */
    async createBackup() {
        const backupData = {
            action: 'create_backup',
            tenant_id: AppConfig.TENANT_ID,
            timestamp: new Date().toISOString(),
            data: {
                tasks: AppState.tasks,
                projects: AppState.projects,
                journal: AppState.journal,
                user: AppState.currentUser?.id || 'unknown'
            },
            metadata: {
                version: AppConfig.VERSION,
                taskCount: AppState.tasks.length,
                projectCount: AppState.projects.length,
                journalCount: AppState.journal.length
            }
        };

        console.log('📤 Création backup PostgreSQL...');
        const result = await this.post(AppConfig.API.BACKUP, backupData);
        console.log('✅ Backup créé:', result);
        return result;
    },

    /**
     * Liste les sauvegardes disponibles
     * @returns {Promise<Array>} - Liste des backups
     */
    async listBackups() {
        const result = await this.post(AppConfig.API.BACKUP, {
            action: 'list',
            tenant_id: AppConfig.TENANT_ID
        }, { defaultReturn: [] });

        return result;
    },

    /**
     * Restaure une sauvegarde
     * @param {string} backupId - ID du backup
     * @returns {Promise<Object>} - Données restaurées
     */
    async restoreBackup(backupId) {
        const result = await this.post(AppConfig.API.BACKUP, {
            action: 'restore',
            tenant_id: AppConfig.TENANT_ID,
            backup_id: backupId
        });

        console.log('✅ Backup restauré:', backupId);
        return result;
    }
};

// Exposer globalement
window.ApiService = ApiService;
