/**
 * ================================================
 * PROJECTS VIEW MODULE - ProductiveApp v3.2
 * Vue projets avec couleurs et icônes
 * ================================================
 */

const ProjectsView = (function() {
    'use strict';

    // Available colors
    const COLORS = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308',
        '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
        '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
        '#d946ef', '#ec4899', '#f43f5e', '#64748b'
    ];

    // Available icons - PREMIUM COLLECTION
    const ICONS = [
        '💎', '✨', '🎯', '🚀', '💡', '⭐',
        '🔥', '🌟', '💫', '👑', '🏆', '⚡',
        '🎨', '📊', '📈', '🛠️', '🌐', '🔮',
        '📱', '💻', '📚', '🎮', '🎬', '📁',
        '📂', '💼', '🎭', '🎪', '🎸', '🎹'
    ];

    const icons = {
        'plus': '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        'file-text': '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        'check-square': '<svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
        'x': '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        'trash': '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        'edit': '<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
    };

    let selectedColor = COLORS[4]; // Green by default
    let selectedIcon = ICONS[0]; // Diamond by default 💎 - PREMIUM!

    /**
     * Get projects from AppState
     */
    function getProjects() {
        return typeof AppState !== 'undefined' ? AppState.projects || [] : [];
    }

    /**
     * Get tasks count for a project
     */
    function getProjectTasksCount(projectName) {
        const tasks = typeof AppState !== 'undefined' ? AppState.tasks || [] : [];
        return tasks.filter(t => t.project === projectName).length;
    }

    /**
     * Get notes count for a project
     */
    function getProjectNotesCount(projectId) {
        try {
            if (typeof NotesModule !== 'undefined' && typeof NotesModule.getNotesByProject === 'function') {
                const notes = NotesModule.getNotesByProject(projectId);
                return Array.isArray(notes) ? notes.length : 0;
            }
            if (typeof NotesModule !== 'undefined' && typeof NotesModule.getNotes === 'function') {
                const notes = NotesModule.getNotes();
                return Array.isArray(notes)
                    ? notes.filter(n => n.project_id === projectId || n.projectId === projectId).length
                    : 0;
            }
            return 0;
        } catch (e) {
            console.warn('Could not get notes count:', e);
            return 0;
        }
    }

    /**
     * Render projects grid
     */
    function render() {
        console.log('📁 ProjectsView.render() called');
        const container = document.getElementById('view-projects');
        if (!container) {
            console.error('❌ ProjectsView: #view-projects not found');
            return;
        }

        const projects = getProjects();
        console.log('📁 ProjectsView: Found', projects.length, 'projects');

        container.innerHTML = `
            <div class="view-header">
                <h1 class="view-title">
                    <span class="view-title-icon">
                        <svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    </span>
                    Projets
                </h1>
                <div class="view-actions">
                    <button class="btn btn-primary" onclick="ProjectsView.openCreateModal()">
                        ${icons['plus']} Nouveau projet
                    </button>
                </div>
            </div>

            <div class="projects-grid">
                ${projects.map(project => renderProjectCard(project)).join('')}

                <!-- Add Project Card -->
                <div class="project-card new" onclick="ProjectsView.openCreateModal()">
                    ${icons['plus']}
                    <span>Nouveau projet</span>
                </div>
            </div>
        `;
    }

    /**
     * Render single project card
     */
    function renderProjectCard(project) {
        const tasksCount = getProjectTasksCount(project.name);
        const notesCount = getProjectNotesCount(project.id);
        const color = project.color || COLORS[Math.floor(Math.random() * COLORS.length)];
        const icon = project.icon || ICONS[0];

        return `
            <div class="project-card"
                 style="--project-color: ${color};"
                 onclick="ProjectsView.openProject('${project.id}', '${escapeHtml(project.name)}')">
                <div class="project-header">
                    <div class="project-icon" style="background: ${color}20; color: ${color};">
                        ${icon}
                    </div>
                    <div class="project-title">
                        <h3>${escapeHtml(project.name)}</h3>
                        <p>${project.description || 'Aucune description'}</p>
                    </div>
                </div>
                <div class="project-stats">
                    <div class="project-stat">
                        ${icons['check-square']}
                        <span>${tasksCount} tâches</span>
                    </div>
                    <div class="project-stat">
                        ${icons['file-text']}
                        <span>${notesCount} notes</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Open project (filter tasks by project or show empty view)
     */
    function openProject(projectId, projectName) {
        const tasksCount = getProjectTasksCount(projectName);

        if (tasksCount === 0) {
            // Project is empty - show detail view
            showProjectDetail(projectId, projectName);
        } else {
            // Project has tasks - navigate to tasks view with filter
            if (typeof AppState !== 'undefined') {
                AppState.setFilter('project', projectName);
            }

            // Navigate to tasks view
            ViewRouter.navigate('tasks');

            // Click on the project chip if exists
            setTimeout(() => {
                const chip = document.querySelector(`.project-chip[data-project="${projectName}"]`);
                if (chip) chip.click();
            }, 100);
        }
    }

    /**
     * Show project detail view (for empty projects)
     */
    function showProjectDetail(projectId, projectName) {
        console.log('📁 ProjectsView.showProjectDetail:', projectName);

        const container = document.getElementById('view-projects');
        if (!container) return;

        // Find project data
        const projects = getProjects();
        const project = projects.find(p => p.id === projectId) || {
            id: projectId,
            name: projectName,
            color: COLORS[4],
            icon: ICONS[0]
        };

        const color = project.color || COLORS[4];
        const icon = project.icon || ICONS[0];
        const notesCount = getProjectNotesCount(projectId);

        container.innerHTML = `
            <div class="view-header">
                <button class="btn btn-secondary" onclick="ProjectsView.render()">
                    <svg viewBox="0 0 24 24" width="16" height="16" style="margin-right: 6px;">
                        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Retour aux projets
                </button>
            </div>

            <div class="project-detail-container">
                <div class="project-detail-header" style="--project-color: ${color};">
                    <div class="project-detail-icon" style="background: ${color}20; color: ${color}; border: 2px solid ${color};">
                        ${icon}
                    </div>
                    <div class="project-detail-info">
                        <h1 class="project-detail-title">${escapeHtml(project.name)}</h1>
                        <p class="project-detail-desc">${project.description || 'Aucune description'}</p>
                    </div>
                </div>

                <div class="project-detail-stats">
                    <div class="project-detail-stat">
                        ${icons['check-square']}
                        <span>0 tâches</span>
                    </div>
                    <div class="project-detail-stat">
                        ${icons['file-text']}
                        <span>${notesCount} notes</span>
                    </div>
                </div>

                <div class="project-empty-state">
                    <div class="project-empty-icon">📋</div>
                    <h2 class="project-empty-title">Ce projet est vide pour l'instant</h2>
                    <p class="project-empty-text">Commencez par ajouter une première tâche à ce projet.</p>
                    <button class="btn btn-primary btn-large" onclick="ProjectsView.addTaskToProject('${projectId}', '${escapeHtml(projectName)}')">
                        ${icons['plus']} Ajouter une tâche
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Add task to specific project
     */
    function addTaskToProject(projectId, projectName) {
        console.log('📁 ProjectsView.addTaskToProject:', projectName);

        // Navigate to tasks view
        ViewRouter.navigate('tasks');

        // Pre-select the project in the task creation form
        setTimeout(() => {
            const projectSelect = document.getElementById('task-project');
            if (projectSelect) {
                projectSelect.value = projectName;
            }

            // Focus the task input
            const taskInput = document.getElementById('new-task-input') || document.getElementById('task-text');
            if (taskInput) {
                taskInput.focus();
            }
        }, 200);
    }

    /**
     * Open create modal
     */
    function openCreateModal() {
        // Create modal if not exists
        let modal = document.getElementById('project-create-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'project-create-modal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        selectedColor = COLORS[4];
        selectedIcon = ICONS[0];

        modal.innerHTML = `
            <div class="modal-card">
                <div class="modal-header">
                    <h2>Nouveau projet</h2>
                    <button class="modal-close" onclick="ProjectsView.closeCreateModal()">
                        ${icons['x']}
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Description courte</label>
                        <input type="text" class="form-input" id="new-project-desc" placeholder="Ex: Application de suivi des ventes...">
                        <button class="ai-suggest-btn" onclick="ProjectsView.suggestProjectName()" id="ai-name-btn">
                            <span class="ai-btn-icon-container">
                                <svg class="ai-sparkle ai-sparkle-1" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"/>
                                </svg>
                                <svg class="ai-sparkle ai-sparkle-2" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"/>
                                </svg>
                                <svg class="ai-brain" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M9.5 2C7.5 2 6 3.5 6 5.5C6 6.06 6.13 6.58 6.35 7.05C5.05 7.35 4 8.5 4 10C4 11.5 5.05 12.65 6.35 12.95C6.13 13.42 6 13.94 6 14.5C6 16.5 7.5 18 9.5 18C10.06 18 10.58 17.87 11.05 17.65C11.35 18.95 12.5 20 14 20C15.5 20 16.65 18.95 16.95 17.65C17.42 17.87 17.94 18 18.5 18C20.5 18 22 16.5 22 14.5C22 13.94 21.87 13.42 21.65 12.95C22.95 12.65 24 11.5 24 10C24 8.5 22.95 7.35 21.65 7.05C21.87 6.58 22 6.06 22 5.5C22 3.5 20.5 2 18.5 2C17.94 2 17.42 2.13 16.95 2.35C16.65 1.05 15.5 0 14 0C12.5 0 11.35 1.05 11.05 2.35C10.58 2.13 10.06 2 9.5 2Z"/>
                                </svg>
                            </span>
                            <span class="ai-btn-text">Suggérer un nom avec l'IA</span>
                            <span class="ai-btn-shine"></span>
                        </button>
                    </div>
                    <div class="form-group">
                        <label>Nom du projet</label>
                        <input type="text" class="form-input" id="new-project-name" placeholder="Le nom sera généré par l'IA...">
                    </div>
                    <div class="form-group">
                        <label>Couleur</label>
                        <div class="color-picker">
                            ${COLORS.map(c => `
                                <div class="color-option ${c === selectedColor ? 'selected' : ''}"
                                     style="background: ${c};"
                                     onclick="ProjectsView.selectColor('${c}')"></div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Icône</label>
                        <div class="icon-picker">
                            ${ICONS.map(i => `
                                <div class="icon-option ${i === selectedIcon ? 'selected' : ''}"
                                     onclick="ProjectsView.selectIcon('${i}')">${i}</div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="ProjectsView.closeCreateModal()">Annuler</button>
                    <button class="btn btn-primary" onclick="ProjectsView.createProject()">Créer le projet</button>
                </div>
            </div>
        `;

        modal.classList.add('active');

        // Focus input
        setTimeout(() => {
            const input = document.getElementById('new-project-name');
            if (input) input.focus();
        }, 100);
    }

    /**
     * Close create modal
     */
    function closeCreateModal() {
        const modal = document.getElementById('project-create-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Select color
     */
    function selectColor(color) {
        selectedColor = color;
        document.querySelectorAll('.color-option').forEach(el => {
            el.classList.toggle('selected', el.style.background === color);
        });
    }

    /**
     * Select icon
     */
    function selectIcon(icon) {
        selectedIcon = icon;
        document.querySelectorAll('.icon-option').forEach(el => {
            el.classList.toggle('selected', el.textContent === icon);
        });
    }

    /**
     * Create project
     */
    async function createProject() {
        const nameInput = document.getElementById('new-project-name');
        const descInput = document.getElementById('new-project-desc');

        const name = nameInput?.value?.trim();
        if (!name) {
            nameInput?.focus();
            nameInput.style.borderColor = 'var(--danger)';
            setTimeout(() => {
                nameInput.style.borderColor = '';
            }, 1500);
            return;
        }

        const projectData = {
            name,
            description: descInput?.value?.trim() || '',
            color: selectedColor,
            icon: selectedIcon
        };

        console.log('📁 Creating project:', projectData);

        try {
            // Use ApiProjects if available (PostgreSQL backend)
            if (typeof ApiProjects !== 'undefined' && ApiProjects.create) {
                const created = await ApiProjects.create(projectData);
                console.log('✅ Project created via API:', created);

                // Add to AppState
                if (typeof AppState !== 'undefined') {
                    AppState.addProject(created);
                }
            } else if (typeof Projects !== 'undefined' && Projects.create) {
                // Fallback to Projects module
                await Projects.create(projectData);
            } else if (typeof AppState !== 'undefined') {
                // Last fallback: add to AppState directly
                const newProject = {
                    id: 'proj_' + Date.now(),
                    ...projectData
                };
                AppState.projects.push(newProject);
            }

            closeCreateModal();
            render();

            // Refresh project filter chips
            if (typeof Projects !== 'undefined') {
                Projects.renderFilter();
                Projects.renderSelect();
            }

            // Success toast
            if (typeof Toast !== 'undefined') {
                Toast.success(`Projet "${name}" créé avec succès !`);
            }
        } catch (error) {
            console.error('❌ Project creation failed:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Erreur lors de la création du projet');
            }
        }
    }

    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Suggest project name using AI
     */
    async function suggestProjectName() {
        const descInput = document.getElementById('new-project-desc');
        const nameInput = document.getElementById('new-project-name');
        const btn = document.getElementById('ai-name-btn');

        const description = descInput?.value?.trim();
        if (!description) {
            if (descInput) {
                descInput.focus();
                descInput.style.borderColor = 'var(--danger)';
                setTimeout(() => {
                    descInput.style.borderColor = '';
                }, 1500);
            }
            return;
        }

        if (typeof ApiProjects === 'undefined' || !ApiProjects.suggestName) {
            console.error('❌ ApiProjects.suggestName not available');
            return;
        }

        // Show loading state
        if (btn) {
            btn.classList.add('loading');
            btn.textContent = 'Génération en cours...';
        }

        try {
            const suggestedName = await ApiProjects.suggestName(description);
            if (suggestedName && nameInput) {
                nameInput.value = suggestedName;
                nameInput.style.borderColor = 'var(--accent)';
                nameInput.style.background = 'var(--accent)10';
                setTimeout(() => {
                    nameInput.style.borderColor = '';
                    nameInput.style.background = '';
                }, 2000);
                console.log('✨ AI suggested name:', suggestedName);
            }
        } catch (error) {
            console.error('❌ AI suggestion failed:', error);
        } finally {
            if (btn) {
                btn.classList.remove('loading');
                btn.innerHTML = `
                    <span class="ai-btn-icon-container">
                        <svg class="ai-sparkle ai-sparkle-1" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"/>
                        </svg>
                        <svg class="ai-sparkle ai-sparkle-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"/>
                        </svg>
                        <svg class="ai-brain" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M9.5 2C7.5 2 6 3.5 6 5.5C6 6.06 6.13 6.58 6.35 7.05C5.05 7.35 4 8.5 4 10C4 11.5 5.05 12.65 6.35 12.95C6.13 13.42 6 13.94 6 14.5C6 16.5 7.5 18 9.5 18C10.06 18 10.58 17.87 11.05 17.65C11.35 18.95 12.5 20 14 20C15.5 20 16.65 18.95 16.95 17.65C17.42 17.87 17.94 18 18.5 18C20.5 18 22 16.5 22 14.5C22 13.94 21.87 13.42 21.65 12.95C22.95 12.65 24 11.5 24 10C24 8.5 22.95 7.35 21.65 7.05C21.87 6.58 22 6.06 22 5.5C22 3.5 20.5 2 18.5 2C17.94 2 17.42 2.13 16.95 2.35C16.65 1.05 15.5 0 14 0C12.5 0 11.35 1.05 11.05 2.35C10.58 2.13 10.06 2 9.5 2Z"/>
                        </svg>
                    </span>
                    <span class="ai-btn-text">Suggérer un nom avec l'IA</span>
                    <span class="ai-btn-shine"></span>
                `;
            }
        }
    }

    /**
     * Refresh view
     */
    function refresh() {
        render();
    }

    /**
     * Initialize
     */
    function init() {
        console.log('📁 ProjectsView: Initializing...');
        console.log('✅ ProjectsView: Ready');
    }

    return {
        init,
        render,
        refresh,
        openProject,
        showProjectDetail,
        addTaskToProject,
        openCreateModal,
        closeCreateModal,
        selectColor,
        selectIcon,
        createProject,
        suggestProjectName
    };
})();

if (typeof window !== 'undefined') {
    window.ProjectsView = ProjectsView;
}
