// =============================================
// PRODUCTIVEAPP - AUTH MODULE
// Gestion de l'authentification
// =============================================

const Auth = {
    /**
     * Render la grille de sélection utilisateur
     */
    renderUserSelect() {
        const grid = Utils.$('user-select-grid');
        if (!grid) return;

        grid.innerHTML = AppConfig.USERS.map(user => `
            <button class="user-select-btn" data-userid="${user.id}">
                <div class="avatar-orbit-container">
                    <div class="fire-breath-container"></div>
                    <img src="${user.loginImg}" class="user-avatar-img-login" alt="${user.name}">
                </div>
                <span class="user-name-select">${user.name}</span>
            </button>
        `).join('');

        grid.querySelectorAll('.user-select-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectUser(btn.dataset.userid));
        });

        // Lancer le système de particules de souffle
        if (typeof Effects !== 'undefined' && Effects.initFireBreathParticles) {
            Effects.initFireBreathParticles();
        }
    },

    /**
     * Sélectionne un utilisateur pour login
     * @param {string} userId - ID de l'utilisateur
     */
    selectUser(userId) {
        const user = AppConfig.USERS.find(u => u.id === userId);
        if (!user) return;

        AppState.currentUser = user;
        Utils.$('login-username').textContent = `${user.avatar} ${user.name}`;
        Utils.$('user-select-grid').classList.add('hidden');
        Utils.$('password-form').classList.remove('hidden');
        Utils.$('login-password').focus();
    },

    /**
     * Tente de se connecter avec le mot de passe
     * @returns {boolean} - true si succès
     */
    attemptLogin() {
        const password = Utils.$('login-password').value;

        if (password === AppState.currentUser.password) {
            AppState.setUser(AppState.currentUser);
            Utils.$('login-screen').classList.add('hidden');
            Utils.$('login-error').textContent = '';
            return true;
        } else {
            Utils.$('login-error').textContent = 'Mot de passe incorrect';
            Utils.$('login-password').value = '';
            Utils.$('login-password').focus();
            return false;
        }
    },

    /**
     * Déconnexion
     */
    logout() {
        AppState.setUser(null);
        AppState.reset();
        Utils.$('login-screen').classList.remove('hidden');
        Utils.$('user-select-grid').classList.remove('hidden');
        Utils.$('password-form').classList.add('hidden');
        Utils.$('login-password').value = '';
        Utils.$('login-error').textContent = '';
    },

    /**
     * Vérifie s'il existe une session active
     * @returns {boolean} - true si une session existe
     */
    checkExistingSession() {
        if (AppState.restoreUser()) {
            Utils.$('login-screen').classList.add('hidden');
            return true;
        }
        return false;
    },

    /**
     * Met à jour le badge utilisateur courant
     */
    updateUserBadge() {
        const badge = Utils.$('current-user-badge');
        if (badge && AppState.currentUser) {
            badge.innerHTML = `
                <span class="user-avatar">${AppState.currentUser.avatar}</span>
                <span class="user-name">${AppState.currentUser.name}</span>
            `;
        }
    },

    /**
     * Initialise le carrousel de profils
     */
    initProfileCarousel() {
        let currentProfileIndex = 0;
        const profileButtons = () => document.querySelectorAll('.user-select-btn');

        const showProfile = (index, direction = 'initial') => {
            const buttons = profileButtons();
            if (buttons.length === 0) return;

            // Boucler
            if (index < 0) index = buttons.length - 1;
            if (index >= buttons.length) index = 0;
            currentProfileIndex = index;

            buttons.forEach((btn, i) => {
                if (i === index) {
                    btn.style.display = 'flex';
                    btn.style.opacity = '1';
                    btn.style.transform = 'scale(1.1)';
                    btn.style.animation = 'none';
                    btn.offsetHeight; // Force reflow

                    if (direction === 'right') {
                        btn.style.animation = 'slideInFromRight 0.4s ease-out forwards';
                    } else if (direction === 'left') {
                        btn.style.animation = 'slideInFromLeft 0.4s ease-out forwards';
                    } else {
                        btn.style.animation = 'cardReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
                    }
                } else {
                    btn.style.display = 'none';
                    btn.style.opacity = '0';
                }
            });
        };

        const prevBtn = Utils.$('carousel-prev');
        const nextBtn = Utils.$('carousel-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                showProfile(currentProfileIndex - 1, 'left');
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                showProfile(currentProfileIndex + 1, 'right');
            });
        }

        // Afficher le premier profil après délai
        setTimeout(() => showProfile(0), 3000);
    },

    /**
     * Initialise les événements d'authentification
     */
    initEvents() {
        const loginBtn = Utils.$('login-btn');
        const loginPassword = Utils.$('login-password');
        const backBtn = Utils.$('back-btn');
        const logoutBtn = Utils.$('logout-btn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                if (this.attemptLogin()) {
                    // Déclencher l'initialisation de l'app
                    if (typeof App !== 'undefined' && App.init) {
                        App.init();
                    }
                }
            });
        }

        if (loginPassword) {
            loginPassword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    if (this.attemptLogin()) {
                        if (typeof App !== 'undefined' && App.init) {
                            App.init();
                        }
                    }
                }
            });
        }

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                Utils.$('user-select-grid').classList.remove('hidden');
                Utils.$('password-form').classList.add('hidden');
                Utils.$('login-error').textContent = '';
                AppState.currentUser = null;
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Initialiser le carrousel
        this.initProfileCarousel();
    }
};

// Exposer globalement
window.Auth = Auth;
