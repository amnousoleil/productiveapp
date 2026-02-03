/**
 * Settings Notifications Module
 * Handles notification preferences
 */

const SettingsNotifications = (function() {
    'use strict';

    let preferences = null;

    /**
     * Load notification preferences
     */
    async function load() {
        try {
            const workspaceId = ApiTokens?.getWorkspaceId?.() || 'default';
            const response = await ApiFetch.fetchWithAuth(`/notifications/workspace/${workspaceId}/settings`);
            preferences = response.data || response;
        } catch (error) {
            console.warn('⚠️ Using mock notification preferences');
            preferences = getMockPreferences();
        }
        return preferences;
    }

    /**
     * Render notifications section
     * @param {HTMLElement} container
     */
    function render(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="settings-content-header">
                <h2 class="settings-content-title">
                    <span>🔔</span>
                    <span>Notifications</span>
                </h2>
                <p class="settings-content-desc">Configurez vos préférences de notification</p>
            </div>

            <div class="settings-form">
                <!-- Email Notifications -->
                <div class="settings-form-group">
                    <label class="settings-label">Notifications par email</label>
                    <div class="settings-toggle-row">
                        <div class="settings-toggle-info">
                            <span class="settings-toggle-label">📧 Emails</span>
                            <span class="settings-toggle-desc">Recevoir les notifications par email</span>
                        </div>
                        <div class="settings-toggle ${preferences?.email ? 'active' : ''}" data-key="email"></div>
                    </div>
                </div>

                <!-- Push Notifications -->
                <div class="settings-form-group">
                    <label class="settings-label">Notifications push</label>
                    <div class="settings-toggle-row">
                        <div class="settings-toggle-info">
                            <span class="settings-toggle-label">📱 Push</span>
                            <span class="settings-toggle-desc">Notifications sur votre appareil</span>
                        </div>
                        <div class="settings-toggle ${preferences?.push ? 'active' : ''}" data-key="push"></div>
                    </div>
                </div>

                <!-- Types de notifications -->
                <div class="settings-form-group" style="margin-top: 24px;">
                    <label class="settings-label">Types de notifications</label>

                    <div class="settings-toggle-row">
                        <div class="settings-toggle-info">
                            <span class="settings-toggle-label">📝 Mentions</span>
                            <span class="settings-toggle-desc">Quand quelqu'un vous mentionne</span>
                        </div>
                        <div class="settings-toggle ${preferences?.mentions ? 'active' : ''}" data-key="mentions"></div>
                    </div>

                    <div class="settings-toggle-row">
                        <div class="settings-toggle-info">
                            <span class="settings-toggle-label">✅ Assignations</span>
                            <span class="settings-toggle-desc">Quand une tâche vous est assignée</span>
                        </div>
                        <div class="settings-toggle ${preferences?.assignments ? 'active' : ''}" data-key="assignments"></div>
                    </div>

                    <div class="settings-toggle-row">
                        <div class="settings-toggle-info">
                            <span class="settings-toggle-label">🏆 Achievements</span>
                            <span class="settings-toggle-desc">Quand vous débloquez un achievement</span>
                        </div>
                        <div class="settings-toggle ${preferences?.achievements ? 'active' : ''}" data-key="achievements"></div>
                    </div>

                    <div class="settings-toggle-row">
                        <div class="settings-toggle-info">
                            <span class="settings-toggle-label">⏰ Rappels</span>
                            <span class="settings-toggle-desc">Rappels de tâches à échéance</span>
                        </div>
                        <div class="settings-toggle ${preferences?.reminders ? 'active' : ''}" data-key="reminders"></div>
                    </div>
                </div>

                <!-- Digest Frequency -->
                <div class="settings-form-group" style="margin-top: 24px;">
                    <label class="settings-label">Fréquence du digest</label>
                    <p class="settings-content-desc" style="margin-bottom: 12px;">Résumé de votre activité</p>

                    <div class="settings-radio-group">
                        <div class="settings-radio-item ${preferences?.digestFrequency === 'realtime' ? 'active' : ''}" data-value="realtime">
                            <span class="settings-radio-label">⚡ Temps réel</span>
                        </div>
                        <div class="settings-radio-item ${preferences?.digestFrequency === 'daily' ? 'active' : ''}" data-value="daily">
                            <span class="settings-radio-label">📅 Quotidien</span>
                        </div>
                        <div class="settings-radio-item ${preferences?.digestFrequency === 'weekly' ? 'active' : ''}" data-value="weekly">
                            <span class="settings-radio-label">📆 Hebdo</span>
                        </div>
                        <div class="settings-radio-item ${preferences?.digestFrequency === 'disabled' ? 'active' : ''}" data-value="disabled">
                            <span class="settings-radio-label">🔕 Désactivé</span>
                        </div>
                    </div>
                </div>

                <button type="button" class="settings-save-btn" id="save-notifications-btn">
                    💾 Sauvegarder
                </button>
            </div>
        `;

        attachListeners();
    }

    /**
     * Attach event listeners
     */
    function attachListeners() {
        // Toggle switches
        document.querySelectorAll('.settings-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                const key = toggle.dataset.key;
                if (key && preferences) {
                    preferences[key] = toggle.classList.contains('active');
                }
            });
        });

        // Radio group
        document.querySelectorAll('.settings-radio-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.settings-radio-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                if (preferences) {
                    preferences.digestFrequency = item.dataset.value;
                }
            });
        });

        // Save button
        const saveBtn = document.getElementById('save-notifications-btn');
        saveBtn?.addEventListener('click', savePreferences);
    }

    /**
     * Save notification preferences
     */
    async function savePreferences() {
        const btn = document.getElementById('save-notifications-btn');
        if (btn) btn.disabled = true;

        try {
            const workspaceId = ApiTokens?.getWorkspaceId?.() || 'default';
            await ApiFetch.fetchWithAuth(`/notifications/workspace/${workspaceId}/settings`, {
                method: 'PUT',
                body: JSON.stringify(preferences)
            });
            console.log('✅ Notification preferences saved');
        } catch (error) {
            console.error('❌ Failed to save preferences:', error);
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    function getMockPreferences() {
        return {
            email: true,
            push: true,
            mentions: true,
            assignments: true,
            achievements: true,
            reminders: true,
            digestFrequency: 'daily'
        };
    }

    return {
        load,
        render,
        savePreferences
    };
})();

if (typeof window !== 'undefined') {
    window.SettingsNotifications = SettingsNotifications;
}
