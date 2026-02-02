// =============================================
// PRODUCTIVEAPP - LOGIN UI
// Simple email/password form for API testing
// =============================================

const LoginUI = (function() {
    'use strict';

    let isSubmitting = false;

    /**
     * Render the login form
     */
    function render() {
        const loginScreen = document.getElementById('login-screen');
        if (!loginScreen) return;

        loginScreen.innerHTML = `
            <div class="login-card">
                <div class="login-header">
                    <img src="https://d1yei2z3i6k35z.cloudfront.net/15127401/69726e0a0f7c4_ChatGPTImage29d%C3%A9c.202514_44_011.png"
                         alt="Logo" class="login-logo-small">
                    <h1 class="login-title">ProductiveApp</h1>
                    <p class="login-subtitle">Connectez-vous pour continuer</p>
                </div>

                <form id="login-form" class="login-form-new">
                    <div class="form-group">
                        <label for="login-email">Email</label>
                        <input type="email"
                               id="login-email"
                               placeholder="votre@email.com"
                               autocomplete="email"
                               required>
                    </div>

                    <div class="form-group">
                        <label for="login-password-new">Mot de passe</label>
                        <div class="password-wrapper">
                            <input type="password"
                                   id="login-password-new"
                                   placeholder="••••••••"
                                   autocomplete="current-password"
                                   required>
                            <button type="button" class="password-toggle" id="toggle-password">
                                <svg class="eye-open" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <svg class="eye-closed hidden" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div id="login-error-new" class="login-error"></div>

                    <button type="submit" id="login-submit" class="login-btn-new">
                        <span class="btn-text">Se connecter</span>
                        <span class="btn-spinner hidden">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"></circle>
                            </svg>
                        </span>
                    </button>
                </form>

                <div class="login-footer">
                    <p class="login-hint"></p>
                </div>
            </div>
        `;

        initEvents();
    }

    /**
     * Initialize form events
     */
    function initEvents() {
        const form = document.getElementById('login-form');
        const toggleBtn = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('login-password-new');

        if (form) {
            form.addEventListener('submit', handleSubmit);
        }

        if (toggleBtn && passwordInput) {
            toggleBtn.addEventListener('click', () => {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                toggleBtn.querySelector('.eye-open').classList.toggle('hidden', !isPassword);
                toggleBtn.querySelector('.eye-closed').classList.toggle('hidden', isPassword);
            });
        }
    }

    /**
     * Handle form submission
     */
    async function handleSubmit(e) {
        e.preventDefault();

        if (isSubmitting) return;

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password-new').value;
        const errorEl = document.getElementById('login-error-new');
        const submitBtn = document.getElementById('login-submit');

        // Validate
        if (!email || !password) {
            showError('Veuillez remplir tous les champs');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Email invalide');
            return;
        }

        // Start loading
        isSubmitting = true;
        setLoading(true);
        clearError();

        try {
            const result = await ApiAuth.login(email, password);

            // Success - update app state
            if (result.user) {
                if (typeof AppState !== 'undefined') {
                    AppState.currentUser = result.user;
                    AppState.setUser(result.user);
                }
            }

            // Hide login, show app
            document.getElementById('login-screen').classList.add('hidden');
            document.body.classList.add('logged-in');

            // Init app
            if (typeof App !== 'undefined' && App.init) {
                App.init();
            }

            // Navigate to dashboard
            if (typeof Router !== 'undefined') {
                Router.navigate('dashboard');
            }

        } catch (error) {
            console.error('Login failed:', error);
            showError(error.message || 'Identifiants incorrects');
        } finally {
            isSubmitting = false;
            setLoading(false);
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        const errorEl = document.getElementById('login-error-new');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('visible');
        }
    }

    /**
     * Clear error message
     */
    function clearError() {
        const errorEl = document.getElementById('login-error-new');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('visible');
        }
    }

    /**
     * Set loading state
     */
    function setLoading(loading) {
        const submitBtn = document.getElementById('login-submit');
        if (submitBtn) {
            submitBtn.disabled = loading;
            submitBtn.querySelector('.btn-text').classList.toggle('hidden', loading);
            submitBtn.querySelector('.btn-spinner').classList.toggle('hidden', !loading);
        }
    }

    /**
     * Validate email format
     */
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /**
     * Check existing session and auto-login
     */
    async function checkSession() {
        if (!ApiTokens.isAuthenticated()) {
            return false;
        }

        try {
            const data = await ApiAuth.getMe();
            if (data && data.user) {
                if (typeof AppState !== 'undefined') {
                    AppState.currentUser = data.user;
                    AppState.setUser(data.user);
                }
                return true;
            }
        } catch (error) {
            console.warn('Session check failed:', error);
            ApiTokens.clearTokens();
        }

        return false;
    }

    return {
        render,
        checkSession,
        showError,
        clearError
    };
})();

if (typeof window !== 'undefined') {
    window.LoginUI = LoginUI;
}
