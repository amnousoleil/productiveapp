/**
 * SETTINGS VIEW - ProductiveApp v4.0
 * Page de paramètres utilisateur
 */

const SettingsView = (function() {
    'use strict';

    const icons = {
        user: '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        palette: '<svg viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>',
        bell: '<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
        shield: '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        trash: '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        chevron: '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>'
    };

    /**
     * Render settings page
     */
    function render() {
        const container = document.getElementById('view-settings');
        if (!container) return;

        const user = typeof AppState !== 'undefined' ? AppState.currentUser : {};
        const currentTheme = localStorage.getItem('theme') || 'executive';

        container.innerHTML = `
            <div class="view-header">
                <h1 class="view-title">
                    <span class="view-title-icon">${icons.user}</span>
                    Paramètres
                </h1>
            </div>

            <div class="settings-grid">
                <!-- Profile Section -->
                <section class="settings-section">
                    <h2 class="settings-section-title">
                        ${icons.user}
                        <span>Profil</span>
                    </h2>
                    <div class="settings-card">
                        <div class="settings-profile">
                            <div class="settings-avatar">
                                ${user.avatar || '👤'}
                            </div>
                            <div class="settings-profile-info">
                                <h3>${user.name || 'Utilisateur'}</h3>
                                <p>${user.email || 'user@example.com'}</p>
                            </div>
                        </div>
                        <button class="settings-btn" disabled>Modifier le profil</button>
                    </div>
                </section>

                <!-- Theme Section -->
                <section class="settings-section">
                    <h2 class="settings-section-title">
                        ${icons.palette}
                        <span>Apparence</span>
                    </h2>
                    <div class="settings-card">
                        <div class="settings-item" onclick="Themes.openThemeModal()">
                            <div class="settings-item-label">
                                <span>Thème actuel</span>
                                <span class="settings-item-value">${currentTheme}</span>
                            </div>
                            ${icons.chevron}
                        </div>
                    </div>
                </section>

                <!-- Notifications Section -->
                <section class="settings-section">
                    <h2 class="settings-section-title">
                        ${icons.bell}
                        <span>Notifications</span>
                    </h2>
                    <div class="settings-card">
                        <div class="settings-item coming-soon">
                            <div class="settings-item-label">
                                <span>Push notifications</span>
                                <span class="badge-soon">Bientôt</span>
                            </div>
                        </div>
                        <div class="settings-item coming-soon">
                            <div class="settings-item-label">
                                <span>Email notifications</span>
                                <span class="badge-soon">Bientôt</span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Security Section -->
                <section class="settings-section">
                    <h2 class="settings-section-title">
                        ${icons.shield}
                        <span>Sécurité</span>
                    </h2>
                    <div class="settings-card">
                        <div class="settings-item coming-soon">
                            <div class="settings-item-label">
                                <span>Changer le mot de passe</span>
                                <span class="badge-soon">Bientôt</span>
                            </div>
                        </div>
                        <div class="settings-item coming-soon">
                            <div class="settings-item-label">
                                <span>Sessions actives</span>
                                <span class="badge-soon">Bientôt</span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Danger Zone -->
                <section class="settings-section danger">
                    <h2 class="settings-section-title">
                        ${icons.trash}
                        <span>Zone dangereuse</span>
                    </h2>
                    <div class="settings-card">
                        <div class="settings-item">
                            <div class="settings-item-label">
                                <span>Se déconnecter</span>
                            </div>
                            <button class="settings-btn danger" onclick="Auth.logout()">Déconnexion</button>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    function refresh() {
        render();
    }

    function init() {
        console.log('⚙️ SettingsView: Ready');
    }

    return { init, render, refresh };
})();

if (typeof window !== 'undefined') {
    window.SettingsView = SettingsView;
}
