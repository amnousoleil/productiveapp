// =============================================
// PRODUCTIVEAPP - PROJECTS MODULE
// Gestion des projets
// =============================================

const Projects = {
    /**
     * Charge les projets depuis l'API
     */
    async load() {
        let projects = [];

        // Utiliser l'API PostgreSQL si disponible
        if (typeof ApiProjects !== 'undefined' && ApiTokens.getWorkspaceId()) {
            console.log('📦 Loading projects via PostgreSQL API...');
            try {
                projects = await ApiProjects.getAll();
                console.log('✅ Projects loaded via API:', projects.length);
            } catch (error) {
                console.error('❌ API projects load failed:', error);
                // Fallback vers N8N
                projects = await ApiService.loadProjects();
            }
        } else {
            // Fallback N8N
            console.log('📦 Loading projects via N8N fallback...');
            projects = await ApiService.loadProjects();
        }

        AppState.setProjects(projects);
        return projects;
    },

    /**
     * Render le filtre de projets
     */
    renderFilter() {
        const counts = {};
        AppState.projects.forEach(p => {
            counts[p.id] = AppState.tasks.filter(t => t.project === p.id && t.status !== 'done').length;
        });
        const totalCount = AppState.tasks.filter(t => t.status !== 'done').length;
        const current = AppState.filters.project;

        // Mettre à jour le compteur global et le label du bouton
        const countEl = Utils.$('count-all');
        if (countEl) countEl.textContent = totalCount;
        window.projects = AppState.projects;

        this._updateFilterButton(current, counts, totalCount);

        // Construire la liste dropdown
        const list = Utils.$('project-filter-list');
        if (!list) return;

        const check = '<span class="pf-option-check"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5l3 3 5-6.5"/></svg></span>';

        const allOption = `<div class="pf-option ${current === 'all' ? 'active' : ''}" data-project="all">${check}<span class="pf-option-icon">📊</span><span class="pf-option-name">Tous les projets</span><span class="pf-option-count">${totalCount}</span></div>`;

        const sep = '<div class="pf-option-separator"></div>';

        const projectOptions = AppState.projects.map(p =>
            `<div class="pf-option ${current === p.id ? 'active' : ''}" data-project="${p.id}">${check}<span class="pf-option-icon">${p.icon}</span><span class="pf-option-name">${p.name}</span><span class="pf-option-count">${counts[p.id] || 0}</span><button class="pf-option-delete" data-delete="${p.id}" title="Supprimer">&times;</button></div>`
        ).join('');

        list.innerHTML = allOption + (AppState.projects.length ? sep : '') + projectOptions;

        // Event listeners
        list.querySelectorAll('.pf-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                if (e.target.closest('.pf-option-delete')) return;
                this._selectProject(opt.dataset.project);
            });
        });

        list.querySelectorAll('.pf-option-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.delete(btn.dataset.delete);
            });
        });
    },

    /**
     * Met à jour le texte du bouton dropdown
     */
    _updateFilterButton(projectId, counts, totalCount) {
        const nameEl = Utils.$('project-filter-name');
        const countEl = Utils.$('count-all');
        const iconBtn = document.querySelector('.project-dropdown-btn .pf-icon');
        if (!nameEl) return;

        if (projectId === 'all') {
            nameEl.textContent = 'Tous les projets';
            if (iconBtn) iconBtn.textContent = '📁';
            if (countEl) countEl.textContent = totalCount;
        } else {
            const p = AppState.findProject(projectId);
            if (p) {
                nameEl.textContent = p.name;
                if (iconBtn) iconBtn.textContent = p.icon;
                if (countEl) countEl.textContent = counts[projectId] || 0;
            }
        }
    },

    /**
     * Sélectionne un projet depuis le dropdown
     */
    _selectProject(projectId) {
        AppState.setFilter('project', projectId);

        // Sync le select de création de tâche
        const select = Utils.$('project-select');
        if (select) select.value = projectId === 'all' ? '' : projectId;

        // Fermer le dropdown
        const dd = Utils.$('project-filter-dropdown');
        if (dd) dd.classList.remove('open');

        // Re-render
        this.renderFilter();
        Tasks.render();
    },

    /**
     * Render le sélecteur de projet pour création de tâche
     */
    renderSelect() {
        const select = Utils.$('project-select');
        if (select) {
            const currentFilter = AppState.filters?.project;
            select.innerHTML = '<option value="">Projet...</option>' +
                AppState.projects.map(p =>
                    `<option value="${p.id}" ${currentFilter === p.id ? 'selected' : ''}>${p.icon} ${p.name}</option>`
                ).join('');
        }
    },

    /**
     * Render le sélecteur d'utilisateur pour le filtre
     */
    renderUserFilter() {
        const options = Utils.$('user-filter-options');
        if (!options) return;

        options.innerHTML = `
            <div class="custom-select-option active" data-value="all">
                <span class="option-emoji">👥</span>
                <span>Tout le monde</span>
            </div>
            ${AppConfig.USERS.map(u => `
                <div class="custom-select-option" data-value="${u.id}">
                    <span class="option-emoji">${u.avatar}</span>
                    <span>${u.name}</span>
                </div>
            `).join('')}
        `;

        options.querySelectorAll('.custom-select-option').forEach(opt => {
            opt.addEventListener('click', () => this.selectUserFilter(opt.dataset.value));
        });
    },

    /**
     * Sélectionne un filtre utilisateur
     * @param {string} value - ID utilisateur ou 'all'
     */
    selectUserFilter(value) {
        AppState.setFilter('user', value);

        const btn = Utils.$('user-filter-btn');
        const options = Utils.$('user-filter-options');

        options.querySelectorAll('.custom-select-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.value === value);
        });

        if (value === 'all') {
            btn.querySelector('.select-avatar').textContent = '👥';
            btn.querySelector('.select-text').textContent = 'Tout le monde';
        } else {
            const user = AppConfig.USERS.find(u => u.id === value);
            if (user) {
                btn.querySelector('.select-avatar').textContent = user.avatar;
                btn.querySelector('.select-text').textContent = user.name;
            }
        }

        Utils.$('user-filter-dropdown').classList.remove('open');

        Tasks.render();
        Journal.render();
    },

    /**
     * Render le sélecteur d'assignation
     */
    renderAssignSelect() {
        const select = Utils.$('assign-select');
        if (!select) return;

        select.innerHTML = `<option value="">👤 Moi</option>` +
            AppConfig.USERS.filter(u => u.id !== AppState.currentUser?.id).map(u =>
                `<option value="${u.id}">${u.name}</option>`
            ).join('');
    },

    /**
     * Crée un nouveau projet
     */
    async create() {
        const name = Utils.$('new-project-name').value.trim();
        const desc = Utils.$('new-project-desc').value.trim();
        if (!name) return;

        const icons = ['📁', '🎯', '💡', '🚀', '⭐', '🔥', '💎', '🌟'];
        const colors = ['#e07840', '#00ff66', '#ff6b9d', '#6c8fff', '#00b4d8', '#bf6bff', '#f97316', '#4ade80'];

        const projectData = {
            name: name,
            icon: icons[Math.floor(Math.random() * icons.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            description: desc || name
        };

        let result = null;

        // Utiliser l'API PostgreSQL si disponible
        if (typeof ApiProjects !== 'undefined' && ApiTokens.getWorkspaceId()) {
            console.log('📦 Creating project via PostgreSQL API...');
            try {
                result = await ApiProjects.create(projectData);
                console.log('✅ Project created via API:', result);
            } catch (error) {
                console.error('❌ API project creation failed:', error);
                // Fallback vers N8N
                result = await ApiService.createProject(projectData);
            }
        } else {
            // Fallback N8N
            console.log('📦 Creating project via N8N fallback...');
            result = await ApiService.createProject(projectData);
        }

        if (result) {
            const newProject = {
                id: result.id || result.project_id || Utils.generateId('proj'),
                name: result.name || projectData.name,
                icon: result.icon || projectData.icon,
                color: result.color || projectData.color,
                desc: result.description || projectData.description
            };

            AppState.addProject(newProject);
            this.renderFilter();
            this.renderSelect();
            console.log('✅ Projet ajouté:', newProject.name, 'ID:', newProject.id);

            // XP Feedback: nouveau projet créé
            if (typeof XPFeedback !== 'undefined' && XPFeedback.recordAction) {
                XPFeedback.recordAction('project_created', null, 'Projet créé')
                    .catch(err => console.warn('XP Feedback failed:', err));
            }
        }

        this.closeModal();
    },

    /**
     * Supprime un projet
     * @param {string} projectId - ID du projet
     */
    async delete(projectId) {
        const project = AppState.findProject(projectId);
        if (!project) return;

        // Vérifier si le projet contient des tâches
        const taskCount = AppState.tasks.filter(t => t.project === projectId).length;

        if (taskCount > 0) {
            Utils.notify(`⚠️ Impossible de supprimer "${project.name}"\n\nCe projet contient ${taskCount} tâche(s).\nDéplace-les d'abord vers un autre projet.`, 'warning');
            return;
        }

        const confirmed = await ConfirmModal.confirmDelete(`le projet "${project.name}"`);
        if (!confirmed) return;

        // Supprimer de la DB
        try {
            if (typeof ApiProjects !== 'undefined' && ApiTokens.getWorkspaceId()) {
                console.log('🗑️ Deleting project via PostgreSQL API:', projectId);
                await ApiProjects.remove(projectId);
                console.log('✅ Project deleted via API');
            } else if (projectId.startsWith('proj_')) {
                // Fallback N8N pour anciens projets
                await ApiService.deleteProject(projectId);
            }
        } catch (error) {
            console.error('❌ Project deletion failed:', error);
            Utils.notify('Erreur lors de la suppression du projet', 'error');
            return;
        }

        AppState.removeProject(projectId);

        // Reset filtre si nécessaire
        if (AppState.filters.project === projectId) {
            AppState.setFilter('project', 'all');
        }

        this.renderFilter();
        this.renderSelect();
        console.log('✅ Projet supprimé:', project.name);
    },

    /**
     * Ouvre le modal de création de projet
     */
    openModal() {
        Utils.$('project-modal').classList.remove('hidden');
        Utils.$('new-project-name').focus();
    },

    /**
     * Ferme le modal de création de projet
     */
    closeModal() {
        Utils.$('project-modal').classList.add('hidden');
        Utils.$('new-project-name').value = '';
        Utils.$('new-project-desc').value = '';
    },

    /**
     * Initialise les événements
     */
    initEvents() {
        const addBtn = Utils.$('add-project-btn');
        const cancelBtn = Utils.$('cancel-project');
        const confirmBtn = Utils.$('confirm-project');
        const modal = Utils.$('project-modal');
        const userFilterBtn = Utils.$('user-filter-btn');
        const userFilterDropdown = Utils.$('user-filter-dropdown');
        const projectFilterBtn = Utils.$('project-filter-btn');
        const projectFilterDropdown = Utils.$('project-filter-dropdown');

        if (addBtn) {
            addBtn.addEventListener('click', () => this.openModal());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.create());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal();
            });
        }

        // Toggle dropdown projet
        if (projectFilterBtn) {
            projectFilterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                projectFilterDropdown.classList.toggle('open');
                // Fermer l'autre dropdown
                if (userFilterDropdown) userFilterDropdown.classList.remove('open');
            });
        }

        if (userFilterBtn) {
            userFilterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userFilterDropdown.classList.toggle('open');
                // Fermer l'autre dropdown
                if (projectFilterDropdown) projectFilterDropdown.classList.remove('open');
            });
        }

        // Fermer dropdowns au clic extérieur
        document.addEventListener('click', (e) => {
            if (userFilterDropdown && !userFilterDropdown.contains(e.target)) {
                userFilterDropdown.classList.remove('open');
            }
            if (projectFilterDropdown && !projectFilterDropdown.contains(e.target)) {
                projectFilterDropdown.classList.remove('open');
            }
        });
    }
};

// Exposer globalement pour compatibilité
window.Projects = Projects;
window.renderProjectsFilter = () => Projects.renderFilter();
window.renderProjectSelect = () => Projects.renderSelect();
window.renderUserFilter = () => Projects.renderUserFilter();
window.renderAssignSelect = () => Projects.renderAssignSelect();
window.selectUserFilter = (value) => Projects.selectUserFilter(value);
window.openProjectModal = () => Projects.openModal();
window.closeProjectModal = () => Projects.closeModal();
window.createProject = () => Projects.create();
window.deleteProject = (id) => Projects.delete(id);
