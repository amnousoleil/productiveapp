/**
 * SETTINGS ACTIONS - ProductiveApp v4.0
 * Actions: notifications, theme, sidebar, profile, workspace
 */

const SettingsActions = (function() {
    'use strict';

    function showToast(msg, type) { SettingsData.showToast(msg, type); }

    /**
     * Save notification settings to localStorage
     */
    function saveNotificationSettings(settings) {
        try {
            localStorage.setItem(SettingsState.CONFIG.storageKeys.notifications, JSON.stringify(settings));
            showToast('Parametres de notifications sauvegardes');
        } catch (e) { console.error('Error saving notification settings:', e); }
    }

    /**
     * Toggle sidebar compact mode
     */
    function toggleSidebarCompact(compact) {
        localStorage.setItem(SettingsState.CONFIG.storageKeys.sidebarCompact, compact);
        document.body.classList.toggle('sidebar-collapsed', compact);
        showToast(compact ? 'Sidebar compacte activee' : 'Sidebar etendue activee');
    }

    /**
     * Set theme
     */
    function setTheme(themeId) {
        localStorage.setItem(SettingsState.CONFIG.storageKeys.theme, themeId);
        if (typeof Themes !== 'undefined' && Themes.setTheme) Themes.setTheme(themeId);
        document.querySelectorAll('.settings-theme-card').forEach(function(card) {
            card.classList.toggle('active', card.dataset.theme === themeId);
        });
        showToast('Theme "' + themeId + '" applique');
    }

    /**
     * Toggle notification setting
     */
    function toggleNotification(element, key) {
        var settings = SettingsState.getNotificationSettings();
        settings[key] = element.classList.toggle('active');
        saveNotificationSettings(settings);
    }

    /**
     * Toggle sidebar
     */
    function toggleSidebar(element) {
        toggleSidebarCompact(element.classList.toggle('active'));
    }

    /**
     * Save profile changes
     */
    async function saveProfile() {
        var nameInput = document.getElementById('profile-name');
        if (!nameInput) return;
        var name = nameInput.value.trim();
        if (!name) { showToast('Le nom ne peut pas etre vide', 'error'); return; }
        try {
            if (typeof ApiFetch !== 'undefined') {
                await ApiFetch.fetchWithAuth('/users/me', { method: 'PUT', body: JSON.stringify({ name: name }) });
            }
            if (typeof AppState !== 'undefined' && AppState.currentUser) AppState.currentUser.name = name;
            showToast('Profil sauvegarde');
        } catch (e) {
            console.error('Save profile error:', e);
            showToast('Erreur lors de la sauvegarde', 'error');
        }
    }

    /**
     * Save workspace changes
     */
    async function saveWorkspace() {
        var nameInput = document.getElementById('workspace-name');
        var icon = localStorage.getItem('workspace_icon') || '🚀';
        if (!nameInput) return;
        var name = nameInput.value.trim();
        if (!name) { showToast('Le nom ne peut pas etre vide', 'error'); return; }
        localStorage.setItem('workspace_name', name);
        try {
            if (typeof ApiFetch !== 'undefined' && typeof ApiTokens !== 'undefined') {
                var wsId = ApiTokens.getWorkspaceId();
                if (wsId) await ApiFetch.fetchWithAuth('/workspaces/' + wsId, { method: 'PUT', body: JSON.stringify({ name: name, icon: icon }) });
            }
            showToast('Workspace sauvegarde');
        } catch (e) {
            console.error('Save workspace error:', e);
            showToast('Erreur lors de la sauvegarde', 'error');
        }
    }

    /**
     * Set workspace icon
     */
    function setWorkspaceIcon(icon) {
        localStorage.setItem('workspace_icon', icon);
        var iconEl = document.getElementById('workspace-icon');
        if (iconEl) iconEl.textContent = icon;
        document.querySelectorAll('.settings-icon-btn').forEach(function(btn) {
            var isActive = btn.dataset.icon === icon;
            btn.classList.toggle('active', isActive);
            btn.style.borderColor = isActive ? 'var(--primary)' : 'var(--border)';
            btn.style.background = isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent';
        });
    }

    // Delegate to SettingsData
    function exportData() { SettingsData.exportData(); }
    function clearCache() { SettingsData.clearCache(); }

    return {
        saveNotificationSettings: saveNotificationSettings,
        toggleSidebarCompact: toggleSidebarCompact,
        setTheme: setTheme,
        exportData: exportData,
        clearCache: clearCache,
        showToast: showToast,
        toggleNotification: toggleNotification,
        toggleSidebar: toggleSidebar,
        saveProfile: saveProfile,
        saveWorkspace: saveWorkspace,
        setWorkspaceIcon: setWorkspaceIcon
    };
})();

if (typeof window !== 'undefined') {
    window.SettingsActions = SettingsActions;
}
