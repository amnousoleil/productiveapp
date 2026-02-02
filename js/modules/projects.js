// =============================================
// PRODUCTIVEAPP - PROJECTS MODULE
// Gestion des projets
// =============================================

const Projects = {
    /**
     * Charge les projets depuis l'API
     */
    async load() {
        const projects = await ApiService.loadProjects();
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

        Utils.$('count-all').textContent = totalCount;
        window.projects = AppState.projects;

        Utils.$('projects-filter-list').innerHTML = AppState.projects.map(p => `
            <button class="project-chip ${AppState.filters.project === p.id ? 'active' : ''}" data-project="${p.id}">
                <span class="chip-icon">${p.icon}</span>
                <span class="chip-name">${p.name}</span>
                <span class="chip-count">${counts[p.id] || 0}</span>
                <span class="chip-delete" data-delete="${p.id}" title="Supprimer ce projet">×</span>
            </button>
        `).join('');

        // Event listeners pour filtrage
        document.querySelectorAll('.project-chip').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.classList.contains('chip-delete')) return;

                document.querySelectorAll('.project-chip').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                AppState.setFilter('project', btn.dataset.project);
                Tasks.render();
            });
        });

        // Event listeners pour suppression
        document.querySelectorAll('.chip-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.delete(btn.dataset.delete);
            });
        });

        // Réinitialiser drag & drop
        if (typeof initProjectDragAndDrop === 'function') {
            initProjectDragAndDrop();
        }
    },

    /**
     * Render le sélecteur de projet pour création de tâche
     */
    renderSelect() {
        const select = Utils.$('project-select');
        if (select) {
            select.innerHTML = '<option value="">Projet...</option>' +
                AppState.projects.map(p => `<option value="${p.id}">${p.icon} ${p.name}</option>`).join('');
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
            desc: desc || name
        };

        const result = await ApiService.createProject(projectData);

        if (result) {
            const newProject = {
                id: result.project_id || Utils.generateId('proj'),
                name: result.name || projectData.name,
                icon: result.icon || projectData.icon,
                color: result.color || projectData.color,
                desc: result.description || projectData.desc
            };

            AppState.addProject(newProject);
            this.renderFilter();
            this.renderSelect();
            console.log('✅ Projet ajouté:', projectData.name);
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

        if (!confirm(`Supprimer le projet "${project.name}" ?`)) return;

        // Supprimer de la DB si c'est un projet custom
        if (projectId.startsWith('proj_')) {
            await ApiService.deleteProject(projectId);
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

        if (userFilterBtn) {
            userFilterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userFilterDropdown.classList.toggle('open');
            });
        }

        // Fermer dropdown au clic extérieur
        document.addEventListener('click', (e) => {
            if (userFilterDropdown && !userFilterDropdown.contains(e.target)) {
                userFilterDropdown.classList.remove('open');
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
