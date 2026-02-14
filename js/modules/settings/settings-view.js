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
            SettingsRender.renderConfig(icons) +
            SettingsRender.renderTeam() +
            SettingsRender.renderData(icons) +
            SettingsRender.renderHealth(icons) +
            SettingsRender.renderAbout(version, icons) +
            SettingsRender.renderLogout(icons) +
        '</div>';

        container.innerHTML = headerHtml + sectionsHtml;
        console.log('⚙️ SettingsView rendered');

        // Initialize premium notifications UI if module exists
        setTimeout(function() {
            var notifContainer = document.getElementById('settings-notifications-premium-container');
            if (notifContainer && window.SettingsNotifications) {
                SettingsNotifications.render(notifContainer).catch(function(err) {
                    console.error('Failed to render notifications UI:', err);
                    notifContainer.innerHTML = '<div class="error-state">Erreur lors du chargement des notifications</div>';
                });
            }

            // Initialize health dashboard if section exists
            if (document.getElementById('settings-health-section')) {
                SettingsHealth.init().catch(function(err) {
                    console.error('Failed to init health dashboard:', err);
                });
            }

            // Initialize Config Premium if module exists
            var configContainer = document.getElementById('settings-config-container');
            if (configContainer && window.ConfigView) {
                ConfigView.render(configContainer).catch(function(err) {
                    console.error('Failed to render config UI:', err);
                    configContainer.innerHTML = '<div class="error-state">Erreur lors du chargement de la configuration</div>';
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
     * Toggle animations ON/OFF - delegate to actions
     */
    function toggleAnimations(enabled) {
        SettingsActions.toggleAnimations(enabled);
    }

    /**
     * Preview animations - delegate to actions
     */
    function previewAnimations() {
        SettingsActions.previewAnimations();
    }

    /**
     * Reset animations - delegate to actions
     */
    function resetAnimations() {
        SettingsActions.resetAnimations();
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
        toggleAnimations: toggleAnimations,
        setAnimIntensity: setAnimIntensity,
        setAnimPreset: setAnimPreset,
        previewAnimations: previewAnimations,
        resetAnimations: resetAnimations,
        openAvatarUpload: openAvatarUpload,
        handleAvatarFile: handleAvatarFile
    };
})();

// Export globally
if (typeof window !== 'undefined') {
    window.SettingsView = SettingsView;
}

console.log('📦 settings-view.js loaded');
