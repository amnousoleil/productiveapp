/**
 * Settings Profile Module
 * Handles user profile section (avatar, name, email, etc.)
 */

const SettingsProfile = (function() {
    'use strict';

    let profileData = null;

    /**
     * Load profile data
     */
    async function load() {
        try {
            const response = await ApiFetch.fetchWithAuth('/users/me');
            profileData = response.data || response;
        } catch (error) {
            console.warn('⚠️ Using mock profile data');
            profileData = getMockProfile();
        }
        return profileData;
    }

    /**
     * Render profile section
     * @param {HTMLElement} container
     */
    function render(container) {
        if (!container || !profileData) return;

        const avatar = profileData.avatar || '👤';
        const isUrl = avatar.startsWith('http');

        container.innerHTML = `
            <div class="settings-content-header">
                <h2 class="settings-content-title">
                    <span>👤</span>
                    <span>Profil</span>
                </h2>
                <p class="settings-content-desc">Gérez vos informations personnelles</p>
            </div>

            <form class="settings-form" id="profile-form">
                <!-- Avatar -->
                <div class="settings-form-group">
                    <label class="settings-label">Photo de profil</label>
                    <div class="settings-avatar-upload">
                        <div class="settings-avatar-preview" id="avatar-preview">
                            ${isUrl ? `<img src="${avatar}" alt="Avatar">` : avatar}
                        </div>
                        <div class="settings-avatar-actions">
                            <button type="button" class="settings-avatar-btn primary" id="upload-avatar-btn">
                                📷 Changer
                            </button>
                            <button type="button" class="settings-avatar-btn" id="remove-avatar-btn">
                                Supprimer
                            </button>
                            <input type="file" id="avatar-input" accept="image/*" style="display:none">
                        </div>
                    </div>
                </div>

                <!-- Name & Email -->
                <div class="settings-form-row">
                    <div class="settings-form-group">
                        <label class="settings-label">Nom complet</label>
                        <input type="text" class="settings-input" id="profile-name"
                               value="${escapeHtml(profileData.name || '')}" placeholder="Votre nom">
                    </div>
                    <div class="settings-form-group">
                        <label class="settings-label">Email</label>
                        <input type="email" class="settings-input" id="profile-email"
                               value="${escapeHtml(profileData.email || '')}" disabled>
                    </div>
                </div>

                <!-- Language & Timezone -->
                <div class="settings-form-row">
                    <div class="settings-form-group">
                        <label class="settings-label">Langue</label>
                        <select class="settings-select" id="profile-language">
                            <option value="fr" ${profileData.language === 'fr' ? 'selected' : ''}>🇫🇷 Français</option>
                            <option value="en" ${profileData.language === 'en' ? 'selected' : ''}>🇬🇧 English</option>
                            <option value="es" ${profileData.language === 'es' ? 'selected' : ''}>🇪🇸 Español</option>
                        </select>
                    </div>
                    <div class="settings-form-group">
                        <label class="settings-label">Fuseau horaire</label>
                        <select class="settings-select" id="profile-timezone">
                            <option value="Europe/Paris" ${profileData.timezone === 'Europe/Paris' ? 'selected' : ''}>Europe/Paris (UTC+1)</option>
                            <option value="America/New_York" ${profileData.timezone === 'America/New_York' ? 'selected' : ''}>America/New_York (UTC-5)</option>
                            <option value="Asia/Tokyo" ${profileData.timezone === 'Asia/Tokyo' ? 'selected' : ''}>Asia/Tokyo (UTC+9)</option>
                        </select>
                    </div>
                </div>

                <button type="submit" class="settings-save-btn" id="save-profile-btn">
                    💾 Sauvegarder
                </button>
            </form>
        `;

        attachListeners();
    }

    /**
     * Attach event listeners
     */
    function attachListeners() {
        // Avatar upload
        const uploadBtn = document.getElementById('upload-avatar-btn');
        const avatarInput = document.getElementById('avatar-input');
        const removeBtn = document.getElementById('remove-avatar-btn');

        uploadBtn?.addEventListener('click', () => avatarInput?.click());

        avatarInput?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await handleAvatarUpload(file);
            }
        });

        removeBtn?.addEventListener('click', () => {
            const preview = document.getElementById('avatar-preview');
            if (preview) preview.innerHTML = '👤';
            profileData.avatar = null;
        });

        // Form submit
        const form = document.getElementById('profile-form');
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveProfile();
        });
    }

    /**
     * Handle avatar upload
     * @param {File} file
     */
    async function handleAvatarUpload(file) {
        const preview = document.getElementById('avatar-preview');
        if (!preview) return;

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
        };
        reader.readAsDataURL(file);

        // Upload to server (mock for now)
        console.log('📷 Uploading avatar...', file.name);
    }

    /**
     * Save profile changes
     */
    async function saveProfile() {
        const btn = document.getElementById('save-profile-btn');
        if (btn) btn.disabled = true;

        const data = {
            name: document.getElementById('profile-name')?.value,
            language: document.getElementById('profile-language')?.value,
            timezone: document.getElementById('profile-timezone')?.value
        };

        try {
            await ApiFetch.fetchWithAuth('/users/me', {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            showToast('Profil mis à jour ✓');
        } catch (error) {
            console.error('❌ Failed to save profile:', error);
            showToast('Erreur lors de la sauvegarde', 'error');
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    function getMockProfile() {
        return {
            id: 'user-1',
            name: 'Maha',
            email: 'maha@productive.app',
            avatar: '👑',
            language: 'fr',
            timezone: 'Europe/Paris'
        };
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showToast(message, type = 'success') {
        console.log(`${type === 'success' ? '✅' : '❌'} ${message}`);
    }

    return {
        load,
        render,
        saveProfile
    };
})();

if (typeof window !== 'undefined') {
    window.SettingsProfile = SettingsProfile;
}
