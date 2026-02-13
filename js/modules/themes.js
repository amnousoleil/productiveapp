// =============================================
// PRODUCTIVEAPP - THEMES MODULE
// Gestion des thèmes visuels
// =============================================

// Migration map for removed/renamed themes
const THEME_MIGRATIONS = {
    'minimal': 'ivory',
    'slate': 'sterling'
};

const Themes = {
    setTheme(themeId) {
        // Migrate old theme IDs
        if (THEME_MIGRATIONS[themeId]) {
            themeId = THEME_MIGRATIONS[themeId];
        }
        document.documentElement.setAttribute('data-theme', themeId);
        localStorage.setItem('theme', themeId);

        // CRITICAL FIX: Tell theme-auto.js we're in manual mode
        // This prevents theme-auto from overriding user choice on reload
        localStorage.setItem('theme_preference', 'manual');

        if (typeof resetAnimationForTheme === 'function') {
            resetAnimationForTheme();
        }

        console.log('Theme applied:', themeId);
    },

    loadTheme() {
        let saved = localStorage.getItem('theme') || 'midnight';
        // Migrate old theme IDs
        if (THEME_MIGRATIONS[saved]) {
            saved = THEME_MIGRATIONS[saved];
            localStorage.setItem('theme', saved);
        }
        this.setTheme(saved);

        const activeCard = document.querySelector(`.theme-card[data-theme="${saved}"]`);
        if (activeCard) {
            document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
            activeCard.classList.add('active');
        }
    },

    /**
     * Obtient le thème courant
     * @returns {string} - ID du thème
     */
    getCurrentTheme() {
        return localStorage.getItem('theme') || 'midnight';
    },

    /**
     * Ouvre le modal de sélection de thème
     */
    openThemeModal() {
        const modal = Utils.$('theme-modal');
        if (!modal) return;

        modal.classList.remove('hidden');

        // Marquer le thème actif
        const currentTheme = this.getCurrentTheme();
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.toggle('active', card.dataset.theme === currentTheme);
        });
    },

    /**
     * Ferme le modal de thème
     */
    closeThemeModal() {
        const modal = Utils.$('theme-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    /**
     * Obtient un thème par ID
     * @param {string} themeId - ID du thème
     * @returns {Object|null} - Données du thème
     */
    getTheme(themeId) {
        return AppConfig.ALL_THEMES.find(t => t.id === themeId);
    },

    /**
     * Initialise les événements du sélecteur de thèmes
     */
    initEvents() {
        const themeBtn = Utils.$('theme-btn');
        const closeBtn = Utils.$('close-theme-modal');
        const themeModal = Utils.$('theme-modal');

        if (themeBtn) {
            themeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openThemeModal();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeThemeModal());
        }

        if (themeModal) {
            // Click outside modal box to close
            themeModal.addEventListener('click', (e) => {
                if (e.target === themeModal) {
                    this.closeThemeModal();
                }
            });
        }

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = Utils.$('theme-modal');
                if (modal && !modal.classList.contains('hidden')) {
                    this.closeThemeModal();
                }
            }
        });

        // Theme card clicks
        document.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', () => {
                const themeId = card.dataset.theme;
                this.setTheme(themeId);

                // Marquer la carte comme active
                document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });
    }
};

// Exposer globalement
window.Themes = Themes;
