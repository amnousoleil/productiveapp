// =============================================
// PRODUCTIVEAPP - AUTH MODULE v2.0
// Authentification équipe + sélection membre
// =============================================

const Auth = {
    apiUser: null, // Utilisateur API après authentification
    authenticated: false, // Flag to prevent re-init loop

    /**
     * Initialize authentication
     * Checks for existing JWT token and validates session via API
     */
    async init() {
        console.log('🔐 Auth: Initializing...');

        // CRITICAL: Prevent infinite loop - if already authenticated, skip
        if (this.authenticated) {
            console.log('✅ Auth: Already authenticated, skipping init');
            return;
        }

        // SECURITY: Team emails allowed (all @mahagiri.fr addresses)
        const ALLOWED_DOMAIN = '@mahagiri.fr';

        // Check for existing JWT session
        const accessToken = ApiTokens.getAccessToken();
        if (accessToken) {
            try {
                const response = await ApiAuth.getMe();

                if (response && response.user) {
                    console.log('✅ Auth: Session valid');

                    // SECURITY: Only allow team emails (@mahagiri.fr) to access member picker
                    if (!response.user.email?.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
                        console.warn('⚠️ Auth: Non-team email, clearing session');
                        ApiTokens.clearTokens();
                        this.showLoginScreen();
                        return;
                    }

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
        const DEFAULT_WORKSPACE_ID = 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f';
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
            const memberPicker2 = document.getElementById('member-picker');
            if (memberPicker2) memberPicker2.remove();
        if (!loginScreen) return;

        loginScreen.classList.remove('hidden');

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
            const memberPicker2 = document.getElementById('member-picker');
            if (memberPicker2) memberPicker2.remove();
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

        // Direct click handlers on each button (most reliable)
        grid.querySelectorAll('.member-select-btn').forEach(btn => {
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                const memberId = this.dataset.memberid;

                try {
                    Auth.selectMember(memberId);
                } catch (err) {
                    console.error('❌ selectMember error:', err);
                }
            };
        });
    },

    /**
     * Select a team member
     */
    selectMemberDirect(apiUser) {
        localStorage.setItem('selectedMemberId', apiUser.id);
        AppState.currentUser = {
            ...apiUser,
            avatar: '👤',
            role: 'team'
        };
        this.authenticated = true;
        try {
            const loginScreen = document.getElementById('login-screen');
            if (loginScreen) loginScreen.remove();
            document.body.classList.add('logged-in');
            document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
            const tasksView = document.getElementById('view-tasks');
            if (tasksView) tasksView.classList.add('active');
            if (typeof App !== 'undefined' && App.init) {
                App.init().catch(err => console.error('App.init error:', err));
            }
        } catch (error) {
            console.error('❌ Entry error:', error);
        }
    },

    selectMember(memberId) {
        const member = AppConfig.USERS.find(u => u.id === memberId);
        if (!member) {
            console.error('❌ Auth: Member not found');
            return;
        }

        // Save selected member
        localStorage.setItem('selectedMemberId', memberId);

        // Set current user
        AppState.currentUser = {
            ...(this.apiUser || {}),
            ...member,
            id: member.id,
            name: member.name
        };

        // CRITICAL: Set authenticated flag BEFORE App.init to prevent infinite loop
        this.authenticated = true;

        // DIRECT ENTRY
        try {
            const loginScreen = document.getElementById('login-screen');
            if (loginScreen) {
                loginScreen.remove();
            }

            // Add logged-in class
            document.body.classList.add('logged-in');

            // Show tasks view directly
            document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
            const tasksView = document.getElementById('view-tasks');
            if (tasksView) {
                tasksView.classList.add('active');
            }

            // Initialize app (Auth.init will skip because authenticated=true)
            if (typeof App !== 'undefined' && App.init) {
                App.init().catch(err => console.error('App.init error:', err));
            }

        } catch (error) {
            console.error('❌ Entry error:', error);
        }
    },

    /**
     * Attempt login with email/password via API
     * IMPORTANT: Only contact@mahagiri.fr can access the member picker
     */
    async attemptLogin() {
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        const errorEl = document.getElementById('login-error');
        const loginBtn = document.getElementById('login-btn');

        const email = emailInput?.value?.trim()?.toLowerCase();
        const password = passwordInput?.value;

        if (!email || !password) {
            if (errorEl) errorEl.textContent = '❌ Email et mot de passe requis';
            return;
        }

        // SECURITY: Only team emails (@mahagiri.fr) can access member picker
        const ALLOWED_DOMAINS = ['@mahagiri.fr', '@giri-app.com'];
        const domainOk = ALLOWED_DOMAINS.some(d => email.endsWith(d));

        if (!domainOk) {
            if (errorEl) {
                errorEl.textContent = '❌ Accès réservé à l\'équipe';
                errorEl.style.animation = 'shake 0.5s ease';
                setTimeout(() => errorEl.style.animation = '', 500);
            }
            return;
        }

        // Show loading state
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span class="spinner"></span> Connexion...';
        }

        try {
            const result = await ApiAuth.login(email, password);

            if (result && result.user) {
                if (errorEl) errorEl.textContent = '';
                this.apiUser = result.user;

                // Auto-select member matching user ID (no member picker)
                const matchedMember = AppConfig.USERS.find(u => u.id === result.user.id);
                if (matchedMember) {
                    this.selectMember(matchedMember.id);
                } else {
                    this.selectMemberDirect(result.user);
                }
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
        // Hide login screen
        const loginScreen = document.getElementById('login-screen');
        const memberPicker2 = document.getElementById('member-picker');
        if (memberPicker2) memberPicker2.remove();
        if (loginScreen) {
            loginScreen.classList.add('hidden');
            loginScreen.style.display = 'none';
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
            if (typeof ViewRouter !== 'undefined' && ViewRouter.navigate) {
                ViewRouter.navigate('tasks');
            } else if (typeof Router !== 'undefined' && Router.navigate) {
                Router.navigate('tasks');
            } else {
                document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
                const tasksView = document.getElementById('tasks-view');
                if (tasksView) {
                    tasksView.classList.add('active');
                }
            }
        } catch (error) {
            console.error('❌ Router error:', error);
            // Fallback: manually show tasks view
            document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
            const tasksView = document.getElementById('tasks-view');
            if (tasksView) {
                tasksView.classList.add('active');
            }
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
            const memberPicker2 = document.getElementById('member-picker');
            if (memberPicker2) memberPicker2.remove();
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

        // Reset notes state when switching members
        if (typeof NotesModule !== 'undefined' && NotesModule.reset) {
            NotesModule.reset();
        }

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
                input.onkeydown = (e) => {
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
            // Always use emoji avatar in header badge (not loginImg)
            const avatarHtml = `<span class="user-avatar">${user.avatar || '👤'}</span>`;

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

// GLOBAL FUNCTION - Backup entry method
window.enterApp = function(memberId) {
    const member = AppConfig.USERS.find(u => u.id === memberId);
    if (!member) return;

    localStorage.setItem('selectedMemberId', memberId);
    AppState.currentUser = { ...member };

    const loginScreen = document.getElementById('login-screen');
    const memberPicker2 = document.getElementById('member-picker');
    if (memberPicker2) memberPicker2.remove();
    if (loginScreen) {
        loginScreen.style.display = 'none';
    }

    document.body.classList.add('logged-in');

    document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
    const tasksView = document.getElementById('view-tasks');
    if (tasksView) tasksView.classList.add('active');

    if (typeof App !== 'undefined' && App.init) {
        App.init();
    }
};
