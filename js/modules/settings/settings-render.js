/**
 * SETTINGS RENDER - ProductiveApp v4.0
 * Renderers pour chaque section des parametres
 */
const SettingsRender = (function() {
    'use strict';

    function renderProfile(user, icons) {
        return '<section class="settings-section">' +
            '<h2 class="settings-section-title">' + icons.user + '<span>Profil</span></h2>' +
            '<div class="settings-card">' +
                '<div class="settings-profile">' +
                    '<div class="settings-avatar" id="profile-avatar">' + (user.avatar || '👤') + '</div>' +
                    '<div class="settings-profile-info">' +
                        '<input type="text" id="profile-name" class="settings-input-inline" value="' + (user.name || '') + '" placeholder="Votre nom">' +
                        '<p>' + (user.email || 'user@example.com') + '</p>' +
                    '</div>' +
                '</div>' +
                '<div style="padding: 0 20px 16px;">' +
                    '<button class="settings-btn primary" onclick="SettingsView.saveProfile()">Sauvegarder</button>' +
                '</div>' +
            '</div>' +
        '</section>';
    }

    function renderTheme(currentTheme, themes, icons) {
        var themesHtml = themes.map(function(theme) {
            return '<div class="settings-theme-card ' + (currentTheme === theme.id ? 'active' : '') + '" ' +
                'data-theme="' + theme.id + '" onclick="SettingsView.setTheme(\'' + theme.id + '\')">' +
                '<div class="settings-theme-preview" style="background: ' + theme.gradient + '; border: 2px solid ' + theme.color + '40;"></div>' +
                '<div class="settings-theme-name">' + theme.name + '</div>' +
            '</div>';
        }).join('');

        return '<section class="settings-section">' +
            '<h2 class="settings-section-title">' + icons.palette + '<span>Apparence</span></h2>' +
            '<div class="settings-card" style="padding: 20px;">' +
                '<p style="font-size: 14px; color: var(--text); margin: 0 0 16px;">Choisissez votre theme</p>' +
                '<div class="settings-theme-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">' +
                    themesHtml +
                '</div>' +
            '</div>' +
        '</section>';
    }

    function renderNotificationRow(label, desc, key, isActive) {
        return '<div class="settings-toggle-row">' +
            '<div class="settings-toggle-info">' +
                '<span class="settings-toggle-label">' + label + '</span>' +
                '<span class="settings-toggle-desc">' + desc + '</span>' +
            '</div>' +
            '<div class="settings-toggle ' + (isActive ? 'active' : '') + '" ' +
                'data-key="' + key + '" onclick="SettingsView.toggleNotification(this, \'' + key + '\')"></div>' +
        '</div>';
    }

    function renderNotifications(notifications, icons) {
        return '<section class="settings-section">' +
            '<h2 class="settings-section-title">' + icons.bell + '<span>Notifications</span></h2>' +
            '<div class="settings-card">' +
                renderNotificationRow('Rappels de taches', 'Recevez des rappels pour vos taches', 'taskReminders', notifications.taskReminders) +
                renderNotificationRow('Resume quotidien', 'Recevez un resume de vos activites', 'dailySummary', notifications.dailySummary) +
                renderNotificationRow('Succes et badges', 'Notifications de gamification', 'achievements', notifications.achievements) +
                renderNotificationRow('Mentions', 'Quand quelqu\'un vous mentionne', 'mentions', notifications.mentions) +
                '<div class="settings-toggle-row" style="border-bottom: none;">' +
                    '<div class="settings-toggle-info">' +
                        '<span class="settings-toggle-label">Sons</span>' +
                        '<span class="settings-toggle-desc">Activer les sons de notification</span>' +
                    '</div>' +
                    '<div class="settings-toggle ' + (notifications.sounds ? 'active' : '') + '" ' +
                        'data-key="sounds" onclick="SettingsView.toggleNotification(this, \'sounds\')"></div>' +
                '</div>' +
            '</div>' +
        '</section>';
    }

    function renderSidebar(sidebarCompact, icons) {
        return '<section class="settings-section">' +
            '<h2 class="settings-section-title">' + icons.sidebar + '<span>Sidebar</span></h2>' +
            '<div class="settings-card">' +
                '<div class="settings-toggle-row" style="border-bottom: none;">' +
                    '<div class="settings-toggle-info">' +
                        '<span class="settings-toggle-label">Mode compact</span>' +
                        '<span class="settings-toggle-desc">Reduire la sidebar pour plus d\'espace</span>' +
                    '</div>' +
                    '<div class="settings-toggle ' + (sidebarCompact ? 'active' : '') + '" ' +
                        'id="sidebar-compact-toggle" onclick="SettingsView.toggleSidebar(this)"></div>' +
                '</div>' +
            '</div>' +
        '</section>';
    }

    function renderWorkspace(workspace, icons) {
        var ws = workspace || { name: 'Mon Workspace', icon: '🚀' };
        return '<section class="settings-section">' +
            '<h2 class="settings-section-title">' + icons.sidebar + '<span>Workspace</span></h2>' +
            '<div class="settings-card" style="padding: 20px;">' +
                '<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">' +
                    '<span style="font-size: 32px;" id="workspace-icon">' + ws.icon + '</span>' +
                    '<input type="text" id="workspace-name" class="settings-input-inline" value="' + (ws.name || '') + '" placeholder="Nom du workspace" style="flex: 1;">' +
                '</div>' +
                '<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">' +
                    renderIconPicker(ws.icon) +
                '</div>' +
                '<button class="settings-btn primary" onclick="SettingsView.saveWorkspace()">Sauvegarder</button>' +
            '</div>' +
        '</section>';
    }

    function renderIconPicker(currentIcon) {
        var icons = ['🚀', '💼', '🎯', '⚡', '🔥', '💎', '🌟', '🎨', '📊', '🏆'];
        return icons.map(function(icon) {
            var isActive = icon === currentIcon;
            return '<button type="button" class="settings-icon-btn' + (isActive ? ' active' : '') + '" ' +
                'data-icon="' + icon + '" onclick="SettingsView.setWorkspaceIcon(\'' + icon + '\')" ' +
                'style="width: 40px; height: 40px; border-radius: 8px; border: 2px solid ' + (isActive ? 'var(--primary)' : 'var(--border)') + '; ' +
                'background: ' + (isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent') + '; font-size: 1.2rem; cursor: pointer;">' +
                icon + '</button>';
        }).join('');
    }

    function renderData(icons) {
        return '<section class="settings-section">' +
            '<h2 class="settings-section-title">' + icons.database + '<span>Donnees</span></h2>' +
            '<div class="settings-card" style="padding: 20px;">' +
                '<div style="display: flex; flex-direction: column; gap: 12px;">' +
                    '<button class="settings-action-btn" onclick="SettingsView.exportData()">' +
                        '<span class="settings-action-icon">' + icons.download + '</span>' +
                        '<div class="settings-action-info">' +
                            '<span class="settings-action-label">Exporter mes donnees</span>' +
                            '<span class="settings-action-desc">Telecharger vos donnees au format JSON</span>' +
                        '</div>' +
                    '</button>' +
                    '<button class="settings-action-btn danger" onclick="SettingsView.clearCache()">' +
                        '<span class="settings-action-icon">' + icons.trash + '</span>' +
                        '<div class="settings-action-info">' +
                            '<span class="settings-action-label">Vider le cache local</span>' +
                            '<span class="settings-action-desc">Supprimer les donnees locales</span>' +
                        '</div>' +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</section>';
    }

    function renderAbout(version, icons) {
        return '<section class="settings-section"><h2 class="settings-section-title">' + icons.info + '<span>A propos</span></h2>' +
            '<div class="settings-card" style="padding:24px;text-align:center;">' +
                '<div style="font-size:48px;margin-bottom:16px;">🚀</div>' +
                '<h3 style="font-size:20px;font-weight:700;color:var(--text);margin:0 0 4px;">ProductiveApp</h3>' +
                '<p style="font-size:14px;color:var(--primary);margin:0 0 16px;">Version ' + version + '</p>' +
                '<p style="font-size:13px;color:var(--text-muted);margin:0 0 20px;line-height:1.6;">Application de productivite gamifiee</p>' +
                '<div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;">' +
                    '<span style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted);">' + icons.heart + 'Passion</span>' +
                    '<span style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted);">' + icons.github + 'Open Source</span>' +
                '</div></div></section>';
    }

    function renderLogout(icons) {
        return '<section class="settings-section danger">' +
            '<h2 class="settings-section-title">' + icons.trash + '<span>Session</span></h2>' +
            '<div class="settings-card">' +
                '<div class="settings-item" style="cursor: default;">' +
                    '<div class="settings-item-label">' +
                        '<span>Se deconnecter</span>' +
                        '<span class="settings-item-value">Fermer votre session</span>' +
                    '</div>' +
                    '<button class="settings-btn danger" onclick="if(typeof Auth !== \'undefined\') Auth.logout(); else location.reload();">' +
                        'Deconnexion' +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</section>';
    }

    function renderTeam() {
        return typeof SettingsTeam !== 'undefined' ? SettingsTeam.render() : '';
    }

    return {
        renderProfile: renderProfile,
        renderTheme: renderTheme,
        renderNotifications: renderNotifications,
        renderSidebar: renderSidebar,
        renderWorkspace: renderWorkspace,
        renderTeam: renderTeam,
        renderData: renderData,
        renderAbout: renderAbout,
        renderLogout: renderLogout
    };
})();

if (typeof window !== 'undefined') { window.SettingsRender = SettingsRender; }
