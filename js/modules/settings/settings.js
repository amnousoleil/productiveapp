/**
 * Settings Module - Main Orchestrator
 * Coordinates all settings sections
 */

const Settings = (function() {
    'use strict';

    let initialized = false;
    let container = null;
    let currentSection = 'profile';
    let sessions = [];

    const sections = [
        { id: 'profile', icon: '👤', label: 'Profil' },
        { id: 'workspace', icon: '🏢', label: 'Workspace' },
        { id: 'notifications', icon: '🔔', label: 'Notifications' },
        { id: 'appearance', icon: '🎨', label: 'Apparence' },
        { id: 'security', icon: '🔒', label: 'Sécurité' }
    ];

    /**
     * Initialize settings
     * @param {string} containerId
     */
    async function init(containerId = 'view-settings') {
        container = document.getElementById(containerId);
        if (!container) {
            console.warn('⚠️ Settings container not found');
            return;
        }

        console.log('⚙️ Initializing Settings...');
        renderLayout();

        // Load initial section
        await loadSection('profile');
        initialized = true;
        console.log('✅ Settings initialized');
    }

    /**
     * Render main layout with navigation
     */
    function renderLayout() {
        container.innerHTML = `
            <div class="settings-layout">
                <nav class="settings-nav" id="settings-nav">
                    ${sections.map(s => `
                        <button class="settings-nav-item ${s.id === currentSection ? 'active' : ''}" data-section="${s.id}">
                            <span class="settings-nav-icon">${s.icon}</span>
                            <span>${s.label}</span>
                        </button>
                    `).join('')}
                </nav>
                <div class="settings-content" id="settings-content">
                    <!-- Section content rendered here -->
                </div>
            </div>
        `;

        attachNavListeners();
    }

    /**
     * Attach navigation listeners
     */
    function attachNavListeners() {
        document.querySelectorAll('.settings-nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                loadSection(section);
            });
        });
    }

    /**
     * Load a section
     * @param {string} sectionId
     */
    async function loadSection(sectionId) {
        currentSection = sectionId;

        // Update nav active state
        document.querySelectorAll('.settings-nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === sectionId);
        });

        const content = document.getElementById('settings-content');
        if (!content) return;

        // Show loading
        content.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: var(--text-muted);">
                <div style="text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 12px;">⏳</div>
                    Chargement...
                </div>
            </div>
        `;

        // Load and render section
        switch (sectionId) {
            case 'profile':
                await SettingsProfile.load();
                SettingsProfile.render(content);
                break;
            case 'workspace':
                await SettingsWorkspace.load();
                SettingsWorkspace.render(content);
                break;
            case 'notifications':
                await SettingsNotifications.load();
                SettingsNotifications.render(content);
                break;
            case 'appearance':
                SettingsTheme.load();
                SettingsTheme.render(content);
                break;
            case 'security':
                await loadSessions();
                renderSecurity(content);
                break;
        }
    }

    /**
     * Load active sessions
     */
    async function loadSessions() {
        try {
            const response = await ApiFetch.fetchWithAuth('/auth/sessions');
            sessions = response.data || response || [];
        } catch (error) {
            sessions = getMockSessions();
        }
    }

    /**
     * Render security section
     * @param {HTMLElement} content
     */
    function renderSecurity(content) {
        content.innerHTML = `
            <div class="settings-content-header">
                <h2 class="settings-content-title">
                    <span>🔒</span>
                    <span>Sécurité</span>
                </h2>
                <p class="settings-content-desc">Gérez votre mot de passe et vos sessions</p>
            </div>

            <div class="settings-form">
                <!-- Password Change -->
                <div class="settings-form-group">
                    <label class="settings-label">Changer le mot de passe</label>
                    <div class="settings-password-form">
                        <input type="password" class="settings-input" id="current-password" placeholder="Mot de passe actuel">
                        <input type="password" class="settings-input" id="new-password" placeholder="Nouveau mot de passe">
                        <input type="password" class="settings-input" id="confirm-password" placeholder="Confirmer le mot de passe">
                        <button type="button" class="settings-save-btn" id="change-password-btn" style="margin-top: 8px;">
                            🔐 Changer le mot de passe
                        </button>
                    </div>
                </div>

                <!-- Active Sessions -->
                <div class="settings-form-group" style="margin-top: 40px;">
                    <label class="settings-label">Sessions actives</label>
                    <p class="settings-content-desc" style="margin-bottom: 16px;">
                        Appareils actuellement connectés à votre compte
                    </p>

                    <div class="settings-sessions-list">
                        ${sessions.map(s => renderSession(s)).join('')}
                    </div>
                </div>
            </div>
        `;

        // Attach security listeners
        document.getElementById('change-password-btn')?.addEventListener('click', changePassword);
        document.querySelectorAll('.settings-session-revoke').forEach(btn => {
            btn.addEventListener('click', () => revokeSession(btn.dataset.sessionId));
        });
    }

    /**
     * Render session item
     * @param {Object} session
     */
    function renderSession(session) {
        const icon = session.device?.includes('Mobile') ? '📱' : '💻';
        const isCurrent = session.current;

        return `
            <div class="settings-session-item" data-session-id="${session.id}">
                <div class="settings-session-icon">${icon}</div>
                <div class="settings-session-info">
                    <div class="settings-session-device">${escapeHtml(session.device || 'Unknown Device')}</div>
                    <div class="settings-session-details">
                        ${escapeHtml(session.location || 'Unknown')} • ${formatDate(session.lastActive)}
                    </div>
                </div>
                ${isCurrent
                    ? '<span class="settings-session-current">Session actuelle</span>'
                    : `<button class="settings-session-revoke" data-session-id="${session.id}">Révoquer</button>`
                }
            </div>
        `;
    }

    /**
     * Change password
     */
    async function changePassword() {
        const current = document.getElementById('current-password')?.value;
        const newPass = document.getElementById('new-password')?.value;
        const confirm = document.getElementById('confirm-password')?.value;

        if (!current || !newPass || !confirm) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        if (newPass !== confirm) {
            alert('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            await ApiFetch.fetchWithAuth('/auth/password', {
                method: 'PUT',
                body: JSON.stringify({ currentPassword: current, newPassword: newPass })
            });
            alert('Mot de passe modifié avec succès');
        } catch (error) {
            alert('Erreur: ' + (error.message || 'Impossible de changer le mot de passe'));
        }
    }

    /**
     * Revoke a session
     * @param {string} sessionId
     */
    async function revokeSession(sessionId) {
        if (!confirm('Révoquer cette session ?')) return;

        try {
            await ApiFetch.fetchWithAuth(`/auth/sessions/${sessionId}`, { method: 'DELETE' });
            sessions = sessions.filter(s => s.id !== sessionId);
            const content = document.getElementById('settings-content');
            if (content) renderSecurity(content);
        } catch (error) {
            alert('Erreur lors de la révocation');
        }
    }

    function getMockSessions() {
        return [
            { id: 's1', device: 'Chrome on MacOS', location: 'Paris, France', lastActive: new Date().toISOString(), current: true },
            { id: 's2', device: 'Safari on iPhone', location: 'Paris, France', lastActive: new Date(Date.now() - 86400000).toISOString(), current: false },
            { id: 's3', device: 'Firefox on Windows', location: 'Lyon, France', lastActive: new Date(Date.now() - 604800000).toISOString(), current: false }
        ];
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return "À l'instant";
        if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
        if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
        return date.toLocaleDateString('fr-FR');
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function show() {
        if (!initialized) init();
        if (typeof Router !== 'undefined') {
            Router.navigate('settings');
        }
    }

    return {
        init,
        show,
        loadSection
    };
})();

if (typeof window !== 'undefined') {
    window.Settings = Settings;
}
