// =============================================
// PRODUCTIVEAPP - THEMES MODULE
// Gestion des thèmes visuels
// =============================================

const Themes = {
    /**
     * Applique un thème
     * @param {string} themeId - ID du thème
     */
    setTheme(themeId) {
        document.documentElement.setAttribute('data-theme', themeId);
        localStorage.setItem('theme', themeId);

        // Reset animations si disponible
        if (typeof resetAnimationForTheme === 'function') {
            resetAnimationForTheme();
        }

        console.log('🎨 Thème appliqué:', themeId);
    },

    /**
     * Charge le thème sauvegardé
     */
    loadTheme() {
        const saved = localStorage.getItem('theme') || 'executive';
        this.setTheme(saved);

        // Marquer la carte active si le modal est ouvert
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
        return localStorage.getItem('theme') || 'executive';
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
            themeModal.addEventListener('click', (e) => {
                if (e.target === themeModal) {
                    this.closeThemeModal();
                }
            });
        }

        // Gérer les clics sur les cartes de thèmes
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
