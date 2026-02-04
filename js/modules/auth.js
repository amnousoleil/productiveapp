// =============================================
// PRODUCTIVEAPP - AUTH MODULE v2.0
// Authentification équipe + sélection membre
// =============================================

const Auth = {
    apiUser: null, // Utilisateur API après authentification

    /**
     * Initialize authentication
     * Checks for existing JWT token and validates session via API
     */
    async init() {
        console.log('🔐 Auth: Initializing...');

        // Check for existing JWT session
        const accessToken = ApiTokens.getAccessToken();
        if (accessToken) {
            try {
                console.log('🔐 Auth: Found access token, validating...');
                const response = await ApiAuth.getMe();

                if (response && response.user) {
                    console.log('✅ Auth: Session valid for', response.user.email);
                    this.apiUser = response.user;

                    // Ensure workspace is set
                    if (!ApiTokens.getWorkspaceId()) {
                        await this.ensureWorkspace();
                    }

                    // Check if member was already selected
                    const savedMemberId = localStorage.getItem('selectedMemberId');
                    if (savedMemberId) {
                        const member = AppConfig.USERS.find(u => u.id === savedMemberId);
                        if (member) {
                            AppState.currentUser = {
                                ...this.apiUser,
                                ...member
                            };
                            this.onLoginSuccess();
                            return;
                        }
                    }

                    // Show member picker
                    this.showMemberPicker();
                    return;
                }
            } catch (e) {
                console.warn('⚠️ Auth: Token validation failed, trying refresh...', e.message);

                // Try to refresh the token
                try {
                    const refreshToken = ApiTokens.getRefreshToken();
                    if (refreshToken) {
                        const refreshResponse = await fetch(`${ApiConfig.BASE_URL}/auth/refresh`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ refreshToken })
                        });

                        if (refreshResponse.ok) {
                            const data = await refreshResponse.json();
                            if (data.success && data.data?.tokens) {
                                ApiTokens.setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
                                console.log('✅ Auth: Token refreshed, retrying...');
                                return this.init();
                            }
                        }
                    }
                } catch (refreshError) {
                    console.warn('⚠️ Auth: Refresh failed', refreshError.message);
                }

                // Clear invalid tokens
                ApiTokens.clearTokens();
            }
        }

        // No valid session - show login
        console.log('🔐 Auth: No valid session, showing login');
        this.showLoginScreen();
    },

    /**
     * Ensure workspace is set
     */
    async ensureWorkspace() {
        const DEFAULT_WORKSPACE_ID = 'fd92221a-aaa2-42c9-9d06-f158b5adccc3';
        try {
            const workspaces = await ApiAuth.getWorkspaces();
            if (workspaces && workspaces.length > 0) {
                ApiTokens.setWorkspaceId(workspaces[0].id);
                console.log('✅ Workspace set:', workspaces[0].id);
            } else {
                ApiTokens.setWorkspaceId(DEFAULT_WORKSPACE_ID);
                console.log('⚠️ Using default workspace');
            }
        } catch (wsErr) {
            console.warn('Failed to fetch workspaces:', wsErr);
            ApiTokens.setWorkspaceId(DEFAULT_WORKSPACE_ID);
        }
    },

    /**
     * Show the login screen with email/password form
     */
    showLoginScreen() {
        const loginScreen = document.getElementById('login-screen');
        if (!loginScreen) return;

        loginScreen.classList.remove('hidden');

        // Pre-fill with team credentials
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');

        if (emailInput && AppConfig.TEAM_AUTH) {
            emailInput.value = AppConfig.TEAM_AUTH.email;
        }
        if (passwordInput && AppConfig.TEAM_AUTH) {
            passwordInput.value = AppConfig.TEAM_AUTH.password;
        }

        // Hide member picker, show login form
        document.getElementById('login-form')?.classList.remove('hidden');
        document.getElementById('member-picker')?.classList.add('hidden');

        this.initLoginEvents();

        // Start fire bubbles animation
        setTimeout(() => {
            if (typeof Effects !== 'undefined' && Effects.createFireBubbles) {
                Effects.createFireBubbles();
            }
        }, 500);
    },

    /**
     * Show member picker after successful API auth
     */
    showMemberPicker() {
        const loginScreen = document.getElementById('login-screen');
        if (!loginScreen) return;

        loginScreen.classList.remove('hidden');

        // Hide login form, show member picker
        document.getElementById('login-form')?.classList.add('hidden');
        document.getElementById('member-picker')?.classList.remove('hidden');

        this.renderMemberGrid();

        // Fire particles around avatars
        setTimeout(() => {
            if (typeof Effects !== 'undefined' && Effects.initFireBreathParticles) {
                Effects.initFireBreathParticles();
            }
        }, 300);
    },

    /**
     * Render member selection grid
     */
    renderMemberGrid() {
        const grid = document.getElementById('member-grid');
        if (!grid) return;

        const getRoleLabel = (role, id) => {
            if (id === 'all') return '👥 Tous';
            switch(role) {
                case 'boss': return '👑 Boss';
                case 'team': return '🚀 Équipe';
                case 'shared': return '👥 Partagé';
                default: return '';
            }
        };

        grid.innerHTML = AppConfig.USERS.map(member => `
            <button class="member-select-btn ${member.id === 'all' ? 'member-all' : ''}" data-memberid="${member.id}">
                <img src="${member.loginImg}" class="user-avatar-img-login" alt="${member.name}">
                <span class="member-name">${member.name}</span>
                <span class="member-role">${getRoleLabel(member.role, member.id)}</span>
            </button>
        `).join('');

        // Event listeners
        grid.querySelectorAll('.member-select-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectMember(btn.dataset.memberid));
        });
    },

    /**
     * Select a team member
     */
    selectMember(memberId) {
        const member = AppConfig.USERS.find(u => u.id === memberId);
        if (!member) {
            console.error('❌ Auth: Member not found:', memberId);
            return;
        }

        console.log('✅ Auth: Member selected:', member.name);

        // Save selected member
        localStorage.setItem('selectedMemberId', memberId);

        // Merge API user with selected member (fallback if apiUser is null)
        AppState.currentUser = {
            ...(this.apiUser || {}),
            ...member,
            id: member.id,
            name: member.name
        };

        console.log('✅ Auth: AppState.currentUser set:', AppState.currentUser);
        this.onLoginSuccess();
    },

    /**
     * Attempt login with email/password via API
     */
    async attemptLogin() {
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        const errorEl = document.getElementById('login-error');
        const loginBtn = document.getElementById('login-btn');

        const email = emailInput?.value?.trim();
        const password = passwordInput?.value;

        if (!email || !password) {
            if (errorEl) errorEl.textContent = '❌ Email et mot de passe requis';
            return;
        }

        // Show loading state
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span class="spinner"></span> Connexion...';
        }

        try {
            console.log('🔐 Auth: Attempting login for', email);
            const result = await ApiAuth.login(email, password);

            if (result && result.user) {
                if (errorEl) errorEl.textContent = '';
                this.apiUser = result.user;
                console.log('✅ Auth: API login successful');

                // Show member picker
                this.showMemberPicker();
                return;
            }
        } catch (e) {
            console.warn('⚠️ Auth: API login failed:', e.message);

            if (errorEl) {
                errorEl.textContent = e.message || '❌ Identifiants incorrects';
                errorEl.style.animation = 'shake 0.5s ease';
                setTimeout(() => errorEl.style.animation = '', 500);
            }
        }

        // Reset button state
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '🔓 Connexion';
        }
    },

    /**
     * On successful login
     */
    async onLoginSuccess() {
        console.log('✅ Auth: Login successful for', AppState.currentUser?.name);

        // Hide login screen
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            loginScreen.classList.add('hidden');
        }

        // Add logged-in class
        document.body.classList.add('logged-in');

        // Initialize app
        try {
            if (typeof App !== 'undefined' && App.init) {
                await App.init();
            }
        } catch (error) {
            console.error('❌ App.init() error:', error);
        }

        // Navigate to tasks view
        try {
            if (typeof ViewRouter !== 'undefined') {
                ViewRouter.navigate('tasks');
            }
        } catch (error) {
            console.error('❌ Router error:', error);
        }
    },

    /**
     * Logout - calls API then clears session
     */
    async logout() {
        console.log('🔐 Auth: Logging out...');

        try {
            const result = await ApiAuth.logout();
            if (result?.tasks_reset) {
                console.log(`✅ Auth: ${result.tasks_reset} tasks reset to todo`);
            }
        } catch (e) {
            console.warn('⚠️ Auth: API logout failed:', e.message);
        }

        // Clear all tokens and storage
        ApiTokens.clearTokens();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('selectedMemberId');
        AppState.currentUser = null;
        this.apiUser = null;

        if (typeof AppState !== 'undefined' && AppState.reset) {
            AppState.reset();
        }

        // Show login screen
        document.body.classList.remove('logged-in', 'sidebar-open', 'sidebar-collapsed');

        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            loginScreen.classList.remove('hidden');
            this.showLoginScreen();
        }
    },

    /**
     * Switch member (without full logout)
     */
    switchMember() {
        localStorage.removeItem('selectedMemberId');
        AppState.currentUser = null;

        document.body.classList.remove('logged-in');
        this.showMemberPicker();
    },

    /**
     * Initialize login events
     */
    initLoginEvents() {
        const loginBtn = document.getElementById('login-btn');
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');

        if (loginBtn) {
            loginBtn.onclick = () => this.attemptLogin();
        }

        // Enter key to submit
        [emailInput, passwordInput].forEach(input => {
            if (input) {
                input.onkeypress = (e) => {
                    if (e.key === 'Enter') {
                        this.attemptLogin();
                    }
                };
            }
        });
    },

    /**
     * Update user badge in header
     */
    updateUserBadge() {
        const badge = document.getElementById('current-user-badge');
        if (badge && AppState.currentUser) {
            const user = AppState.currentUser;
            const avatarHtml = user.loginImg
                ? `<img src="${user.loginImg}" class="user-avatar-img" alt="${user.name}">`
                : `<span class="user-avatar">${user.avatar || '👤'}</span>`;

            badge.innerHTML = `
                ${avatarHtml}
                <span class="user-name">${user.name || 'User'}</span>
            `;
        }
    },

    /**
     * Initialize events (logout button, etc.)
     */
    initEvents() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        const switchMemberBtn = document.getElementById('switch-member-btn');
        if (switchMemberBtn) {
            switchMemberBtn.addEventListener('click', () => this.switchMember());
        }
    }
};

// Expose globally
window.Auth = Auth;
