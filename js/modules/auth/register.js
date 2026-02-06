// =============================================
// PRODUCTIVEAPP - REGISTER MODULE
// Page d'inscription complete
// =============================================

const RegisterModule = {
    initialized: false,

    /**
     * Initialise le module
     */
    init() {
        if (this.initialized) return;
        this.bindEvents();
        console.log('[RegisterModule] Initialized');
        this.initialized = true;
    },

    /**
     * Affiche la page d'inscription
     */
    show() {
        const container = document.getElementById('auth-container');
        if (!container) return;

        container.innerHTML = `
            <div class="auth-page register-page">
                <div class="auth-card">
                    <div class="auth-logo">
                        <img src="https://d1yei2z3i6k35z.cloudfront.net/15127401/69726e0a0f7c4_ChatGPTImage29d%C3%A9c.202514_44_011.png" alt="ProductiveApp">
                    </div>
                    <h1>Creer un compte</h1>
                    <p class="auth-subtitle">Rejoignez ProductiveApp gratuitement</p>

                    <form id="register-form" class="auth-form">
                        <div class="form-group">
                            <label for="register-name">Votre nom</label>
                            <input type="text" id="register-name" placeholder="Jean Dupont" required autocomplete="name">
                        </div>

                        <div class="form-group">
                            <label for="register-email">Email professionnel</label>
                            <input type="email" id="register-email" placeholder="jean@entreprise.com" required autocomplete="email">
                        </div>

                        <div class="form-group">
                            <label for="register-password">Mot de passe</label>
                            <div class="password-input-wrapper">
                                <input type="password" id="register-password" placeholder="Minimum 8 caracteres" required autocomplete="new-password" minlength="8">
                                <button type="button" class="toggle-password" onclick="RegisterModule.togglePassword()">
                                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                </button>
                            </div>
                            <div class="password-strength" id="password-strength"></div>
                        </div>

                        <div class="form-group">
                            <label for="register-password-confirm">Confirmer le mot de passe</label>
                            <input type="password" id="register-password-confirm" placeholder="Retapez votre mot de passe" required autocomplete="new-password">
                        </div>

                        <div class="form-group checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="register-terms" required>
                                <span>J'accepte les <a href="#" onclick="RegisterModule.showTerms()">conditions d'utilisation</a></span>
                            </label>
                        </div>

                        <div id="register-error" class="auth-error hidden"></div>

                        <button type="submit" class="auth-btn primary" id="register-btn">
                            <span>Creer mon compte</span>
                        </button>
                    </form>

                    <div class="auth-divider">
                        <span>ou</span>
                    </div>

                    <div class="auth-alternatives">
                        <button class="auth-btn google" onclick="RegisterModule.googleSignup()" disabled>
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span>Continuer avec Google</span>
                        </button>
                    </div>

                    <div class="auth-footer">
                        <p>Deja un compte ? <a href="#" onclick="RegisterModule.goToLogin()">Se connecter</a></p>
                    </div>
                </div>
            </div>
        `;

        this.bindFormEvents();
    },

    /**
     * Bind les evenements du formulaire
     */
    bindFormEvents() {
        const form = document.getElementById('register-form');
        const passwordInput = document.getElementById('register-password');

        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
        }
    },

    /**
     * Bind events globaux
     */
    bindEvents() {
        // Nothing global for now
    },

    /**
     * Verifie la force du mot de passe
     */
    checkPasswordStrength(password) {
        const strengthEl = document.getElementById('password-strength');
        if (!strengthEl) return;

        let strength = 0;
        let feedback = [];

        if (password.length >= 8) strength++;
        else feedback.push('8 caracteres minimum');

        if (/[a-z]/.test(password)) strength++;
        else feedback.push('une minuscule');

        if (/[A-Z]/.test(password)) strength++;
        else feedback.push('une majuscule');

        if (/[0-9]/.test(password)) strength++;
        else feedback.push('un chiffre');

        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        else feedback.push('un caractere special');

        const levels = ['Tres faible', 'Faible', 'Moyen', 'Fort', 'Tres fort'];
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

        strengthEl.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill" style="width: ${strength * 20}%; background: ${colors[strength - 1] || '#ef4444'}"></div>
            </div>
            <span class="strength-text" style="color: ${colors[strength - 1] || '#ef4444'}">${levels[strength - 1] || 'Tres faible'}</span>
            ${feedback.length > 0 ? `<span class="strength-hint">Ajoutez: ${feedback.join(', ')}</span>` : ''}
        `;
    },

    /**
     * Toggle visibilite mot de passe
     */
    togglePassword() {
        const input = document.getElementById('register-password');
        if (input) {
            input.type = input.type === 'password' ? 'text' : 'password';
        }
    },

    /**
     * Gere la soumission du formulaire
     */
    async handleSubmit(e) {
        e.preventDefault();

        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;
        const terms = document.getElementById('register-terms').checked;
        const errorEl = document.getElementById('register-error');
        const btn = document.getElementById('register-btn');

        // Validation
        if (!terms) {
            this.showError('Veuillez accepter les conditions d\'utilisation');
            return;
        }

        if (password !== passwordConfirm) {
            this.showError('Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 8) {
            this.showError('Le mot de passe doit contenir au moins 8 caracteres');
            return;
        }

        // UI loading state
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Creation en cours...';
        errorEl.classList.add('hidden');

        try {
            const response = await fetch('/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Sauvegarder les tokens
                if (typeof ApiTokens !== 'undefined') {
                    ApiTokens.setTokens(data.data.tokens);
                }
                localStorage.setItem('user', JSON.stringify(data.data.user));

                // Afficher l'onboarding
                this.showSuccess('Compte cree avec succes !');
                setTimeout(() => {
                    if (typeof OnboardingModule !== 'undefined') {
                        OnboardingModule.show();
                    } else {
                        window.location.reload();
                    }
                }, 1500);
            } else {
                this.showError(data.error?.message || 'Erreur lors de la creation du compte');
            }
        } catch (error) {
            console.error('[RegisterModule] Error:', error);
            this.showError('Erreur de connexion au serveur');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span>Creer mon compte</span>';
        }
    },

    /**
     * Affiche une erreur
     */
    showError(message) {
        const errorEl = document.getElementById('register-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
        }
    },

    /**
     * Affiche un succes
     */
    showSuccess(message) {
        const errorEl = document.getElementById('register-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
            errorEl.classList.add('success');
        }
    },

    /**
     * Google signup (placeholder)
     */
    googleSignup() {
        alert('Google signup coming soon!');
    },

    /**
     * Affiche les conditions
     */
    showTerms() {
        alert('Conditions d\'utilisation - Coming soon');
    },

    /**
     * Retour au login
     */
    goToLogin() {
        if (typeof AuthLogin !== 'undefined') {
            AuthLogin.show();
        } else {
            window.location.href = '/';
        }
    }
};

// Auto-init
if (typeof window !== 'undefined') {
    window.RegisterModule = RegisterModule;
}
