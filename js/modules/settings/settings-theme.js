/**
 * Settings Theme Module
 * Handles theme and appearance settings
 */

const SettingsTheme = (function() {
    'use strict';

    let currentTheme = 'dark';
    let currentDensity = 'normal';

    /**
     * Load theme preferences
     */
    function load() {
        currentTheme = localStorage.getItem('theme-mode') || 'dark';
        currentDensity = localStorage.getItem('ui-density') || 'normal';
        return { theme: currentTheme, density: currentDensity };
    }

    /**
     * Render theme section
     * @param {HTMLElement} container
     */
    function render(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="settings-content-header">
                <h2 class="settings-content-title">
                    <span>🎨</span>
                    <span>Apparence</span>
                </h2>
                <p class="settings-content-desc">Personnalisez l'apparence de l'application</p>
            </div>

            <div class="settings-form">
                <!-- Theme Selection -->
                <div class="settings-form-group">
                    <label class="settings-label">Thème</label>
                    <div class="settings-theme-grid">
                        <div class="settings-theme-card ${currentTheme === 'dark' ? 'active' : ''}" data-theme="dark">
                            <div class="settings-theme-preview" style="background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #262626 100%);"></div>
                            <span class="settings-theme-name">🌙 Sombre</span>
                        </div>
                        <div class="settings-theme-card ${currentTheme === 'light' ? 'active' : ''}" data-theme="light">
                            <div class="settings-theme-preview" style="background: linear-gradient(135deg, #ffffff 0%, #fafafa 50%, #f5f5f5 100%);"></div>
                            <span class="settings-theme-name">☀️ Clair</span>
                        </div>
                        <div class="settings-theme-card ${currentTheme === 'auto' ? 'active' : ''}" data-theme="auto">
                            <div class="settings-theme-preview" style="background: linear-gradient(135deg, #1a1a1a 0%, #1a1a1a 50%, #ffffff 50%, #ffffff 100%);"></div>
                            <span class="settings-theme-name">🔄 Auto</span>
                        </div>
                    </div>
                </div>

                <!-- Color Scheme -->
                <div class="settings-form-group" style="margin-top: 32px;">
                    <label class="settings-label">Couleur d'accent</label>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 12px;">
                        ${renderColorPicker()}
                    </div>
                </div>

                <!-- UI Density -->
                <div class="settings-form-group" style="margin-top: 32px;">
                    <label class="settings-label">Densité de l'interface</label>
                    <div class="settings-radio-group" style="margin-top: 12px;">
                        <div class="settings-radio-item ${currentDensity === 'compact' ? 'active' : ''}" data-density="compact">
                            <span class="settings-radio-label">📐 Compact</span>
                        </div>
                        <div class="settings-radio-item ${currentDensity === 'normal' ? 'active' : ''}" data-density="normal">
                            <span class="settings-radio-label">📏 Normal</span>
                        </div>
                        <div class="settings-radio-item ${currentDensity === 'comfortable' ? 'active' : ''}" data-density="comfortable">
                            <span class="settings-radio-label">📑 Confortable</span>
                        </div>
                    </div>
                </div>

                <!-- Additional Options -->
                <div class="settings-form-group" style="margin-top: 32px;">
                    <label class="settings-label">Options d'affichage</label>

                    <div class="settings-toggle-row">
                        <div class="settings-toggle-info">
                            <span class="settings-toggle-label">✨ Animations</span>
                            <span class="settings-toggle-desc">Activer les animations de l'interface</span>
                        </div>
                        <div class="settings-toggle ${getOption('animations') ? 'active' : ''}" data-option="animations"></div>
                    </div>

                    <div class="settings-toggle-row">
                        <div class="settings-toggle-info">
                            <span class="settings-toggle-label">🔊 Sons</span>
                            <span class="settings-toggle-desc">Sons de notification et feedback</span>
                        </div>
                        <div class="settings-toggle ${getOption('sounds') ? 'active' : ''}" data-option="sounds"></div>
                    </div>

                    <div class="settings-toggle-row">
                        <div class="settings-toggle-info">
                            <span class="settings-toggle-label">📊 Sidebar compacte</span>
                            <span class="settings-toggle-desc">Réduire la taille de la barre latérale</span>
                        </div>
                        <div class="settings-toggle ${getOption('compactSidebar') ? 'active' : ''}" data-option="compactSidebar"></div>
                    </div>
                </div>

                <button type="button" class="settings-save-btn" id="save-theme-btn">
                    💾 Sauvegarder
                </button>
            </div>
        `;

        attachListeners();
    }

    /**
     * Render color picker
     */
    function renderColorPicker() {
        const colors = [
            { name: 'Indigo', value: '#6366f1' },
            { name: 'Purple', value: '#8b5cf6' },
            { name: 'Pink', value: '#ec4899' },
            { name: 'Blue', value: '#3b82f6' },
            { name: 'Green', value: '#22c55e' },
            { name: 'Orange', value: '#f59e0b' },
            { name: 'Red', value: '#ef4444' },
            { name: 'Teal', value: '#14b8a6' }
        ];

        const currentColor = localStorage.getItem('accent-color') || '#6366f1';

        return colors.map(c => `
            <button type="button" class="settings-color-btn ${c.value === currentColor ? 'active' : ''}"
                    data-color="${c.value}"
                    style="width: 40px; height: 40px; border-radius: 10px; background: ${c.value}; border: 3px solid ${c.value === currentColor ? 'white' : 'transparent'}; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px ${c.value}40;"
                    title="${c.name}">
            </button>
        `).join('');
    }

    /**
     * Attach event listeners
     */
    function attachListeners() {
        // Theme cards
        document.querySelectorAll('.settings-theme-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.settings-theme-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                currentTheme = card.dataset.theme;
                applyTheme(currentTheme);
            });
        });

        // Color picker
        document.querySelectorAll('.settings-color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.settings-color-btn').forEach(b => {
                    b.style.borderColor = 'transparent';
                });
                btn.style.borderColor = 'white';
                applyAccentColor(btn.dataset.color);
            });
        });

        // Density
        document.querySelectorAll('[data-density]').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('[data-density]').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                currentDensity = item.dataset.density;
                applyDensity(currentDensity);
            });
        });

        // Toggle options
        document.querySelectorAll('.settings-toggle[data-option]').forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                const option = toggle.dataset.option;
                setOption(option, toggle.classList.contains('active'));
            });
        });

        // Save button
        const saveBtn = document.getElementById('save-theme-btn');
        saveBtn?.addEventListener('click', savePreferences);
    }

    /**
     * Apply theme
     * @param {string} theme
     */
    function applyTheme(theme) {
        localStorage.setItem('theme-mode', theme);

        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.dataset.themeMode = prefersDark ? 'dark' : 'light';
        } else {
            document.body.dataset.themeMode = theme;
        }
    }

    /**
     * Apply accent color
     * @param {string} color
     */
    function applyAccentColor(color) {
        localStorage.setItem('accent-color', color);
        document.documentElement.style.setProperty('--accent', color);
    }

    /**
     * Apply density
     * @param {string} density
     */
    function applyDensity(density) {
        localStorage.setItem('ui-density', density);
        document.body.dataset.density = density;
    }

    /**
     * Get option value
     * @param {string} key
     */
    function getOption(key) {
        return localStorage.getItem(`option-${key}`) !== 'false';
    }

    /**
     * Set option value
     * @param {string} key
     * @param {boolean} value
     */
    function setOption(key, value) {
        localStorage.setItem(`option-${key}`, value);
    }

    /**
     * Save all preferences
     */
    function savePreferences() {
        console.log('✅ Theme preferences saved');
    }

    return {
        load,
        render,
        applyTheme,
        applyAccentColor,
        applyDensity
    };
})();

if (typeof window !== 'undefined') {
    window.SettingsTheme = SettingsTheme;
}
