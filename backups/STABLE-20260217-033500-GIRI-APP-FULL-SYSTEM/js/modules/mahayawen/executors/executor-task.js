// =============================================
// TASK EXECUTOR
// Exécute toutes les actions liées aux tâches
// =============================================

const TaskExecutor = {
    /**
     * Récupère toutes les tâches
     */
    async getAll(params = {}) {
        const fn = MahayawenApiMap.task.getAll.fn();
        const tasks = await fn(params);
        return {
            success: true,
            message: `📋 ${tasks.length} tâche(s) trouvée(s)`,
            data: tasks,
            count: tasks.length
        };
    },

    /**
     * Récupère une tâche par ID
     */
    async getById(params) {
        const { taskId } = params;
        if (!taskId) throw new Error('taskId manquant');

        const fn = MahayawenApiMap.task.getById.fn();
        const task = await fn(taskId);

        return {
            success: true,
            message: `📋 Tâche: ${task.title}`,
            data: task
        };
    },

    /**
     * Crée une nouvelle tâche
     */
    async create(params) {
        const { title, priority, due_date, assigned_to, description } = params;

        if (!title) throw new Error('Le titre est obligatoire');

        // Préparer les données
        const taskData = { title };
        if (priority) taskData.priority = MahayawenApiMap.utils.parsePriority(priority);
        if (due_date) taskData.due_date = MahayawenApiMap.utils.parseRelativeDate(due_date);
        if (assigned_to) {
            // Résoudre le contact si c'est un nom
            taskData.assigned_to = await MahayawenApiMap.utils.resolveContact(assigned_to);
        }
        if (description) taskData.description = description;

        // Appeler l'API
        const fn = MahayawenApiMap.task.create.fn();
        const task = await fn(taskData);

        return {
            success: true,
            message: `✅ Tâche créée : "${task.title}"`,
            data: task,
            actions: [
                { label: 'Assigner', intent: 'task.assign', params: { taskId: task.id } },
                { label: 'Ajouter deadline', intent: 'task.setDueDate', params: { taskId: task.id } }
            ]
        };
    },

    /**
     * Met à jour une tâche
     */
    async update(params) {
        const { taskId, ...updates } = params;
        if (!taskId) throw new Error('taskId manquant');

        // Parser les valeurs si nécessaire
        if (updates.priority) updates.priority = MahayawenApiMap.utils.parsePriority(updates.priority);
        if (updates.due_date) updates.due_date = MahayawenApiMap.utils.parseRelativeDate(updates.due_date);

        const fn = MahayawenApiMap.task.update.fn();
        const task = await fn(taskId, updates);

        return {
            success: true,
            message: `✅ Tâche mise à jour : "${task.title}"`,
            data: task
        };
    },

    /**
     * Supprime une tâche (destructif - confirmation requise)
     */
    async remove(params) {
        const { taskId } = params;
        if (!taskId) throw new Error('taskId manquant');

        const fn = MahayawenApiMap.task.remove.fn();
        await fn(taskId);

        return {
            success: true,
            message: `🗑️ Tâche supprimée`,
            data: { taskId }
        };
    },

    /**
     * Marque une tâche comme terminée
     */
    async complete(params) {
        const { taskId } = params;
        if (!taskId) throw new Error('taskId manquant');

        const fn = MahayawenApiMap.task.complete.fn();
        const task = await fn(taskId);

        return {
            success: true,
            message: `🎉 Tâche terminée : "${task.title}"`,
            data: task
        };
    },

    /**
     * Réouvre une tâche terminée
     */
    async reopen(params) {
        const { taskId } = params;
        if (!taskId) throw new Error('taskId manquant');

        const fn = MahayawenApiMap.task.reopen.fn();
        const task = await fn(taskId);

        return {
            success: true,
            message: `🔄 Tâche réouverte : "${task.title}"`,
            data: task
        };
    },

    /**
     * Assigne une tâche à un utilisateur
     */
    async assign(params) {
        const { taskId, userId } = params;
        if (!taskId || !userId) throw new Error('taskId et userId obligatoires');

        // Résoudre le userId si c'est un nom
        const resolvedUserId = await MahayawenApiMap.utils.resolveContact(userId);

        const fn = MahayawenApiMap.task.assign.fn();
        const task = await fn(taskId, resolvedUserId);

        return {
            success: true,
            message: `👤 Tâche assignée`,
            data: task
        };
    },

    /**
     * Retire l'assignation
     */
    async unassign(params) {
        const { taskId } = params;
        if (!taskId) throw new Error('taskId manquant');

        const fn = MahayawenApiMap.task.unassign.fn();
        const task = await fn(taskId);

        return {
            success: true,
            message: `👤 Assignation retirée`,
            data: task
        };
    },

    /**
     * Définit la priorité
     */
    async setPriority(params) {
        const { taskId, priority } = params;
        if (!taskId || !priority) throw new Error('taskId et priority obligatoires');

        const parsedPriority = MahayawenApiMap.utils.parsePriority(priority);

        const fn = MahayawenApiMap.task.setPriority.fn();
        const task = await fn(taskId, parsedPriority);

        const priorityEmoji = { urgent: '🔴', high: '🟠', medium: '🟡', low: '🟢' };

        return {
            success: true,
            message: `${priorityEmoji[parsedPriority]} Priorité changée : ${parsedPriority}`,
            data: task
        };
    },

    /**
     * Définit la date d'échéance
     */
    async setDueDate(params) {
        const { taskId, dueDate } = params;
        if (!taskId || !dueDate) throw new Error('taskId et dueDate obligatoires');

        const parsedDate = MahayawenApiMap.utils.parseRelativeDate(dueDate);

        const fn = MahayawenApiMap.task.setDueDate.fn();
        const task = await fn(taskId, parsedDate);

        return {
            success: true,
            message: `📅 Échéance définie : ${parsedDate}`,
            data: task
        };
    },

    /**
     * Tâches à venir (échéance dans les 7 jours)
     */
    async getDueSoon(params = {}) {
        const fn = MahayawenApiMap.task.getDueSoon.fn();
        const tasks = await fn();

        return {
            success: true,
            message: `📅 ${tasks.length} tâche(s) à venir`,
            data: tasks,
            count: tasks.length
        };
    },

    /**
     * Tâches en retard
     */
    async getOverdue(params = {}) {
        const fn = MahayawenApiMap.task.getOverdue.fn();
        const tasks = await fn();

        return {
            success: true,
            message: `⚠️ ${tasks.length} tâche(s) en retard`,
            data: tasks,
            count: tasks.length
        };
    },

    /**
     * Ajoute un commentaire
     */
    async addComment(params) {
        const { taskId, content } = params;
        if (!taskId || !content) throw new Error('taskId et content obligatoires');

        const fn = MahayawenApiMap.task.addComment.fn();
        const comment = await fn(taskId, content);

        return {
            success: true,
            message: `💬 Commentaire ajouté`,
            data: comment
        };
    },

    /**
     * Récupère les commentaires
     */
    async getComments(params) {
        const { taskId } = params;
        if (!taskId) throw new Error('taskId manquant');

        const fn = MahayawenApiMap.task.getComments.fn();
        const comments = await fn(taskId);

        return {
            success: true,
            message: `💬 ${comments.length} commentaire(s)`,
            data: comments,
            count: comments.length
        };
    }
};

// Exposer globalement
if (typeof window !== 'undefined') {
    window.TaskExecutor = TaskExecutor;
}
