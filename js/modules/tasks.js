// =============================================
// PRODUCTIVEAPP - TASKS MODULE
// Gestion des tâches
// =============================================

const Tasks = {
    /**
     * Charge les tâches depuis l'API
     */
    async load() {
        const tasks = await ApiService.loadTasks();
        AppState.setTasks(tasks);
        return tasks;
    },

    /**
     * Crée une nouvelle tâche
     * @param {Object} options - Options de création
     */
    async create(options = {}) {
        const text = options.text || Utils.$('task-input')?.value?.trim();
        if (!text) {
            Utils.notify('Entre un titre pour la tâche', 'warning');
            return null;
        }

        const projectId = options.project || Utils.$('project-select')?.value || 'general';
        const priorityLevel = options.priority || parseInt(Utils.$('priority-select')?.value) || 2;
        const assignTo = options.userId || Utils.$('assign-select')?.value || AppState.currentUser.id;

        // Désactiver le bouton
        const btn = Utils.$('add-task-btn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '...';
        }

        const taskData = {
            text: text,
            description: options.description || '',
            project: projectId,
            priority: { level: priorityLevel, label: Utils.getPriorityLabel(priorityLevel) },
            userId: assignTo,
            userName: Utils.getUserName(assignTo)
        };

        const result = await ApiService.createTask(taskData);

        if (btn) {
            btn.disabled = false;
            btn.textContent = '+';
        }

        if (result) {
            const parts = Utils.parseTaskText(result.text);
            const newTask = {
                id: result.task_id,
                text: parts.title,
                description: parts.description,
                status: result.status || 'todo',
                priority: { level: result.priority, label: Utils.getPriorityLabel(result.priority) },
                project: result.project_id,
                userId: result.user_id,
                userName: Utils.getUserName(result.user_id),
                position: 0,
                createdAt: result.created_at,
                updatedAt: result.updated_at
            };

            AppState.addTask(newTask);
            this.render();
            Projects.renderFilter();

            // Journal
            if (assignTo !== AppState.currentUser.id) {
                Journal.add('task', `📝 Assigné à ${Utils.getUserName(assignTo)}: ${text}`, 2);
            } else {
                Journal.add('task', `📝 Créé: ${text}`, 2);
            }

            // Reset inputs
            if (!options.text) {
                Utils.$('task-input').value = '';
                Utils.$('project-select').value = '';
                Utils.$('priority-select').value = '2';
                Utils.$('assign-select').value = '';
            }

            return newTask;
        }

        return null;
    },

    /**
     * Effectue une action sur une tâche
     * @param {string} taskId - ID de la tâche
     * @param {string} action - Action (start, done, reopen, delete)
     */
    async handleAction(taskId, action) {
        const task = AppState.findTask(taskId);
        if (!task) return;

        switch (action) {
            case 'start':
                await ApiService.updateTask(taskId, 'inprogress', task.priority.level);
                task.status = 'inprogress';
                task.updatedAt = new Date().toISOString();
                Journal.add('task', `🔄 Commencé: ${task.text}`, 2);
                break;

            case 'done':
                await ApiService.updateTask(taskId, 'done', task.priority.level);
                task.status = 'done';
                task.completedAt = new Date().toISOString();
                task.updatedAt = new Date().toISOString();
                Journal.add('win', `✅ Terminé: ${task.text}`, 3);
                break;

            case 'reopen':
                await ApiService.updateTask(taskId, 'todo', task.priority.level);
                task.status = 'todo';
                task.completedAt = null;
                task.updatedAt = new Date().toISOString();
                Journal.add('task', `🔄 Réouvert: ${task.text}`, 2);
                break;

            case 'delete':
                await ApiService.deleteTask(taskId);
                Journal.add('task', `🗑️ Supprimé: ${task.text}`, 2);
                AppState.removeTask(taskId);
                break;
        }

        this.render();
        Projects.renderFilter();
    },

    /**
     * Ouvre le modal d'édition de tâche
     * @param {string} taskId - ID de la tâche
     */
    openEditModal(taskId) {
        const task = AppState.findTask(taskId);
        if (!task) return;

        Utils.$('edit-task-id').value = taskId;
        Utils.$('edit-task-title').value = task.text;
        Utils.$('edit-task-description').value = task.description || '';

        // Remplir le sélecteur de projet
        const projectSelect = Utils.$('edit-task-project');
        projectSelect.innerHTML = AppState.projects.map(p =>
            `<option value="${p.id}" ${task.project === p.id ? 'selected' : ''}>${p.icon} ${p.name}</option>`
        ).join('');

        // Remplir le sélecteur de priorité
        Utils.$('edit-task-priority').value = task.priority?.level || 2;

        // Remplir le sélecteur d'utilisateur
        const userSelect = Utils.$('edit-task-user');
        userSelect.innerHTML = AppConfig.USERS.map(u =>
            `<option value="${u.id}" ${task.userId === u.id ? 'selected' : ''}>${u.name}</option>`
        ).join('');

        // Boutons d'action selon le statut
        let statusButtons = '';
        if (task.status === 'todo') {
            statusButtons = `
                <button class="btn-warning modal-action-btn" onclick="Tasks.modalAction('${taskId}', 'start')">▶️ Commencer</button>
                <button class="btn-success modal-action-btn" onclick="Tasks.modalAction('${taskId}', 'done')">✅ Terminé</button>
            `;
        } else if (task.status === 'inprogress') {
            statusButtons = `
                <button class="btn-success modal-action-btn" onclick="Tasks.modalAction('${taskId}', 'done')">✅ Terminé</button>
            `;
        } else if (task.status === 'done') {
            statusButtons = `
                <button class="btn-secondary modal-action-btn" onclick="Tasks.modalAction('${taskId}', 'reopen')">🔄 Réouvrir</button>
            `;
        }
        statusButtons += `<button class="btn-danger modal-action-btn" onclick="Tasks.modalAction('${taskId}', 'delete')">🗑️ Supprimer</button>`;

        Utils.$('modal-status-actions').innerHTML = statusButtons;
        Utils.$('edit-task-modal').classList.remove('hidden');
        Utils.$('edit-task-title').focus();

        // Attacher l'événement de correction automatique
        const textarea = Utils.$('edit-task-description');
        textarea.removeEventListener('blur', this.handleDescriptionBlur);
        textarea.addEventListener('blur', this.handleDescriptionBlur);
    },

    /**
     * Gère le blur sur la description (correction auto)
     */
    async handleDescriptionBlur(event) {
        if (AppState.ui.isCorrectingText) return;

        const textarea = event.target;
        const text = textarea.value.trim();

        if (!text || text.length < 10) return;

        AppState.ui.isCorrectingText = true;
        textarea.style.opacity = '0.7';
        textarea.placeholder = '✨ Correction en cours...';

        try {
            const correctedText = await ApiService.correctText(text, 'fix');
            if (correctedText && correctedText !== text) {
                textarea.value = correctedText;
                console.log('✅ Texte corrigé');
            }
        } catch (e) {
            console.error('Erreur correction:', e);
        }

        textarea.style.opacity = '1';
        textarea.placeholder = 'Ajouter des détails, précisions, notes, sous-tâches...';
        AppState.ui.isCorrectingText = false;
    },

    /**
     * Action depuis le modal
     * @param {string} taskId - ID de la tâche
     * @param {string} action - Action
     */
    async modalAction(taskId, action) {
        await this.handleAction(taskId, action);
        this.closeEditModal();
    },

    /**
     * Ferme le modal d'édition
     */
    closeEditModal() {
        Utils.$('edit-task-modal').classList.add('hidden');
        Utils.$('edit-task-id').value = '';
        Utils.$('edit-task-title').value = '';
        Utils.$('edit-task-description').value = '';
    },

    /**
     * Sauvegarde les modifications d'une tâche
     */
    async saveEdit() {
        const taskId = Utils.$('edit-task-id').value;
        const newTitle = Utils.$('edit-task-title').value.trim();
        const newDescription = Utils.$('edit-task-description').value.trim();
        const newProjectId = Utils.$('edit-task-project').value;
        const newPriority = parseInt(Utils.$('edit-task-priority').value);
        const newUserId = Utils.$('edit-task-user').value;

        if (!newTitle) {
            Utils.notify('Le titre ne peut pas être vide', 'warning');
            return;
        }

        const task = AppState.findTask(taskId);
        if (!task) return;

        await ApiService.updateTaskFull(taskId, {
            title: newTitle,
            description: newDescription,
            projectId: newProjectId,
            priority: newPriority,
            userId: newUserId
        });

        // Mettre à jour localement
        task.text = newTitle;
        task.description = newDescription;
        task.project = newProjectId;
        task.priority = { level: newPriority, label: Utils.getPriorityLabel(newPriority) };
        task.userId = newUserId;
        task.userName = Utils.getUserName(newUserId);
        task.updatedAt = new Date().toISOString();

        window.tasks = AppState.tasks;

        this.closeEditModal();
        this.render();
        Projects.renderFilter();
    },

    /**
     * Toggle l'affichage des notes
     * @param {HTMLElement} btn - Bouton cliqué
     */
    toggleNoteDisplay(btn) {
        const bubble = btn.closest('.bubble');
        if (!bubble) return;

        const description = bubble.querySelector('.bubble-description');
        const arrow = btn.querySelector('.note-arrow');
        const isExpanded = btn.dataset.expanded === 'true';

        if (isExpanded) {
            description.classList.add('hidden');
            btn.dataset.expanded = 'false';
            arrow.textContent = '▼';
            btn.classList.remove('expanded');
        } else {
            description.classList.remove('hidden');
            btn.dataset.expanded = 'true';
            arrow.textContent = '▲';
            btn.classList.add('expanded');
        }
    },

    /**
     * Render les tâches selon le mode de vue
     */
    render() {
        const filtered = AppState.getFilteredTasks();
        const todo = filtered.filter(t => t.status === 'todo');
        const inprogress = filtered.filter(t => t.status === 'inprogress');
        const done = filtered.filter(t => t.status === 'done').slice(0, 20);

        if (AppState.ui.viewMode === 'columns') {
            this.renderColumnsView(todo, inprogress, done);
        } else {
            this.renderBubblesView(todo, inprogress, done);
        }
    },

    /**
     * Render la vue 3 colonnes
     */
    renderColumnsView(todo, inprogress, done) {
        Utils.$('todo-count').textContent = todo.length;
        Utils.$('inprogress-count').textContent = inprogress.length;
        Utils.$('done-count').textContent = done.length;

        Utils.$('todo-list').innerHTML = todo.length
            ? todo.map(t => this.renderTaskHTMLFull(t)).join('')
            : '<div class="empty-state">Aucune tâche</div>';
        Utils.$('inprogress-list').innerHTML = inprogress.length
            ? inprogress.map(t => this.renderTaskHTMLFull(t)).join('')
            : '<div class="empty-state">Rien en cours</div>';
        Utils.$('done-list').innerHTML = done.length
            ? done.map(t => this.renderTaskHTMLFull(t)).join('')
            : '<div class="empty-state">Rien terminé</div>';

        this.attachEventsFull();

        if (typeof initTaskDragAndDrop === 'function') {
            initTaskDragAndDrop();
        }
    },

    /**
     * Render la vue 2 colonnes (bulles)
     */
    renderBubblesView(todo, inprogress, done) {
        const allTodo = [...todo, ...inprogress];

        Utils.$('bubbles-todo').innerHTML = allTodo.length
            ? allTodo.map(t => this.renderTaskHTMLSimple(t)).join('')
            : '<div class="empty-state">Aucune tâche</div>';
        Utils.$('bubbles-done').innerHTML = done.length
            ? done.map(t => this.renderTaskHTMLSimple(t)).join('')
            : '<div class="empty-state">Rien terminé</div>';

        this.attachEventsSimple();

        if (typeof initTaskDragAndDrop === 'function') {
            initTaskDragAndDrop();
        }
    },

    /**
     * Génère le HTML d'une tâche (vue complète)
     * @param {Object} task - La tâche
     * @returns {string} - HTML
     */
    renderTaskHTMLFull(task) {
        const project = AppState.findProject(task.project);
        const userAvatar = Utils.getUserAvatar(task.userId);
        const hasDescription = task.description && task.description.trim();

        return `
            <div class="bubble ${task.status}" data-id="${task.id}">
                <button class="edit-btn ${hasDescription ? 'has-note' : ''}" data-action="edit" title="${hasDescription ? 'Voir/Modifier notes' : 'Ajouter notes'}">✏️</button>
                <div class="bubble-header">
                    <span class="task-project" style="background: ${project.color}20; color: ${project.color};">${project.icon} ${project.name}</span>
                    <span class="task-priority ${task.priority?.level === 1 ? 'urgent' : ''}">${task.priority?.label || 'Normal'}</span>
                    <span class="task-user" title="${task.userName}">${userAvatar}</span>
                </div>
                <div class="bubble-text">${Utils.escapeHtml(task.text)}</div>
                ${hasDescription ? `
                    <button class="note-toggle" data-expanded="false" title="Voir les notes">
                        <span class="note-dot">●</span>
                        <span class="note-arrow">▼</span>
                    </button>
                    <div class="bubble-description hidden">${Utils.escapeHtml(task.description)}</div>
                ` : ''}
                <div class="task-actions">
                    ${task.status === 'todo' ? `<button class="task-action-btn start" data-action="start">▶️</button>` : ''}
                    ${task.status === 'inprogress' ? `<button class="task-action-btn complete" data-action="done">✅</button>` : ''}
                    ${task.status === 'todo' ? `<button class="task-action-btn complete" data-action="done">✓</button>` : ''}
                    ${task.status === 'done' ? `<button class="task-action-btn reopen" data-action="reopen">↩️</button>` : ''}
                    <button class="task-action-btn delete" data-action="delete">🗑️</button>
                </div>
            </div>
        `;
    },

    /**
     * Génère le HTML d'une tâche (vue simple)
     * @param {Object} task - La tâche
     * @returns {string} - HTML
     */
    renderTaskHTMLSimple(task) {
        const project = AppState.findProject(task.project);
        const userAvatar = Utils.getUserAvatar(task.userId);
        const hasDescription = task.description && task.description.trim();

        return `
            <div class="bubble ${task.status}" data-id="${task.id}" data-simple="true">
                <button class="edit-btn ${hasDescription ? 'has-note' : ''}" data-action="edit" title="${hasDescription ? 'Voir/Modifier notes' : 'Ajouter notes'}">✏️</button>
                <div class="bubble-header">
                    <span class="task-project" style="background: ${project.color}20; color: ${project.color};">${project.icon}</span>
                    <span class="task-priority ${task.priority?.level === 1 ? 'urgent' : ''}">${task.priority?.label || 'Normal'}</span>
                    <span class="task-user" title="${task.userName}">${userAvatar}</span>
                </div>
                <div class="bubble-text">${Utils.escapeHtml(task.text)}</div>
                ${hasDescription ? `
                    <button class="note-toggle" data-expanded="false" title="Voir les notes">
                        <span class="note-dot">●</span>
                        <span class="note-arrow">▼</span>
                    </button>
                    <div class="bubble-description hidden">${Utils.escapeHtml(task.description)}</div>
                ` : ''}
            </div>
        `;
    },

    /**
     * Attache les événements (vue complète)
     */
    attachEventsFull() {
        // Boutons d'action
        document.querySelectorAll('.task-action-btn').forEach(btn => {
            const newBtn = Utils.cloneAndReplace(btn);
            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskEl = newBtn.closest('.bubble');
                if (!taskEl) return;
                this.handleAction(taskEl.dataset.id, newBtn.dataset.action);
            });
        });

        // Boutons edit
        document.querySelectorAll('.edit-btn').forEach(btn => {
            const newBtn = Utils.cloneAndReplace(btn);
            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskEl = newBtn.closest('.bubble');
                if (!taskEl) return;
                this.openEditModal(taskEl.dataset.id);
            });
        });

        // Boutons toggle notes
        document.querySelectorAll('.note-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNoteDisplay(btn);
            });
        });

        // Clic sur bulle = ouvre modal
        document.querySelectorAll('#columns-view .bubble').forEach(bubble => {
            bubble.addEventListener('click', (e) => {
                if (e.target.closest('.task-action-btn') || e.target.closest('.edit-btn') || e.target.closest('.note-toggle')) return;
                this.openEditModal(bubble.dataset.id);
            });
        });
    },

    /**
     * Attache les événements (vue simple)
     */
    attachEventsSimple() {
        // Boutons edit
        document.querySelectorAll('.bubbles-view .edit-btn').forEach(btn => {
            const newBtn = Utils.cloneAndReplace(btn);
            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskEl = newBtn.closest('.bubble');
                if (!taskEl) return;
                this.openEditModal(taskEl.dataset.id);
            });
        });

        // Boutons toggle notes
        document.querySelectorAll('.bubbles-view .note-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNoteDisplay(btn);
            });
        });

        // Clic sur bulle = toggle fait/à faire
        document.querySelectorAll('.bubble[data-simple="true"]').forEach(bubble => {
            bubble.addEventListener('click', (e) => {
                if (e.target.closest('.edit-btn') || e.target.closest('.note-toggle')) return;

                const taskId = bubble.dataset.id;
                const task = AppState.findTask(taskId);
                if (!task) return;

                if (task.status === 'done') {
                    this.handleAction(taskId, 'reopen');
                } else {
                    this.handleAction(taskId, 'done');
                }
            });
        });
    },

    /**
     * Initialise les événements
     */
    initEvents() {
        const addBtn = Utils.$('add-task-btn');
        const taskInput = Utils.$('task-input');
        const cancelEditBtn = Utils.$('cancel-edit-task');
        const confirmEditBtn = Utils.$('confirm-edit-task');
        const editModal = Utils.$('edit-task-modal');
        const reformulateBtn = Utils.$('reformulate-btn');

        if (addBtn) {
            addBtn.addEventListener('click', () => this.create());
        }

        if (taskInput) {
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.create();
            });
        }

        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        }

        if (confirmEditBtn) {
            confirmEditBtn.addEventListener('click', () => this.saveEdit());
        }

        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target === editModal) this.closeEditModal();
            });
        }

        if (reformulateBtn) {
            reformulateBtn.addEventListener('click', async () => {
                const textarea = Utils.$('edit-task-description');
                const text = textarea.value.trim();

                if (!text || text.length < 10) {
                    Utils.notify('Écris d\'abord quelque chose à reformuler !', 'warning');
                    return;
                }

                reformulateBtn.textContent = '⏳';
                reformulateBtn.disabled = true;
                textarea.style.opacity = '0.7';

                try {
                    const reformulated = await ApiService.correctText(text, 'reformulate');
                    if (reformulated && reformulated !== text) {
                        textarea.value = reformulated;
                        console.log('✅ Texte reformulé');
                    }
                } catch (e) {
                    console.error('Erreur reformulation:', e);
                    Utils.notify('Erreur de reformulation', 'error');
                }

                reformulateBtn.textContent = '💡';
                reformulateBtn.disabled = false;
                textarea.style.opacity = '1';
            });
        }
    }
};

// Exposer globalement pour compatibilité
window.Tasks = Tasks;
window.renderTasks = () => Tasks.render();
window.handleTaskAction = (taskId, action) => Tasks.handleAction(taskId, action);
window.openEditTaskModal = (taskId) => Tasks.openEditModal(taskId);
window.closeEditTaskModal = () => Tasks.closeEditModal();
window.saveEditTask = () => Tasks.saveEdit();
window.modalTaskAction = (taskId, action) => Tasks.modalAction(taskId, action);
window.toggleNoteDisplay = (btn) => Tasks.toggleNoteDisplay(btn);
