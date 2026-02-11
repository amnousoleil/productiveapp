/**
 * SETTINGS VIEW - ProductiveApp v4.0
 * Orchestrateur - utilise les sous-modules settings/*
 */

const SettingsView = (function() {
    'use strict';

    /**
     * Render settings page
     */
    function render() {
        var container = document.getElementById('view-settings');
        if (!container) {
            console.error('SettingsView: #view-settings container not found');
            return;
        }

        // Inject styles
        SettingsStyles.inject();

        // Get state
        var user = SettingsState.getCurrentUser();
        var notifications = SettingsState.getNotificationSettings();
        var sidebarCompact = SettingsState.isSidebarCompact();
        var icons = SettingsState.icons;
        var version = SettingsState.CONFIG.version;

        // Render header
        var headerHtml = '<div class="view-header">' +
            '<h1 class="view-title">' +
                '<span class="view-title-icon">' + icons.user + '</span>' +
                'Parametres' +
            '</h1>' +
        '</div>';

        // Get workspace info
        var workspace = { name: localStorage.getItem('workspace_name') || 'Mon Workspace', icon: localStorage.getItem('workspace_icon') || '🚀' };

        // Render all sections
        var sectionsHtml = '<div class="settings-grid">' +
            SettingsRender.renderProfile(user, icons) +
            SettingsRender.renderNotifications(notifications, icons) +
            SettingsRender.renderSidebar(sidebarCompact, icons) +
            SettingsRender.renderAnimations(icons) +
            SettingsRender.renderWorkspace(workspace, icons) +
            SettingsRender.renderTeam() +
            SettingsRender.renderData(icons) +
            SettingsRender.renderHealth(icons) +
            SettingsRender.renderAbout(version, icons) +
            SettingsRender.renderLogout(icons) +
        '</div>';

        container.innerHTML = headerHtml + sectionsHtml;
        console.log('⚙️ SettingsView rendered');

        // Initialize health dashboard if section exists
        setTimeout(function() {
            if (document.getElementById('settings-health-section')) {
                SettingsHealth.init().catch(function(err) {
                    console.error('Failed to init health dashboard:', err);
                });
            }
        }, 100);
    }

    /**
     * Set theme - delegate to actions
     */
    function setTheme(themeId) {
        SettingsActions.setTheme(themeId);
    }

    /**
     * Toggle notification - delegate to actions
     */
    function toggleNotification(element, key) {
        SettingsActions.toggleNotification(element, key);
    }

    /**
     * Toggle sidebar - delegate to actions
     */
    function toggleSidebar(element) {
        SettingsActions.toggleSidebar(element);
    }

    /**
     * Export data - delegate to actions
     */
    function exportData() {
        SettingsActions.exportData();
    }

    /**
     * Clear cache - delegate to actions
     */
    function clearCache() {
        SettingsActions.clearCache();
    }

    /**
     * Save profile - delegate to actions
     */
    function saveProfile() {
        SettingsActions.saveProfile();
    }

    /**
     * Save workspace - delegate to actions
     */
    function saveWorkspace() {
        SettingsActions.saveWorkspace();
    }

    /**
     * Set workspace icon
     */
    function setWorkspaceIcon(icon) {
        SettingsActions.setWorkspaceIcon(icon);
    }

    /**
     * Set animation intensity - delegate to actions
     */
    function setAnimIntensity(value) {
        SettingsActions.setAnimIntensity(value);
    }

    /**
     * Set animation preset - delegate to actions
     */
    function setAnimPreset(presetKey) {
        SettingsActions.setAnimPreset(presetKey);
    }

    /**
     * Open avatar file picker
     */
    function openAvatarUpload() {
        SettingsActions.openAvatarUpload();
    }

    /**
     * Handle avatar file selection
     */
    function handleAvatarFile(event) {
        SettingsActions.handleAvatarFile(event);
    }

    /**
     * Refresh/render the view
     */
    function refresh() {
        render();
    }

    /**
     * Initialize the module
     */
    function init() {
        console.log('⚙️ SettingsView: Initialized');
    }

    // Public API
    return {
        init: init,
        render: render,
        refresh: refresh,
        setTheme: setTheme,
        toggleNotification: toggleNotification,
        toggleSidebar: toggleSidebar,
        exportData: exportData,
        clearCache: clearCache,
        saveProfile: saveProfile,
        saveWorkspace: saveWorkspace,
        setWorkspaceIcon: setWorkspaceIcon,
        setAnimIntensity: setAnimIntensity,
        setAnimPreset: setAnimPreset,
        openAvatarUpload: openAvatarUpload,
        handleAvatarFile: handleAvatarFile
    };
})();

// Export globally
if (typeof window !== 'undefined') {
    window.SettingsView = SettingsView;
}

console.log('📦 settings-view.js loaded');
