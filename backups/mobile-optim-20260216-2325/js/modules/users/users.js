// =============================================
// PRODUCTIVEAPP - USERS MODULE
// Gestion des utilisateurs et profils
// =============================================

const UsersModule = {
    initialized: false,
    currentUser: null,
    workspaceUsers: [],

    /**
     * Initialise le module
     */
    init() {
        if (this.initialized) return;
        console.log('[UsersModule] Initialized');
        this.initialized = true;
    },

    /**
     * Charge l'utilisateur courant
     */
    async loadCurrentUser() {
        try {
            const response = await ApiFetch.get('/auth/me');
            this.currentUser = response.data?.user || null;
            return this.currentUser;
        } catch (error) {
            console.error('[UsersModule] Load current user error:', error);
            return null;
        }
    },

    /**
     * Charge les utilisateurs d'un workspace
     */
    async loadWorkspaceUsers(workspaceId) {
        try {
            const response = await ApiFetch.get(`/workspaces/${workspaceId}/members`);
            this.workspaceUsers = response.data?.members || [];
            return this.workspaceUsers;
        } catch (error) {
            console.error('[UsersModule] Load workspace users error:', error);
            return [];
        }
    },

    /**
     * Recupere un utilisateur par ID
     */
    async getUser(userId) {
        try {
            const response = await ApiFetch.get(`/users/${userId}`);
            return response.data?.user || null;
        } catch (error) {
            console.error('[UsersModule] Get user error:', error);
            return null;
        }
    },

    /**
     * Met a jour le profil utilisateur
     */
    async updateProfile(data) {
        try {
            const response = await ApiFetch.put('/users/me', data);
            if (response.success) {
                this.currentUser = { ...this.currentUser, ...data };
            }
            return response.success;
        } catch (error) {
            console.error('[UsersModule] Update profile error:', error);
            return false;
        }
    },

    /**
     * Met a jour l'avatar
     */
    async updateAvatar(file) {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('/api/v1/users/me/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ApiTokens.getAccessToken()}`
                },
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                this.currentUser.avatar_url = result.data.avatar_url;
            }
            return result.success;
        } catch (error) {
            console.error('[UsersModule] Update avatar error:', error);
            return false;
        }
    },

    /**
     * Change le mot de passe
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await ApiFetch.post('/users/me/password', {
                current_password: currentPassword,
                new_password: newPassword
            });
            return response.success;
        } catch (error) {
            console.error('[UsersModule] Change password error:', error);
            return false;
        }
    },

    /**
     * Recherche des utilisateurs
     */
    async search(query) {
        try {
            const response = await ApiFetch.get(`/users/search?q=${encodeURIComponent(query)}`);
            return response.data?.users || [];
        } catch (error) {
            console.error('[UsersModule] Search error:', error);
            return [];
        }
    },

    /**
     * Obtient le nom affichable
     */
    getDisplayName(user) {
        if (!user) return 'Inconnu';
        return user.name || user.email?.split('@')[0] || 'Utilisateur';
    },

    /**
     * Obtient l'avatar URL ou initiales
     */
    getAvatarUrl(user) {
        if (user?.avatar_url) return user.avatar_url;
        const name = this.getDisplayName(user);
        const initials = name.charAt(0).toUpperCase();
        return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect fill="%23667eea" width="40" height="40" rx="20"/><text x="50%" y="50%" dy=".35em" fill="white" font-family="Arial" font-size="16" text-anchor="middle">${initials}</text></svg>`;
    }
};

// Auto-init
if (typeof window !== 'undefined') {
    window.UsersModule = UsersModule;
}
