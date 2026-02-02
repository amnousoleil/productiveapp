// =============================================
// PRODUCTIVEAPP - AUTH MODULE
// Authentification avec avatars et animations
// =============================================

const Auth = {
    currentProfileIndex: 0,

    /**
     * Initialize authentication
     */
    init() {
        console.log('🔐 Auth: Initializing...');

        // Check for existing session
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                const configUser = AppConfig.USERS.find(u => u.id === user.id);
                if (configUser) {
                    console.log('✅ Auth: Restored session for', user.name);
                    AppState.currentUser = configUser;
                    this.onLoginSuccess();
                    return;
                }
            } catch (e) {
                localStorage.removeItem('currentUser');
            }
        }

        // No session - show login
        console.log('🔐 Auth: No session, showing login');
        this.showLoginScreen();
    },

    /**
     * Show the login screen with avatars
     */
    showLoginScreen() {
        const loginScreen = document.getElementById('login-screen');
        if (!loginScreen) return;

        loginScreen.classList.remove('hidden');
        this.renderUserSelect();
        this.initProfileCarousel();
        this.initLoginEvents();

        // Start fire particles animation
        setTimeout(() => {
            if (typeof Effects !== 'undefined' && Effects.initFireBreathParticles) {
                Effects.initFireBreathParticles();
            }
            if (typeof Effects !== 'undefined' && Effects.createFireBubbles) {
                Effects.createFireBubbles();
            }
        }, 500);
    },

    /**
     * Render user selection grid
     */
    renderUserSelect() {
        const grid = document.getElementById('user-select-grid');
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

        // Event listeners
        grid.querySelectorAll('.user-select-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectUser(btn.dataset.userid));
        });
    },

    /**
     * Select a user for login
     */
    selectUser(userId) {
        const user = AppConfig.USERS.find(u => u.id === userId);
        if (!user) return;

        AppState.currentUser = user;

        // Show password form or login directly if no password
        if (!user.password) {
            // Team user - no password needed
            this.attemptLogin('');
        } else {
            // Hide carousel completely, show compact password form
            document.querySelector('.user-carousel')?.classList.add('hidden');
            document.querySelector('.login-subtitle')?.classList.add('hidden');

            // Update and show password form
            const usernameEl = document.getElementById('login-username');
            if (usernameEl) {
                usernameEl.innerHTML = `<img src="${user.loginImg}" class="login-selected-avatar"> ${user.name}`;
            }

            document.getElementById('password-form')?.classList.remove('hidden');
            document.getElementById('login-password')?.focus();
        }
    },

    /**
     * Attempt login with password
     */
    attemptLogin(password) {
        const user = AppState.currentUser;
        if (!user) return;

        const errorEl = document.getElementById('login-error');

        // Check password (or allow if no password required)
        if (!user.password || password === user.password) {
            // Success
            if (errorEl) errorEl.textContent = '';
            localStorage.setItem('currentUser', JSON.stringify({ id: user.id, name: user.name }));
            this.onLoginSuccess();
        } else {
            // Wrong password
            if (errorEl) {
                errorEl.textContent = '❌ Mot de passe incorrect';
                errorEl.style.animation = 'shake 0.5s ease';
                setTimeout(() => errorEl.style.animation = '', 500);
            }
            document.getElementById('login-password')?.focus();
        }
    },

    /**
     * On successful login
     */
    async onLoginSuccess() {
        console.log('✅ Auth: Login successful');

        // Hide login screen
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            loginScreen.classList.add('hidden');
        }

        // Add logged-in class
        document.body.classList.add('logged-in');

        // Initialize app with error handling
        try {
            if (typeof App !== 'undefined' && App.init) {
                await App.init();
            }
        } catch (error) {
            console.error('❌ App.init() error:', error);
        }

        // Navigate to tasks view (default)
        try {
            if (typeof ViewRouter !== 'undefined') {
                ViewRouter.navigate('tasks');
            }
        } catch (error) {
            console.error('❌ Router error:', error);
        }
    },

    /**
     * Logout
     */
    logout() {
        console.log('🔐 Auth: Logging out');

        localStorage.removeItem('currentUser');
        AppState.currentUser = null;

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
     * Initialize profile carousel
     */
    initProfileCarousel() {
        const showProfile = (index, direction = 'initial') => {
            const buttons = document.querySelectorAll('.user-select-btn');
            if (buttons.length === 0) return;

            if (index < 0) index = buttons.length - 1;
            if (index >= buttons.length) index = 0;
            this.currentProfileIndex = index;

            buttons.forEach((btn, i) => {
                if (i === index) {
                    btn.style.display = 'flex';
                    btn.style.opacity = '1';
                    btn.style.transform = 'scale(1.1)';
                    btn.style.animation = 'none';
                    btn.offsetHeight; // Trigger reflow

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

        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');

        if (prevBtn) {
            prevBtn.onclick = () => showProfile(this.currentProfileIndex - 1, 'left');
        }
        if (nextBtn) {
            nextBtn.onclick = () => showProfile(this.currentProfileIndex + 1, 'right');
        }

        // Initial display with delay for animation
        setTimeout(() => showProfile(0), 100);
    },

    /**
     * Initialize login events
     */
    initLoginEvents() {
        const loginBtn = document.getElementById('login-btn');
        const backBtn = document.getElementById('back-btn');
        const passwordInput = document.getElementById('login-password');

        if (loginBtn) {
            loginBtn.onclick = () => {
                const password = passwordInput?.value || '';
                this.attemptLogin(password);
            };
        }

        if (backBtn) {
            backBtn.onclick = () => {
                // Hide password form
                document.getElementById('password-form')?.classList.add('hidden');
                // Show carousel again
                document.querySelector('.user-carousel')?.classList.remove('hidden');
                document.querySelector('.login-subtitle')?.classList.remove('hidden');
                // Clear inputs
                if (passwordInput) passwordInput.value = '';
                const errorEl = document.getElementById('login-error');
                if (errorEl) errorEl.textContent = '';
            };
        }

        if (passwordInput) {
            passwordInput.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    this.attemptLogin(passwordInput.value);
                }
            };
        }
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
    }
};

// Expose globally
window.Auth = Auth;
