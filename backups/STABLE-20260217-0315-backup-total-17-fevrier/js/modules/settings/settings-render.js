/**
 * SETTINGS RENDER - ProductiveApp v4.0
 * Renderers pour chaque section des parametres
 */
const SettingsRender = (function() {
    'use strict';

    function isImageAvatar(val) {
        return val && (val.indexOf('http') === 0 || val.indexOf('/uploads') === 0);
    }

    function getAvatarUrl(user) {
        if (user.avatar_url && isImageAvatar(user.avatar_url)) return user.avatar_url;
        if (user.avatar && isImageAvatar(user.avatar)) return user.avatar;
        if (user.loginImg && isImageAvatar(user.loginImg)) return user.loginImg;
        return null;
    }

    function renderProfile(user, icons) {
        var imgUrl = getAvatarUrl(user);
        var avatarInner = imgUrl
            ? '<img src="' + imgUrl + '" alt="Avatar">'
            : '<div class="settings-avatar-emoji-inner">' + (user.avatar || '\uD83D\uDC64') + '</div>';

        var cameraIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>' +
            '<circle cx="12" cy="13" r="4"/></svg>';

        return '<section class="settings-section">' +
            '<h2 class="settings-section-title">' + icons.user + '<span>Profil</span></h2>' +
            '<div class="settings-card">' +
                '<div class="settings-profile">' +
                    '<div class="settings-avatar-upload-area" id="profile-avatar" onclick="SettingsView.openAvatarUpload()" title="Changer la photo">' +
                        avatarInner +
                        '<div class="settings-avatar-overlay">' + cameraIcon + '<span>Modifier</span></div>' +
                    '</div>' +
                    '<input type="file" id="avatar-file-input" accept="image/*" style="display:none" onchange="SettingsView.handleAvatarFile(event)">' +
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
        // Container for premium notifications UI (rendered by SettingsNotifications module)
        return '<section class="settings-section" id="settings-notifications-premium-section">' +
            '<h2 class="settings-section-title">' + icons.bell + '<span>Notifications</span></h2>' +
            '<div id="settings-notifications-premium-container"></div>' +
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

    function renderConfig(icons) {
        return '<section class="settings-section" id="settings-config-section">' +
            '<h2 class="settings-section-title">' + icons.settings + '<span>Configuration</span></h2>' +
            '<div id="settings-config-container"></div>' +
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

    function renderHealth(icons) {
        return SettingsHealth.render(icons);
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
        var plan = 'free';
        if (typeof AppState !== 'undefined' && AppState.currentUser) {
            plan = AppState.currentUser.plan || 'free';
        }
        if (plan === 'free') {
            return renderTeamUpgradeCTA();
        }
        return typeof SettingsTeam !== 'undefined' ? SettingsTeam.render() : '';
    }

    function renderTeamUpgradeCTA() {
        var usersIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;vertical-align:middle;">' +
            '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>' +
            '<path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
        return '<section class="settings-section">' +
            '<h2 class="settings-section-title">' + usersIcon + '<span>Equipe</span></h2>' +
            '<div class="settings-card">' +
                '<div class="team-upgrade-card">' +
                    '<div class="team-upgrade-icon">\uD83D\uDC65</div>' +
                    '<h3 class="team-upgrade-title">Collaborez en equipe</h3>' +
                    '<p class="team-upgrade-desc">Passez a un plan Pro ou Enterprise pour inviter des membres et travailler ensemble.</p>' +
                    '<div class="team-plans-grid">' +
                        '<div class="team-plan-card"><div class="plan-name">Pro</div><div class="plan-limit">Jusqu\'a 5 membres</div></div>' +
                        '<div class="team-plan-card"><div class="plan-name">Enterprise</div><div class="plan-limit">Jusqu\'a 15 membres</div></div>' +
                    '</div>' +
                    '<button class="settings-btn primary" onclick="if(typeof ViewRouter!==\'undefined\') ViewRouter.navigate(\'plans\');">Voir les plans</button>' +
                '</div>' +
            '</div>' +
        '</section>';
    }

    function renderAnimations(icons) {
        var enabled = SettingsState.areAnimationsEnabled();
        var intensity = SettingsState.getAnimationIntensity();
        var preset = SettingsState.getAnimationPreset();
        var presets = [
            { key: 'zen', label: 'Zen', icon: '\u2728' },
            { key: 'elegant', label: '\u00C9l\u00E9gant', icon: '\uD83C\uDF38' },
            { key: 'dynamic', label: 'Dynamic', icon: '\u26A1' },
            { key: 'spectacular', label: 'Spectacle', icon: '\uD83C\uDF86' },
            { key: 'cinematic', label: 'Cin\u00E9ma', icon: '\uD83C\uDFAC' }
        ];

        var presetsHtml = presets.map(function(p) {
            return '<button class="settings-anim-preset" ' +
                'data-preset="' + p.key + '" onclick="SettingsView.setAnimPreset(\'' + p.key + '\')" ' +
                'style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 4px;border-radius:10px;' +
                'border:1.5px solid ' + (preset === p.key ? 'var(--accent)' : 'var(--border)') + ';' +
                'background:' + (preset === p.key ? 'var(--bg-card)' : 'transparent') + ';' +
                'color:' + (preset === p.key ? 'var(--accent)' : 'var(--text-muted)') + ';' +
                'cursor:pointer;font-size:11px;font-weight:500;font-family:inherit;' +
                (preset === p.key ? 'box-shadow:0 0 8px var(--accent-glow, rgba(99,102,241,0.2));' : '') + '">' +
                '<span style="font-size:20px;">' + p.icon + '</span>' +
                '<span>' + p.label + '</span>' +
            '</button>';
        }).join('');

        return '<section class="settings-section">' +
            '<h2 class="settings-section-title">' + icons.sparkles + '<span>Animations</span></h2>' +
            '<div class="settings-card" style="padding: 20px;">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border);">' +
                    '<div>' +
                        '<p style="font-size:14px;font-weight:600;color:var(--text);margin:0 0 4px;">Activer les animations</p>' +
                        '<p style="font-size:12px;color:var(--text-muted);margin:0;">Animations de fond interactives</p>' +
                    '</div>' +
                    '<label class="settings-toggle" style="position:relative;display:inline-block;width:50px;height:26px;">' +
                        '<input type="checkbox" ' + (enabled ? 'checked' : '') + ' ' +
                            'onchange="SettingsView.toggleAnimations(this.checked)" ' +
                            'style="opacity:0;width:0;height:0;">' +
                        '<span style="position:absolute;cursor:pointer;inset:0;background:' + (enabled ? 'var(--accent)' : 'var(--border)') + ';' +
                            'border-radius:26px;transition:0.3s;"></span>' +
                        '<span style="position:absolute;height:18px;width:18px;left:4px;bottom:4px;background:white;' +
                            'border-radius:50%;transition:0.3s;transform:translateX(' + (enabled ? '24px' : '0') + ');"></span>' +
                    '</label>' +
                '</div>' +
                '<div style="opacity:' + (enabled ? '1' : '0.4') + ';pointer-events:' + (enabled ? 'auto' : 'none') + ';">' +
                    '<p style="font-size:14px;color:var(--text);margin:0 0 14px;">Preset d\'animation</p>' +
                    '<div style="display:flex;gap:8px;margin-bottom:20px;">' + presetsHtml + '</div>' +
                '<p style="font-size:14px;color:var(--text);margin:0 0 8px;">Intensit\u00E9 : <span id="settings-anim-value" style="color:var(--accent);font-weight:600;font-variant-numeric:tabular-nums;">' + intensity + '%</span></p>' +
                '<input type="range" min="0" max="100" value="' + intensity + '" ' +
                    'id="settings-anim-slider" ' +
                    'oninput="SettingsView.setAnimIntensity(this.value)" ' +
                    'style="width:100%;accent-color:var(--accent);height:6px;border-radius:3px;">' +
                    '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-top:6px;">' +
                        '<span>Aucune</span><span>Maximale</span>' +
                    '</div>' +
                    '<div style="display:flex;gap:10px;margin-top:18px;">' +
                        '<button class="settings-btn" onclick="SettingsView.previewAnimations()" style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--text-muted);font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;">\u25B6 Aper\u00E7u</button>' +
                        '<button class="settings-btn" onclick="SettingsView.resetAnimations()" style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--text-muted);font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;">\u21BA Reset</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</section>';
    }

    return {
        renderProfile: renderProfile,
        renderTheme: renderTheme,
        renderNotifications: renderNotifications,
        renderSidebar: renderSidebar,
        renderWorkspace: renderWorkspace,
        renderConfig: renderConfig,
        renderTeam: renderTeam,
        renderAnimations: renderAnimations,
        renderData: renderData,
        renderHealth: renderHealth,
        renderAbout: renderAbout,
        renderLogout: renderLogout
    };
})();

if (typeof window !== 'undefined') { window.SettingsRender = SettingsRender; }
