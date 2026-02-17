// =============================================
// PRODUCTIVEAPP - AUTH LOGIN MODULE v1.0
// Système de login isolé et robuste
// =============================================

const AuthLogin = {
    // État
    authenticated: false,
    apiUser: null,
    currentPhase: null, // 'login' | 'member' | 'app'

    // Constantes
    ALLOWED_DOMAIN: '@mahagiri.fr',
    CONTAINER_ID: 'auth-login-container',

    // =========================================
    // PHASE 0 : INITIALISATION / AUTO-LOGIN
    // =========================================
    async init() {
        console.log('🔐 AuthLogin: Initializing...');

        // CRITICAL: Si déjà authentifié, ne rien faire
        if (this.authenticated) {
            console.log('✅ AuthLogin: Already authenticated, skipping');
            return;
        }

        // Créer le conteneur si nécessaire
        this.createContainer();

        // Vérifier si un token existe
        const accessToken = ApiTokens.getAccessToken();

        if (accessToken) {
            console.log('🔐 AuthLogin: Token found, validating...');
            try {
                // Refresh proactif si le token expire bientôt (avant getMe)
                if (typeof ApiFetch !== 'undefined' && ApiFetch.ensureValidToken) {
                    await ApiFetch.ensureValidToken();
                }

                const response = await ApiAuth.getMe();

                if (response && response.user) {
                    console.log('✅ AuthLogin: Session valid');
                    this.apiUser = response.user;

                    // Démarrer le refresh automatique en arrière-plan
                    if (typeof ApiFetch !== 'undefined' && ApiFetch.startAutoRefresh) {
                        ApiFetch.startAutoRefresh();
                    }

                    // Vérifier si un membre était déjà sélectionné
                    const savedMemberId = localStorage.getItem('selectedMemberId');
                    if (savedMemberId) {
                        const member = AppConfig.USERS.find(u => u.id === savedMemberId);
                        if (member) {
                            console.log('✅ AuthLogin: Auto-login');
                            await this.enterApp(member);
                            return;
                        }
                    }

                    // Token valide : auto-sélection du membre
                    await this.autoSelectMember();
                    return;
                }
            } catch (e) {
                console.warn('⚠️ AuthLogin: Token invalid:', e.message);
                // Ne pas effacer si le refresh token existe encore (tenter la reconnexion)
                const refreshToken = ApiTokens.getRefreshToken();
                if (!refreshToken || e.message === 'Session expired') {
                    ApiTokens.clearTokens();
                }
            }
        }

        // Pas de session valide : afficher le formulaire de login
        this.showLoginForm();
    },

    // =========================================
    // CRÉER LE CONTENEUR
    // =========================================
    createContainer() {
        // Supprimer l'ancien si existe
        const existing = document.getElementById(this.CONTAINER_ID);
        if (existing) existing.remove();

        // Créer le nouveau conteneur
        const container = document.createElement('div');
        container.id = this.CONTAINER_ID;
        container.className = 'auth-login-overlay';
        container.innerHTML = `
            <div class="auth-particles">
                <span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span>
            </div>

            <div class="auth-login-layout">
                <div class="auth-login-left">
                    <div class="auth-login-box">
                        <div class="auth-login-logo">
                            <img src="assets/images/logos/logo.svg" alt="Logo" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'font-size:48px\\'>👑</span>';">
                        </div>
                        <h1 class="auth-login-title">ProductiveApp</h1>
                        <p class="auth-login-tagline">By Maha Giri</p>

                        <!-- PHASE 1: Login Form -->
                        <div id="auth-login-form" class="auth-phase">
                            <p class="auth-subtitle">Connexion</p>
                            <div class="auth-inputs">
                                <div class="auth-input-wrapper">
                                    <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                    <input type="email" id="auth-email" placeholder="Email" autocomplete="email">
                                </div>
                                <div class="auth-input-wrapper">
                                    <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    <input type="password" id="auth-password" placeholder="Mot de passe" autocomplete="current-password">
                                </div>
                            </div>
                            <div id="auth-error" class="auth-error"></div>
                            <button id="auth-submit-btn" class="auth-btn">
                                <span class="auth-btn-text">Se connecter</span>
                                <svg class="auth-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                            </button>
                        </div>

                        <!-- PHASE 2: Member Picker -->
                        <div id="auth-member-picker" class="auth-phase hidden">
                            <p class="auth-subtitle">Qui es-tu ?</p>
                            <div id="auth-member-grid" class="auth-member-grid"></div>
                        </div>
                    </div>
                </div>

                <div class="auth-login-right">
                    <div class="auth-master-image">
                        <img src="https://d1yei2z3i6k35z.cloudfront.net/15127401/697fae4f07fb8_ChatGPTImage1f%C3%A9vr.202609_58_10.png" alt="Maha Giri">
                    </div>
                    <div class="auth-master-overlay"></div>
                </div>
            </div>
        `;

        document.body.appendChild(container);
    },

    // =========================================
    // PHASE 1 : FORMULAIRE DE LOGIN
    // =========================================
    showLoginForm() {
        this.currentPhase = 'login';

        const formEl = document.getElementById('auth-login-form');
        const pickerEl = document.getElementById('auth-member-picker');

        if (formEl) formEl.classList.remove('hidden');
        if (pickerEl) pickerEl.classList.add('hidden');

        // Pré-remplir avec les credentials de l'équipe
        const emailInput = document.getElementById('auth-email');
        const passwordInput = document.getElementById('auth-password');

        if (emailInput && AppConfig.TEAM_AUTH) {
            emailInput.value = AppConfig.TEAM_AUTH.email || '';
        }
        if (passwordInput && AppConfig.TEAM_AUTH) {
            passwordInput.value = AppConfig.TEAM_AUTH.password || '';
        }

        // Event listeners
        this.bindLoginEvents();
    },

    bindLoginEvents() {
        const submitBtn = document.getElementById('auth-submit-btn');
        const emailInput = document.getElementById('auth-email');
        const passwordInput = document.getElementById('auth-password');

        if (submitBtn) {
            submitBtn.onclick = () => this.attemptLogin();
        }

        // Enter key
        [emailInput, passwordInput].forEach(input => {
            if (input) {
                input.onkeydown = (e) => {
                    if (e.key === 'Enter') this.attemptLogin();
                };
            }
        });
    },

    async attemptLogin() {

        const emailInput = document.getElementById('auth-email');
        const passwordInput = document.getElementById('auth-password');
        const submitBtn = document.getElementById('auth-submit-btn');

        const email = emailInput?.value?.trim()?.toLowerCase();
        const password = passwordInput?.value;

        // Validation
        if (!email || !password) {
            this.showError('Email et mot de passe requis');
            return;
        }

        // Vérification email équipe (domaine @mahagiri.fr)
        if (!email.endsWith(this.ALLOWED_DOMAIN)) {
            this.showError('Accès réservé à l\'équipe');
            return;
        }

        // Loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="auth-btn-text">Connexion...</span>';
        }

        try {
            const result = await ApiAuth.login(email, password);

            if (result && result.user) {
                this.apiUser = result.user;
                this.clearError();
                await this.autoSelectMember();
            }
        } catch (e) {
            console.error('❌ AuthLogin: Login failed:', e);
            this.showError(e.message || 'Identifiants incorrects');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span class="auth-btn-text">Se connecter</span><svg class="auth-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
            }
        }
    },

    showError(message) {
        const errorEl = document.getElementById('auth-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('visible', 'shake');
            setTimeout(() => errorEl.classList.remove('shake'), 500);
        }
    },

    clearError() {
        const errorEl = document.getElementById('auth-error');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('visible');
        }
    },

    // =========================================
    // AUTO-SÉLECTION DU MEMBRE
    // =========================================
    async autoSelectMember() {
        // 1. Matcher l'ID backend avec AppConfig.USERS
        if (this.apiUser && this.apiUser.id) {
            const matched = AppConfig.USERS.find(u => u.id === this.apiUser.id);
            if (matched) {
                localStorage.setItem('selectedMemberId', matched.id);
                await this.enterApp(matched);
                return;
            }
        }

        // 2. Fallback: membre précédemment sélectionné
        const savedMemberId = localStorage.getItem('selectedMemberId');
        if (savedMemberId) {
            const saved = AppConfig.USERS.find(u => u.id === savedMemberId);
            if (saved) {
                await this.enterApp(saved);
                return;
            }
        }

        // 3. Défaut: premier utilisateur (boss / propriétaire du compte)
        const defaultMember = AppConfig.USERS[0];
        if (defaultMember) {
            localStorage.setItem('selectedMemberId', defaultMember.id);
            await this.enterApp(defaultMember);
            return;
        }

        // 4. Dernier recours (ne devrait jamais arriver)
        this.showMemberPicker();
    },

    // =========================================
    // PHASE 2 : SÉLECTION DU MEMBRE (fallback)
    // =========================================
    showMemberPicker() {
        this.currentPhase = 'member';

        const formEl = document.getElementById('auth-login-form');
        const pickerEl = document.getElementById('auth-member-picker');

        if (formEl) formEl.classList.add('hidden');
        if (pickerEl) pickerEl.classList.remove('hidden');

        this.renderMemberGrid();
    },

    renderMemberGrid() {
        const grid = document.getElementById('auth-member-grid');
        if (!grid) return;

        const getRoleLabel = (role, id) => {
            if (id === 'all') return 'Tous';
            switch(role) {
                case 'boss': return 'Boss';
                case 'team': return 'Équipe';
                case 'shared': return 'Partagé';
                default: return '';
            }
        };

        const getRoleIcon = (role, id) => {
            if (id === 'all') return '👥';
            switch(role) {
                case 'boss': return '👑';
                case 'team': return '🚀';
                case 'shared': return '👥';
                default: return '';
            }
        };

        grid.innerHTML = AppConfig.USERS.map((member, i) => `
            <button class="auth-member-btn" data-member-id="${member.id}" style="animation-delay: ${i * 0.08}s">
                <img src="${member.loginImg}" alt="${member.name}" class="auth-member-avatar">
                <span class="auth-member-name">${member.name}</span>
                <span class="auth-member-role">${getRoleIcon(member.role, member.id)} ${getRoleLabel(member.role, member.id)}</span>
            </button>
        `).join('');

        // Bind click events
        grid.querySelectorAll('.auth-member-btn').forEach(btn => {
            btn.onclick = () => {
                const memberId = btn.dataset.memberId;
                this.selectMember(memberId);
            };
        });

    },

    async selectMember(memberId) {
        const member = AppConfig.USERS.find(u => u.id === memberId);
        if (!member) {
            console.error('AuthLogin: Member not found:', memberId);
            this.showError('Membre introuvable. Veuillez réessayer.');
            return;
        }


        // Sauvegarder le membre
        localStorage.setItem('selectedMemberId', memberId);

        // Entrer dans l'app
        await this.enterApp(member);
    },

    // =========================================
    // PHASE 3 : ENTRÉE DANS L'APP
    // =========================================
    async enterApp(member) {

        // 1. Mettre le flag AVANT tout
        this.authenticated = true;
        this.currentPhase = 'app';

        // 2. S'assurer que le workspace est défini
        const DEFAULT_WORKSPACE_ID = 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f';
        if (!ApiTokens.getWorkspaceId()) {
            console.log('⚠️ AuthLogin: No workspace ID, fetching...');
            try {
                const workspaces = await ApiAuth.getWorkspaces();
                if (workspaces && workspaces.length > 0) {
                    ApiTokens.setWorkspaceId(workspaces[0].id);
                    console.log('✅ Workspace set:', workspaces[0].id);
                } else {
                    ApiTokens.setWorkspaceId(DEFAULT_WORKSPACE_ID);
                    console.log('⚠️ Using default workspace');
                }
            } catch (e) {
                console.warn('Failed to fetch workspaces, using default:', e);
                ApiTokens.setWorkspaceId(DEFAULT_WORKSPACE_ID);
            }
        } else {
            console.log('✅ Workspace already set:', ApiTokens.getWorkspaceId());
        }

        // 3. Définir l'utilisateur courant
        if (typeof AppState !== 'undefined') {
            AppState.currentUser = {
                ...(this.apiUser || {}),
                ...member,
                id: member.id,
                name: member.name
            };
        }

        // 4. SUPPRIMER le conteneur de login du DOM
        const container = document.getElementById(this.CONTAINER_ID);
        if (container) {
            container.remove();
        }

        // Supprimer aussi l'ancien login-screen s'il existe
        const oldLoginScreen = document.getElementById('login-screen');
        if (oldLoginScreen) {
            oldLoginScreen.remove();
        }

        // 5. Ajouter la classe logged-in
        document.body.classList.add('logged-in');

        // 5.5. Émettre l'event userLoggedIn pour animations upgrade
        console.log('🎨 Emitting userLoggedIn event');
        window.dispatchEvent(new CustomEvent('userLoggedIn', {
            detail: { member, timestamp: Date.now() }
        }));

        // 6. Afficher la vue tasks
        document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
        const tasksView = document.getElementById('view-tasks');
        if (tasksView) {
            tasksView.classList.add('active');
        }

        // 7. Initialiser l'app (une seule fois, le flag empêche la boucle)
        if (typeof App !== 'undefined' && App.init) {
            await App.init();
        }

    },

    // =========================================
    // UTILITAIRES
    // =========================================

    /**
     * Changer de membre sans logout complet
     */
    switchMember() {

        this.authenticated = false;
        localStorage.removeItem('selectedMemberId');

        if (typeof AppState !== 'undefined') {
            AppState.currentUser = null;
        }

        document.body.classList.remove('logged-in');

        this.createContainer();
        this.showMemberPicker();
    },

    /**
     * Déconnexion complète
     */
    async logout() {
        console.log('🔐 AuthLogin: Logging out...');

        try {
            await ApiAuth.logout();
        } catch (e) {
            console.warn('Logout API error:', e);
        }

        // Reset complet
        this.authenticated = false;
        this.apiUser = null;
        ApiTokens.clearTokens();
        localStorage.removeItem('selectedMemberId');

        if (typeof AppState !== 'undefined' && AppState.reset) {
            AppState.reset();
        }

        // Recharger la page pour repartir de zéro
        window.location.reload();
    },

    /**
     * Vérifier si l'utilisateur est authentifié
     */
    isAuthenticated() {
        return this.authenticated;
    },

    /**
     * Obtenir l'utilisateur courant
     */
    getCurrentUser() {
        return typeof AppState !== 'undefined' ? AppState.currentUser : null;
    }
};

// Exposer globalement
if (typeof window !== 'undefined') {
    window.AuthLogin = AuthLogin;
}
