// =============================================
// PRODUCTIVEAPP - WORKSPACES MODULE
// Gestion des espaces de travail
// =============================================

const WorkspacesModule = {
    initialized: false,
    workspaces: [],
    currentWorkspace: null,

    /**
     * Initialise le module
     */
    init() {
        if (this.initialized) return;
        this.loadFromStorage();
        this.setupClickOutside();
        console.log('[WorkspacesModule] Initialized');
        this.initialized = true;
    },

    /**
     * Setup click outside handler to close dropdown
     */
    setupClickOutside() {
        document.addEventListener('click', (e) => {
            const selector = document.getElementById('workspace-selector-premium');
            if (selector && !selector.contains(e.target)) {
                this.closeDropdown();
            }
        });
    },

    /**
     * Charge depuis le localStorage
     */
    loadFromStorage() {
        const saved = localStorage.getItem('current_workspace_id');
        if (saved) {
            this.currentWorkspaceId = saved;
        }
    },

    /**
     * Charge tous les workspaces de l'utilisateur
     */
    async loadWorkspaces() {
        try {
            const response = await ApiFetch.get('/workspaces');
            this.workspaces = response.data?.workspaces || [];

            // Selectionner le premier workspace par defaut
            if (this.workspaces.length > 0 && !this.currentWorkspace) {
                await this.select(this.workspaces[0].id);
            }

            return this.workspaces;
        } catch (error) {
            console.error('[WorkspacesModule] Load error:', error);
            return [];
        }
    },

    /**
     * Selectionne un workspace
     */
    async select(workspaceId) {
        const workspace = this.workspaces.find(w => w.id === workspaceId);
        if (workspace) {
            this.currentWorkspace = workspace;
            localStorage.setItem('current_workspace_id', workspaceId);

            // Emettre un evenement pour notifier les autres modules
            window.dispatchEvent(new CustomEvent('workspace-changed', {
                detail: { workspace }
            }));
        }
        return workspace;
    },

    /**
     * Recupere le workspace courant
     */
    getCurrent() {
        return this.currentWorkspace;
    },

    /**
     * Recupere l'ID du workspace courant
     */
    getCurrentId() {
        return this.currentWorkspace?.id || localStorage.getItem('current_workspace_id');
    },

    /**
     * Cree un nouveau workspace
     */
    async create(data) {
        try {
            const response = await ApiFetch.post('/workspaces', data);
            if (response.success && response.data?.workspace) {
                this.workspaces.push(response.data.workspace);
            }
            return response;
        } catch (error) {
            console.error('[WorkspacesModule] Create error:', error);
            throw error;
        }
    },

    /**
     * Met a jour un workspace
     */
    async update(workspaceId, data) {
        try {
            const response = await ApiFetch.put(`/workspaces/${workspaceId}`, data);
            if (response.success) {
                const index = this.workspaces.findIndex(w => w.id === workspaceId);
                if (index !== -1) {
                    this.workspaces[index] = { ...this.workspaces[index], ...data };
                }
                if (this.currentWorkspace?.id === workspaceId) {
                    this.currentWorkspace = { ...this.currentWorkspace, ...data };
                }
            }
            return response.success;
        } catch (error) {
            console.error('[WorkspacesModule] Update error:', error);
            return false;
        }
    },

    /**
     * Supprime un workspace
     */
    async delete(workspaceId) {
        try {
            const response = await ApiFetch.delete(`/workspaces/${workspaceId}`);
            if (response.success) {
                this.workspaces = this.workspaces.filter(w => w.id !== workspaceId);
                if (this.currentWorkspace?.id === workspaceId) {
                    this.currentWorkspace = this.workspaces[0] || null;
                }
            }
            return response.success;
        } catch (error) {
            console.error('[WorkspacesModule] Delete error:', error);
            return false;
        }
    },

    /**
     * Invite un membre
     */
    async inviteMember(workspaceId, email, role = 'member') {
        try {
            const response = await ApiFetch.post(`/workspaces/${workspaceId}/invite`, {
                email,
                role
            });
            return response.success;
        } catch (error) {
            console.error('[WorkspacesModule] Invite error:', error);
            return false;
        }
    },

    /**
     * Liste les membres d'un workspace
     */
    async getMembers(workspaceId) {
        try {
            const response = await ApiFetch.get(`/workspaces/${workspaceId}/members`);
            return response.data?.members || [];
        } catch (error) {
            console.error('[WorkspacesModule] Get members error:', error);
            return [];
        }
    },

    /**
     * Retire un membre
     */
    async removeMember(workspaceId, userId) {
        try {
            const response = await ApiFetch.delete(`/workspaces/${workspaceId}/members/${userId}`);
            return response.success;
        } catch (error) {
            console.error('[WorkspacesModule] Remove member error:', error);
            return false;
        }
    },

    /**
     * Render le selecteur de workspace (simple)
     */
    renderSelector(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <select id="workspace-selector" onchange="WorkspacesModule.select(this.value)">
                ${this.workspaces.map(w => `
                    <option value="${w.id}" ${w.id === this.currentWorkspace?.id ? 'selected' : ''}>
                        ${w.name}
                    </option>
                `).join('')}
            </select>
        `;
    },

    /**
     * Render le selecteur premium pour la sidebar
     */
    renderPremiumSelector() {
        const current = this.currentWorkspace;
        const workspaceIcon = this.getWorkspaceIcon(current?.type || 'personal');
        const workspaceName = current?.name || 'Mon Workspace';

        return `
            <div class="workspace-selector" id="workspace-selector-premium">
                <button class="workspace-selector-btn" onclick="WorkspacesModule.toggleDropdown()">
                    <div class="workspace-selector-icon">${workspaceIcon}</div>
                    <div class="workspace-selector-info">
                        <span class="workspace-name">${workspaceName}</span>
                        <span class="workspace-type">${this.getTypeLabel(current?.type)}</span>
                    </div>
                    <svg class="workspace-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>
                <div class="workspace-dropdown" id="workspace-dropdown">
                    <div class="workspace-dropdown-header">
                        <span>Mes workspaces</span>
                        <button class="workspace-add-btn" onclick="WorkspacesModule.showCreateModal()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </button>
                    </div>
                    <div class="workspace-dropdown-list">
                        ${this.workspaces.map(w => `
                            <div class="workspace-dropdown-item ${w.id === current?.id ? 'active' : ''}"
                                 onclick="WorkspacesModule.selectAndClose('${w.id}')">
                                <div class="workspace-item-icon">${this.getWorkspaceIcon(w.type)}</div>
                                <div class="workspace-item-info">
                                    <span class="workspace-item-name">${w.name}</span>
                                    <span class="workspace-item-members">${w.memberCount || 1} membre${(w.memberCount || 1) > 1 ? 's' : ''}</span>
                                </div>
                                ${w.id === current?.id ? '<div class="workspace-item-check">&#10003;</div>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Toggle dropdown
     */
    toggleDropdown() {
        const dropdown = document.getElementById('workspace-dropdown');
        const selector = document.getElementById('workspace-selector-premium');
        if (dropdown && selector) {
            selector.classList.toggle('open');
            dropdown.classList.toggle('visible');
        }
    },

    /**
     * Close dropdown
     */
    closeDropdown() {
        const dropdown = document.getElementById('workspace-dropdown');
        const selector = document.getElementById('workspace-selector-premium');
        if (dropdown && selector) {
            selector.classList.remove('open');
            dropdown.classList.remove('visible');
        }
    },

    /**
     * Select and close dropdown
     */
    async selectAndClose(workspaceId) {
        await this.select(workspaceId);
        this.closeDropdown();
        this.updateSelectorUI();
    },

    /**
     * Update selector UI after selection
     */
    updateSelectorUI() {
        const btn = document.querySelector('.workspace-selector-btn');
        if (!btn || !this.currentWorkspace) return;

        const iconEl = btn.querySelector('.workspace-selector-icon');
        const nameEl = btn.querySelector('.workspace-name');
        const typeEl = btn.querySelector('.workspace-type');

        if (iconEl) iconEl.innerHTML = this.getWorkspaceIcon(this.currentWorkspace.type);
        if (nameEl) nameEl.textContent = this.currentWorkspace.name;
        if (typeEl) typeEl.textContent = this.getTypeLabel(this.currentWorkspace.type);

        // Update active state in dropdown
        document.querySelectorAll('.workspace-dropdown-item').forEach(item => {
            item.classList.remove('active');
            const check = item.querySelector('.workspace-item-check');
            if (check) check.remove();
        });

        const activeItem = document.querySelector(`.workspace-dropdown-item[onclick*="${this.currentWorkspace.id}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            activeItem.innerHTML += '<div class="workspace-item-check">&#10003;</div>';
        }
    },

    /**
     * Get workspace icon based on type
     */
    getWorkspaceIcon(type) {
        const icons = {
            personal: '&#128187;',  // laptop
            team: '&#128101;',      // people
            freelance: '&#128188;', // briefcase
            default: '&#127968;'    // house
        };
        return icons[type] || icons.default;
    },

    /**
     * Get type label
     */
    getTypeLabel(type) {
        const labels = {
            personal: 'Personnel',
            team: 'Equipe',
            freelance: 'Freelance'
        };
        return labels[type] || 'Workspace';
    },

    /**
     * Show create workspace modal
     */
    showCreateModal() {
        this.closeDropdown();

        const modal = document.createElement('div');
        modal.id = 'create-workspace-modal';
        modal.className = 'workspace-modal-overlay';
        modal.innerHTML = `
            <div class="workspace-modal">
                <div class="workspace-modal-header">
                    <h2>Creer un workspace</h2>
                    <button class="workspace-modal-close" onclick="WorkspacesModule.closeCreateModal()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <form id="create-workspace-form" class="workspace-modal-form" onsubmit="WorkspacesModule.handleCreate(event)">
                    <div class="workspace-form-group">
                        <label>Nom du workspace</label>
                        <input type="text" id="new-ws-name" placeholder="Mon nouveau projet" required>
                    </div>
                    <div class="workspace-form-group">
                        <label>Type</label>
                        <div class="workspace-type-select">
                            <label class="type-option selected" data-type="personal">
                                <input type="radio" name="ws-type" value="personal" checked>
                                <span class="type-icon">&#128187;</span>
                                <span class="type-label">Personnel</span>
                            </label>
                            <label class="type-option" data-type="team">
                                <input type="radio" name="ws-type" value="team">
                                <span class="type-icon">&#128101;</span>
                                <span class="type-label">Equipe</span>
                            </label>
                            <label class="type-option" data-type="freelance">
                                <input type="radio" name="ws-type" value="freelance">
                                <span class="type-icon">&#128188;</span>
                                <span class="type-label">Freelance</span>
                            </label>
                        </div>
                    </div>
                    <div class="workspace-modal-actions">
                        <button type="button" class="ws-btn secondary" onclick="WorkspacesModule.closeCreateModal()">Annuler</button>
                        <button type="submit" class="ws-btn primary">Creer</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Add type selection handler
        modal.querySelectorAll('.type-option').forEach(opt => {
            opt.addEventListener('click', () => {
                modal.querySelectorAll('.type-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            });
        });

        // Animate in
        requestAnimationFrame(() => modal.classList.add('visible'));
    },

    /**
     * Close create modal
     */
    closeCreateModal() {
        const modal = document.getElementById('create-workspace-modal');
        if (modal) {
            modal.classList.remove('visible');
            setTimeout(() => modal.remove(), 300);
        }
    },

    /**
     * Handle create form submission
     */
    async handleCreate(event) {
        event.preventDefault();

        const name = document.getElementById('new-ws-name').value.trim();
        const type = document.querySelector('input[name="ws-type"]:checked').value;

        if (!name) return;

        try {
            const response = await this.create({ name, type });
            if (response.success) {
                this.closeCreateModal();
                await this.select(response.data.workspace.id);
                this.updateSelectorUI();

                // Refresh sidebar
                if (typeof Sidebar !== 'undefined' && Sidebar.render) {
                    Sidebar.render();
                }
            }
        } catch (error) {
            console.error('[WorkspacesModule] Create error:', error);
            alert('Erreur lors de la creation du workspace');
        }
    },

    /**
     * Show invite member modal
     */
    showInviteModal() {
        if (!this.currentWorkspace) {
            alert('Selectionne d\'abord un workspace');
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'invite-member-modal';
        modal.className = 'workspace-modal-overlay';
        modal.innerHTML = `
            <div class="workspace-modal invite-modal">
                <div class="workspace-modal-header">
                    <h2>Inviter un membre</h2>
                    <button class="workspace-modal-close" onclick="WorkspacesModule.closeInviteModal()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <form id="invite-member-form" class="workspace-modal-form" onsubmit="WorkspacesModule.handleInvite(event)">
                    <div class="invite-workspace-info">
                        <span class="invite-ws-icon">${this.getWorkspaceIcon(this.currentWorkspace.type)}</span>
                        <span class="invite-ws-name">${this.currentWorkspace.name}</span>
                    </div>

                    <div class="workspace-form-group">
                        <label>Adresse email</label>
                        <input type="email" id="invite-email" placeholder="collegue@entreprise.com" required>
                    </div>

                    <div class="workspace-form-group">
                        <label>Role</label>
                        <div class="invite-role-select">
                            <label class="role-option selected" data-role="member">
                                <input type="radio" name="invite-role" value="member" checked>
                                <div class="role-info">
                                    <span class="role-name">Membre</span>
                                    <span class="role-desc">Peut voir et editer les taches</span>
                                </div>
                            </label>
                            <label class="role-option" data-role="admin">
                                <input type="radio" name="invite-role" value="admin">
                                <div class="role-info">
                                    <span class="role-name">Admin</span>
                                    <span class="role-desc">Peut gerer les membres et parametres</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="invite-message" id="invite-message"></div>

                    <div class="workspace-modal-actions">
                        <button type="button" class="ws-btn secondary" onclick="WorkspacesModule.closeInviteModal()">Annuler</button>
                        <button type="submit" class="ws-btn primary" id="invite-submit-btn">
                            <span class="btn-text">Envoyer l'invitation</span>
                            <span class="btn-loader">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
                                </svg>
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Add role selection handler
        modal.querySelectorAll('.role-option').forEach(opt => {
            opt.addEventListener('click', () => {
                modal.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            });
        });

        // Animate in
        requestAnimationFrame(() => modal.classList.add('visible'));
    },

    /**
     * Close invite modal
     */
    closeInviteModal() {
        const modal = document.getElementById('invite-member-modal');
        if (modal) {
            modal.classList.remove('visible');
            setTimeout(() => modal.remove(), 300);
        }
    },

    /**
     * Handle invite form submission
     */
    async handleInvite(event) {
        event.preventDefault();

        const email = document.getElementById('invite-email').value.trim();
        const role = document.querySelector('input[name="invite-role"]:checked').value;
        const btn = document.getElementById('invite-submit-btn');
        const messageEl = document.getElementById('invite-message');

        if (!email) return;

        // Loading state
        btn.classList.add('loading');
        messageEl.className = 'invite-message';
        messageEl.textContent = '';

        try {
            const success = await this.inviteMember(this.currentWorkspace.id, email, role);

            btn.classList.remove('loading');

            if (success) {
                messageEl.className = 'invite-message success';
                messageEl.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <span>Invitation envoyee a ${email} !</span>
                `;

                // Close after delay
                setTimeout(() => {
                    this.closeInviteModal();
                }, 2000);
            } else {
                messageEl.className = 'invite-message error';
                messageEl.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>Erreur lors de l'envoi de l'invitation</span>
                `;
            }
        } catch (error) {
            console.error('[WorkspacesModule] Invite error:', error);
            btn.classList.remove('loading');
            messageEl.className = 'invite-message error';
            messageEl.textContent = 'Erreur de connexion au serveur';
        }
    },

    /**
     * Show workspace settings modal
     */
    showSettingsModal() {
        if (!this.currentWorkspace) return;

        const modal = document.createElement('div');
        modal.id = 'workspace-settings-modal';
        modal.className = 'workspace-modal-overlay';
        modal.innerHTML = `
            <div class="workspace-modal settings-modal">
                <div class="workspace-modal-header">
                    <h2>Parametres du workspace</h2>
                    <button class="workspace-modal-close" onclick="WorkspacesModule.closeSettingsModal()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div class="workspace-settings-tabs">
                    <button class="settings-tab active" data-tab="general" onclick="WorkspacesModule.switchSettingsTab('general')">General</button>
                    <button class="settings-tab" data-tab="members" onclick="WorkspacesModule.switchSettingsTab('members')">Membres</button>
                    <button class="settings-tab" data-tab="danger" onclick="WorkspacesModule.switchSettingsTab('danger')">Zone danger</button>
                </div>

                <div class="workspace-settings-content" id="ws-settings-content">
                    <!-- Content loaded dynamically -->
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.loadSettingsTab('general');

        requestAnimationFrame(() => modal.classList.add('visible'));
    },

    /**
     * Close settings modal
     */
    closeSettingsModal() {
        const modal = document.getElementById('workspace-settings-modal');
        if (modal) {
            modal.classList.remove('visible');
            setTimeout(() => modal.remove(), 300);
        }
    },

    /**
     * Switch settings tab
     */
    switchSettingsTab(tab) {
        document.querySelectorAll('.settings-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        this.loadSettingsTab(tab);
    },

    /**
     * Load settings tab content
     */
    async loadSettingsTab(tab) {
        const content = document.getElementById('ws-settings-content');
        if (!content) return;

        switch (tab) {
            case 'general':
                content.innerHTML = `
                    <form class="workspace-modal-form" onsubmit="WorkspacesModule.saveSettings(event)">
                        <div class="workspace-form-group">
                            <label>Nom du workspace</label>
                            <input type="text" id="ws-settings-name" value="${this.currentWorkspace.name}">
                        </div>
                        <div class="workspace-form-group">
                            <label>Description</label>
                            <textarea id="ws-settings-desc" rows="3" placeholder="Description optionnelle...">${this.currentWorkspace.description || ''}</textarea>
                        </div>
                        <div class="workspace-modal-actions">
                            <button type="submit" class="ws-btn primary">Enregistrer</button>
                        </div>
                    </form>
                `;
                break;

            case 'members':
                content.innerHTML = '<div class="loading-members">Chargement...</div>';
                const members = await this.getMembers(this.currentWorkspace.id);
                content.innerHTML = `
                    <div class="members-list">
                        ${members.map(m => `
                            <div class="member-item">
                                <div class="member-avatar">${m.name?.charAt(0) || 'U'}</div>
                                <div class="member-info">
                                    <span class="member-name">${m.name || m.email}</span>
                                    <span class="member-email">${m.email}</span>
                                </div>
                                <span class="member-role">${m.role}</span>
                            </div>
                        `).join('') || '<p class="no-members">Aucun membre pour le moment</p>'}
                    </div>
                    <button class="ws-btn primary" style="width: 100%; margin-top: 16px;" onclick="WorkspacesModule.closeSettingsModal(); WorkspacesModule.showInviteModal();">
                        Inviter un membre
                    </button>
                `;
                break;

            case 'danger':
                content.innerHTML = `
                    <div class="danger-zone">
                        <div class="danger-item">
                            <div class="danger-info">
                                <h4>Quitter le workspace</h4>
                                <p>Tu perdras l'acces a ce workspace</p>
                            </div>
                            <button class="ws-btn danger-outline" onclick="WorkspacesModule.leaveWorkspace()">Quitter</button>
                        </div>
                        <div class="danger-item">
                            <div class="danger-info">
                                <h4>Supprimer le workspace</h4>
                                <p>Cette action est irreversible</p>
                            </div>
                            <button class="ws-btn danger" onclick="WorkspacesModule.confirmDelete()">Supprimer</button>
                        </div>
                    </div>
                `;
                break;
        }
    },

    /**
     * Save workspace settings
     */
    async saveSettings(event) {
        event.preventDefault();
        const name = document.getElementById('ws-settings-name').value.trim();
        const description = document.getElementById('ws-settings-desc').value.trim();

        if (!name) return;

        const success = await this.update(this.currentWorkspace.id, { name, description });
        if (success) {
            this.updateSelectorUI();
            this.closeSettingsModal();
        }
    },

    /**
     * Leave workspace
     */
    async leaveWorkspace() {
        if (!confirm('Es-tu sur de vouloir quitter ce workspace ?')) return;

        try {
            const response = await ApiFetch.post(`/workspaces/${this.currentWorkspace.id}/leave`);
            if (response.success) {
                this.workspaces = this.workspaces.filter(w => w.id !== this.currentWorkspace.id);
                this.currentWorkspace = this.workspaces[0] || null;
                this.closeSettingsModal();
                if (typeof Sidebar !== 'undefined') Sidebar.render();
            }
        } catch (error) {
            console.error('[WorkspacesModule] Leave error:', error);
        }
    },

    /**
     * Confirm delete workspace
     */
    async confirmDelete() {
        const name = this.currentWorkspace.name;
        const input = prompt(`Pour confirmer, tape le nom du workspace : "${name}"`);

        if (input !== name) {
            alert('Le nom ne correspond pas');
            return;
        }

        const success = await this.delete(this.currentWorkspace.id);
        if (success) {
            this.closeSettingsModal();
            if (typeof Sidebar !== 'undefined') Sidebar.render();
        }
    }
};

// Auto-init
if (typeof window !== 'undefined') {
    window.WorkspacesModule = WorkspacesModule;
}
