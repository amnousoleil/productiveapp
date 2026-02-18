// =============================================
// PRODUCTIVEAPP - TASKS MODULE
// Gestion des tâches
// =============================================

const Tasks = {
    /**
     * Charge les tâches depuis l'API Express
     */
    async load() {
        // Use ApiDataLoader which handles normalization
        if (typeof ApiDataLoader !== 'undefined' && ApiTokens.isAuthenticated()) {
            const tasks = await ApiDataLoader.loadTasks();
            AppState.setTasks(tasks);
            return tasks;
        }

        // Fallback to old N8N service if not authenticated with Express
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

        // Use: 1) explicit option, 2) dropdown value, 3) current project filter, 4) 'general'
        const currentFilterProject = AppState.filters?.project !== 'all' ? AppState.filters.project : null;
        const projectId = options.project || Utils.$('project-select')?.value || currentFilterProject || 'general';
        const priorityLevel = options.priority || parseInt(Utils.$('priority-select')?.value) || 3;
        let assignTo = options.userId || Utils.$('assign-select')?.value || AppState.currentUser?.id;

        // Validate UUID format - if not valid or empty, set to null
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!assignTo || assignTo === '' || !uuidRegex.test(assignTo)) {
            if (assignTo && assignTo !== '') {
                console.warn('⚠️ Invalid UUID for assignTo:', assignTo, '- setting to null');
            }
            assignTo = null;
        }

        // Also validate projectId
        let validProjectId = projectId;
        if (projectId && projectId !== 'general' && !uuidRegex.test(projectId)) {
            console.warn('⚠️ Invalid UUID for projectId:', projectId, '- setting to null');
            validProjectId = null;
        }

        // Désactiver le bouton
        const btn = Utils.$('add-task-btn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '...';
        }

        try {
            // Try Express API first if workspace is set (indicates valid session)
            let result = null;
            const isApiTasksDefined = typeof ApiTasks !== 'undefined';
            const hasWorkspace = typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId();
            const isAuthenticated = typeof ApiTokens !== 'undefined' && ApiTokens.isAuthenticated();

            // Use Express API if we have a workspace (even without token for legacy auth)
            if (isApiTasksDefined && (isAuthenticated || hasWorkspace)) {
                try {
                    const priorityMap = { 1: 'urgent', 2: 'high', 3: 'medium', 4: 'low' };
                    const createData = {
                        title: text,
                        description: options.description || '',
                        priority: priorityMap[priorityLevel] || 'medium',
                        status: 'todo'
                    };
                    // Only add project_id if it's a valid UUID
                    if (validProjectId && validProjectId !== 'general') {
                        createData.project_id = validProjectId;
                    }
                    // Only add assigned_to if it's a valid UUID
                    if (assignTo) {
                        createData.assigned_to = assignTo;
                    }
                    result = await ApiTasks.create(createData);
                } catch (e) {
                    console.error('❌ Express API failed:', e.message, e);
                }
            } else {
                console.warn('⚠️ Skipping Express API - conditions not met');
            }

            // Fallback to N8N
            if (!result) {
                const taskData = {
                    text: text,
                    description: options.description || '',
                    project: projectId,
                    priority: { level: priorityLevel, label: Utils.getPriorityLabel(priorityLevel) },
                    userId: assignTo,
                    userName: Utils.getUserName(assignTo)
                };
                result = await ApiService.createTask(taskData);
            }

            if (btn) {
                btn.disabled = false;
                btn.textContent = '+';
            }

            if (result) {
                // Normalize result from either API
                const newTask = result.task_id ? {
                    // N8N format
                    id: result.task_id,
                    text: Utils.parseTaskText(result.text).title,
                    description: Utils.parseTaskText(result.text).description,
                    status: result.status || 'todo',
                    priority: { level: result.priority || priorityLevel, label: Utils.getPriorityLabel(result.priority || priorityLevel) },
                    project: result.project_id || projectId,
                    userId: result.user_id || assignTo,
                    userName: Utils.getUserName(result.user_id || assignTo),
                    position: 0,
                    createdAt: result.created_at,
                    updatedAt: result.updated_at
                } : {
                    // Express format
                    id: result.id,
                    text: result.title || text,
                    description: result.description || '',
                    status: result.status === 'in_progress' ? 'inprogress' : (result.status || 'todo'),
                    priority: { level: { urgent: 1, high: 2, medium: 3, low: 4 }[result.priority] || priorityLevel, label: Utils.getPriorityLabel({ urgent: 1, high: 2, medium: 3, low: 4 }[result.priority] || priorityLevel) },
                    project: result.project_id || projectId,
                    userId: result.assigned_to || assignTo,
                    userName: Utils.getUserName(result.assigned_to || assignTo),
                    position: result.position || 0,
                    createdAt: result.created_at,
                    updatedAt: result.updated_at
                };

                AppState.addTask(newTask);

                try {
                    this.render();
                } catch (renderErr) {
                    console.error('❌ Tasks.render() error:', renderErr);
                }

                try {
                    Projects.renderFilter();
                } catch (filterErr) {
                    console.error('❌ Projects.renderFilter() error:', filterErr);
                }

                // Journal
                try {
                    if (assignTo !== AppState.currentUser?.id) {
                        Journal.add('task', `📝 Assigné à ${Utils.getUserName(assignTo)}: ${text}`, 2);
                    } else {
                        Journal.add('task', `📝 Créé: ${text}`, 2);
                    }
                } catch (journalErr) {
                    console.warn('Journal error:', journalErr);
                }

                // XP Feedback: nouvelle tâche créée
                if (typeof XPFeedback !== 'undefined' && XPFeedback.recordAction) {
                    XPFeedback.recordAction('task_created', null, 'Tâche créée')
                        .catch(err => console.warn('XP Feedback failed:', err));
                }

                // Reset inputs
                if (!options.text) {
                    const taskInput = Utils.$('task-input');
                    const projectSelect = Utils.$('project-select');
                    const prioritySelect = Utils.$('priority-select');
                    const assignSelect = Utils.$('assign-select');
                    if (taskInput) taskInput.value = '';
                    if (projectSelect) projectSelect.value = '';
                    if (prioritySelect) prioritySelect.value = '';
                    if (assignSelect) assignSelect.value = '';
                }

                Utils.notify('Tâche créée !', 'success');
                return newTask;
            }

            return null;
        } catch (err) {
            console.error('❌ Tasks.create() error:', err);
            Utils.notify('Erreur lors de la création', 'error');
            if (btn) {
                btn.disabled = false;
                btn.textContent = '+';
            }
            return null;
        }
    },

    /**
     * Effectue une action sur une tâche
     * @param {string} taskId - ID de la tâche
     * @param {string} action - Action (start, done, reopen, delete)
     */
    async handleAction(taskId, action) {
        const task = AppState.findTask(taskId);
        if (!task) {
            console.error('❌ Task not found:', taskId);
            return;
        }

        // Use Express API if authenticated
        const useExpress = typeof ApiTasks !== 'undefined' && ApiTokens.isAuthenticated();

        switch (action) {
            case 'start':
                if (useExpress) {
                    await ApiTasks.update(taskId, { status: 'in_progress' });
                } else {
                    await ApiService.updateTask(taskId, 'inprogress', task.priority.level);
                }
                task.status = 'inprogress';
                task.updatedAt = new Date().toISOString();
                Journal.add('task', `🔄 Commencé: ${task.text}`, 2);
                break;

            case 'done':
                if (useExpress) {
                    await ApiTasks.update(taskId, { status: 'done' });
                } else {
                    await ApiService.updateTask(taskId, 'done', task.priority.level);
                }
                task.status = 'done';
                task.completedAt = new Date().toISOString();
                task.updatedAt = new Date().toISOString();
                Journal.add('win', `✅ Terminé: ${task.text}`, 3);

                // XP Feedback: affichage immédiat avec animation
                if (typeof XPFeedback !== 'undefined' && XPFeedback.recordAction) {
                    XPFeedback.recordAction('task_completed', null, 'Tâche terminée')
                        .catch(err => console.warn('XP Feedback failed:', err));
                }
                break;

            case 'reopen':
                if (useExpress) {
                    await ApiTasks.update(taskId, { status: 'todo' });
                } else {
                    await ApiService.updateTask(taskId, 'todo', task.priority.level);
                }
                task.status = 'todo';
                task.completedAt = null;
                task.updatedAt = new Date().toISOString();
                Journal.add('task', `🔄 Réouvert: ${task.text}`, 2);
                break;

            case 'delete':
                if (useExpress) {
                    await ApiTasks.remove(taskId);
                } else {
                    await ApiService.deleteTask(taskId);
                }
                Journal.add('task', `🗑️ Supprimé: ${task.text}`, 2);
                AppState.removeTask(taskId);
                break;
        }

        // Sync Galaxy View node if in task project mode
        if (typeof CosmicProjectsUI !== 'undefined' && CosmicProjectsUI.isTaskProjectMode) {
            CosmicProjectsUI.syncTaskNode(taskId);
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
        const editModal = Utils.$('edit-task-modal');
        editModal.classList.remove('hidden');
        editModal.classList.add('modal-visible');
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
        try {
            await this.handleAction(taskId, action);
            this.closeEditModal();
        } catch (err) {
            console.error('❌ modalAction error:', err);
            Utils.notify('Erreur: ' + err.message, 'error');
        }
    },

    /**
     * Ferme le modal d'édition
     */
    closeEditModal() {
        const editModal = Utils.$('edit-task-modal');
        editModal.classList.remove('modal-visible');
        editModal.classList.add('hidden');
        editModal.style.display = 'none';
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
        if (!task) {
            console.error('❌ Task not found:', taskId);
            Utils.notify('Tâche introuvable', 'error');
            return;
        }

        try {
            // Use Express API if authenticated
            if (typeof ApiTasks !== 'undefined' && ApiTokens.isAuthenticated()) {
                const priorityMap = { 1: 'urgent', 2: 'high', 3: 'medium', 4: 'low' };
                const updateData = {
                    title: newTitle,
                    description: newDescription,
                    project_id: newProjectId === 'general' ? null : newProjectId,
                    priority: priorityMap[newPriority] || 'medium',
                    assigned_to: newUserId
                };
                await ApiTasks.update(taskId, updateData);
            } else {
                await ApiService.updateTaskFull(taskId, {
                    title: newTitle,
                    description: newDescription,
                    projectId: newProjectId,
                    priority: newPriority,
                    userId: newUserId
                });
            }

            // Mettre à jour localement
            task.text = newTitle;
            task.description = newDescription;
            task.project = newProjectId;
            task.priority = { level: newPriority, label: Utils.getPriorityLabel(newPriority) };
            task.userId = newUserId;
            task.userName = Utils.getUserName(newUserId);
            task.updatedAt = new Date().toISOString();

            window.tasks = AppState.tasks;

            // Sync Galaxy View node if in task project mode
            if (typeof CosmicProjectsUI !== 'undefined' && CosmicProjectsUI.isTaskProjectMode) {
                CosmicProjectsUI.syncTaskNode(taskId);
            }

            this.closeEditModal();
            this.render();
            Projects.renderFilter();
            Utils.notify('Tâche mise à jour !', 'success');
        } catch (err) {
            console.error('❌ saveEdit error:', err);
            Utils.notify('Erreur: ' + err.message, 'error');
        }
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
    /**
     * Filtre les tâches terminées par période
     */
    _filterDoneByPeriod(doneTasks) {
        const period = AppState.filters.donePeriod || 'today';
        if (period === 'all') return doneTasks;

        const now = new Date();
        let cutoff;

        switch (period) {
            case 'today':
                cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week': {
                const day = now.getDay();
                const diff = day === 0 ? 6 : day - 1; // lundi = début de semaine
                cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
                break;
            }
            case 'month':
                cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                cutoff = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                return doneTasks;
        }

        return doneTasks.filter(t => {
            if (!t.completedAt) return false;
            return new Date(t.completedAt) >= cutoff;
        });
    },

    render() {
        const filtered = AppState.getFilteredTasks();
        const todo = filtered.filter(t => t.status === 'todo');
        const inprogress = filtered.filter(t => t.status === 'inprogress');
        const allDone = filtered.filter(t => t.status === 'done');
        const done = this._filterDoneByPeriod(allDone);

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
        const project = AppState.findProject(task.project) || { id: 'general', name: 'Général', icon: '📁', color: '#6B7280' };
        const userAvatar = Utils.getUserAvatar(task.userId) || '👤';
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
        const project = AppState.findProject(task.project) || { id: 'general', name: 'Général', icon: '📁', color: '#6B7280' };
        const userAvatar = Utils.getUserAvatar(task.userId) || '👤';
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
     * Custom dropdown logic for done-period filters
     */
    _initDonePeriodDropdowns() {
        const wraps = [
            document.getElementById('done-period-filter'),
            document.getElementById('done-period-filter-bubbles')
        ].filter(Boolean);
        if (!wraps.length) return;

        const saved = localStorage.getItem('donePeriodFilter') || 'today';
        AppState.filters.donePeriod = saved;

        // Labels map
        const labels = { today: "Aujourd'hui", week: 'Cette semaine', month: 'Ce mois', year: "Cette année", all: 'Tout' };

        // Sync all wraps to saved value
        const syncAll = (val) => {
            wraps.forEach(w => {
                const trig = w.querySelector('.dpf-trigger');
                if (trig) trig.firstChild.textContent = labels[val] || val;
                w.querySelectorAll('.dpf-opt').forEach(o => {
                    o.classList.toggle('selected', o.dataset.value === val);
                });
            });
        };
        syncAll(saved);

        // Toggle open/close
        const openWrap = (wrap) => {
            // Close others first
            wraps.forEach(w => { if (w !== wrap) w.classList.remove('open'); });
            wrap.classList.add('open');
            const menu = wrap.querySelector('.dpf-menu');
            if (menu) requestAnimationFrame(() => menu.classList.add('visible'));
        };
        const closeAll = () => {
            wraps.forEach(w => {
                w.classList.remove('open');
                const m = w.querySelector('.dpf-menu');
                if (m) m.classList.remove('visible');
            });
        };

        wraps.forEach(wrap => {
            const trigger = wrap.querySelector('.dpf-trigger');
            if (trigger) {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (wrap.classList.contains('open')) { closeAll(); }
                    else { openWrap(wrap); }
                });
            }
            wrap.querySelectorAll('.dpf-opt').forEach(opt => {
                opt.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const val = opt.dataset.value;
                    AppState.filters.donePeriod = val;
                    localStorage.setItem('donePeriodFilter', val);
                    syncAll(val);
                    closeAll();
                    this.render();
                });
            });
        });

        // Close on outside click
        document.addEventListener('click', closeAll);
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

        const closeXBtn = Utils.$('close-edit-task-x');
        if (closeXBtn) {
            closeXBtn.addEventListener('click', () => this.closeEditModal());
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

        // Done period filter — custom dropdown logic
        this._initDonePeriodDropdowns();
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
