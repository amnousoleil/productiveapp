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

    // Available icons
    const ICONS = [
        '📁', '📂', '💼', '🎯', '🚀', '💡', '⭐', '🔥',
        '💎', '🎨', '📊', '📈', '🛠️', '⚡', '🌟', '💫',
        '🎮', '🎬', '📱', '💻', '🌐', '📚', '✨', '🔮'
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
    let selectedIcon = ICONS[0]; // Folder by default

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
        return typeof NotesModule !== 'undefined'
            ? NotesModule.getNotesByProject(projectId).length
            : 0;
    }

    /**
     * Render projects grid
     */
    function render() {
        const container = document.getElementById('view-projects');
        if (!container) return;

        const projects = getProjects();

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
     * Open project (filter tasks by project)
     */
    function openProject(projectId, projectName) {
        // Filter tasks by this project
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
            <div class="modal">
                <div class="modal-header">
                    <h2>Nouveau projet</h2>
                    <button class="modal-close" onclick="ProjectsView.closeCreateModal()">
                        ${icons['x']}
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Nom du projet</label>
                        <input type="text" class="form-input" id="new-project-name" placeholder="Mon projet...">
                    </div>
                    <div class="form-group">
                        <label>Description (optionnel)</label>
                        <input type="text" class="form-input" id="new-project-desc" placeholder="Description...">
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
            return;
        }

        const projectData = {
            name,
            description: descInput?.value?.trim() || '',
            color: selectedColor,
            icon: selectedIcon
        };

        // Use existing Projects module if available
        if (typeof Projects !== 'undefined' && Projects.create) {
            await Projects.create(projectData);
        } else if (typeof AppState !== 'undefined') {
            // Fallback: add to AppState directly
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
        openCreateModal,
        closeCreateModal,
        selectColor,
        selectIcon,
        createProject
    };
})();

if (typeof window !== 'undefined') {
    window.ProjectsView = ProjectsView;
}
