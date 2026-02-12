// =============================================
// PRODUCTIVEAPP - REVOLUTIONARY AUTH SYSTEM
// Experience premium immersive
// =============================================

const AuthRevolution = {
    particles: [],
    animationFrame: null,
    canvas: null,
    ctx: null,

    /**
     * Initialise le systeme d'auth revolutionnaire
     */
    init() {
        console.log('[AuthRevolution] Initializing...');
    },

    /**
     * Affiche la page de login/register
     */
    show(mode = 'login') {
        // Creer le container principal
        const container = document.createElement('div');
        container.id = 'auth-revolution';
        container.innerHTML = this.getHTML(mode);

        // Remplacer ou ajouter
        const existing = document.getElementById('auth-revolution');
        if (existing) existing.remove();

        document.body.appendChild(container);

        // Initialiser les particules
        this.initParticles();

        // Initialiser les events
        this.bindEvents(mode);

        // Animation d'entree
        requestAnimationFrame(() => {
            container.classList.add('visible');
        });
    },

    /**
     * HTML principal
     */
    getHTML(mode) {
        const isLogin = mode === 'login';

        return `
        <div class="auth-rev-overlay">
            <!-- Canvas pour particules -->
            <canvas id="auth-particles-canvas"></canvas>

            <!-- Cercles de lumiere -->
            <div class="auth-light-orb orb-1"></div>
            <div class="auth-light-orb orb-2"></div>
            <div class="auth-light-orb orb-3"></div>

            <!-- Card principale -->
            <div class="auth-rev-card">
                <!-- Logo avec aura -->
                <div class="auth-rev-logo-container">
                    <div class="auth-rev-logo-glow"></div>
                    <div class="auth-rev-logo-ring ring-1"></div>
                    <div class="auth-rev-logo-ring ring-2"></div>
                    <div class="auth-rev-logo-ring ring-3"></div>
                    <img src="https://d1yei2z3i6k35z.cloudfront.net/15127401/69726e0a0f7c4_ChatGPTImage29d%C3%A9c.202514_44_011.png"
                         alt="ProductiveApp"
                         class="auth-rev-logo">
                </div>

                <!-- Titre anime -->
                <h1 class="auth-rev-title">
                    ${isLogin ? 'Bon retour' : 'Bienvenue'}
                    <span class="auth-rev-title-glow"></span>
                </h1>
                <p class="auth-rev-subtitle">
                    ${isLogin ? 'Connecte-toi pour continuer ton ascension' : 'Cree ton compte et transforme ta vision en realite'}
                </p>

                <!-- Toggle Login/Register -->
                <div class="auth-rev-toggle">
                    <button class="auth-rev-toggle-btn ${isLogin ? 'active' : ''}" data-mode="login">
                        <span>Connexion</span>
                        <div class="toggle-glow"></div>
                    </button>
                    <button class="auth-rev-toggle-btn ${!isLogin ? 'active' : ''}" data-mode="register">
                        <span>Inscription</span>
                        <div class="toggle-glow"></div>
                    </button>
                    <div class="auth-rev-toggle-slider"></div>
                </div>

                <!-- Formulaire -->
                <form id="auth-rev-form" class="auth-rev-form">
                    <!-- Champ Nom (register only) -->
                    <div class="auth-rev-field ${isLogin ? 'hidden' : ''}" id="field-name">
                        <div class="field-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <div class="field-content">
                            <input type="text" id="auth-name" placeholder=" " autocomplete="name">
                            <label>Ton nom</label>
                            <div class="field-line"></div>
                            <div class="field-glow"></div>
                        </div>
                    </div>

                    <!-- Champ Email -->
                    <div class="auth-rev-field">
                        <div class="field-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </div>
                        <div class="field-content">
                            <input type="email" id="auth-email" placeholder=" " autocomplete="email" required>
                            <label>Adresse email</label>
                            <div class="field-line"></div>
                            <div class="field-glow"></div>
                        </div>
                    </div>

                    <!-- Champ Password -->
                    <div class="auth-rev-field">
                        <div class="field-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                        <div class="field-content">
                            <input type="password" id="auth-password" placeholder=" " autocomplete="${isLogin ? 'current-password' : 'new-password'}" required>
                            <label>Mot de passe</label>
                            <div class="field-line"></div>
                            <div class="field-glow"></div>
                        </div>
                        <button type="button" class="field-toggle-password" onclick="AuthRevolution.togglePassword()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="eye-open">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="eye-closed hidden">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                        </button>
                    </div>

                    <!-- Indicateur force mdp (register only) -->
                    <div class="auth-rev-strength ${isLogin ? 'hidden' : ''}" id="password-strength-rev">
                        <div class="strength-bars">
                            <div class="strength-bar"></div>
                            <div class="strength-bar"></div>
                            <div class="strength-bar"></div>
                            <div class="strength-bar"></div>
                        </div>
                        <span class="strength-label">Force du mot de passe</span>
                    </div>

                    <!-- Confirm Password (register only) -->
                    <div class="auth-rev-field ${isLogin ? 'hidden' : ''}" id="field-confirm">
                        <div class="field-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                <polyline points="9 12 11 14 15 10"></polyline>
                            </svg>
                        </div>
                        <div class="field-content">
                            <input type="password" id="auth-password-confirm" placeholder=" " autocomplete="new-password">
                            <label>Confirme le mot de passe</label>
                            <div class="field-line"></div>
                            <div class="field-glow"></div>
                        </div>
                    </div>

                    <!-- Forgot password (login only) -->
                    <div class="auth-rev-forgot ${!isLogin ? 'hidden' : ''}">
                        <a href="#" onclick="AuthRevolution.showForgotPassword(); return false;">
                            Mot de passe oublie ?
                        </a>
                    </div>

                    <!-- Terms (register only) -->
                    <div class="auth-rev-terms ${isLogin ? 'hidden' : ''}" id="field-terms">
                        <label class="custom-checkbox">
                            <input type="checkbox" id="auth-terms">
                            <span class="checkmark">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </span>
                            <span class="checkbox-label">
                                J'accepte les <a href="#" onclick="return false;">conditions</a> et la <a href="#" onclick="return false;">politique de confidentialite</a>
                            </span>
                        </label>
                    </div>

                    <!-- Error message -->
                    <div class="auth-rev-error hidden" id="auth-error">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span></span>
                    </div>

                    <!-- Submit button -->
                    <button type="submit" class="auth-rev-submit" id="auth-submit">
                        <span class="btn-text">${isLogin ? 'Se connecter' : 'Creer mon compte'}</span>
                        <span class="btn-loader">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"></circle>
                            </svg>
                        </span>
                        <span class="btn-success">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </span>
                        <div class="btn-glow"></div>
                        <div class="btn-particles"></div>
                    </button>
                </form>

                <!-- Social login -->
                <div class="auth-rev-divider">
                    <span>ou continue avec</span>
                </div>

                <div class="auth-rev-social">
                    <button class="social-btn google" onclick="AuthRevolution.socialLogin('google')" disabled>
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Google</span>
                    </button>
                </div>

                <!-- Footer -->
                <div class="auth-rev-footer">
                    <p>
                        ${isLogin
                            ? 'Pas encore de compte ? <a href="#" onclick="AuthRevolution.switchMode(\'register\'); return false;">Creer un compte</a>'
                            : 'Deja inscrit ? <a href="#" onclick="AuthRevolution.switchMode(\'login\'); return false;">Se connecter</a>'
                        }
                    </p>
                </div>
            </div>

            <!-- Floating elements -->
            <div class="auth-floating-elements">
                <div class="floating-shape shape-1"></div>
                <div class="floating-shape shape-2"></div>
                <div class="floating-shape shape-3"></div>
                <div class="floating-shape shape-4"></div>
            </div>
        </div>
        `;
    },

    /**
     * Initialise le canvas de particules
     */
    initParticles() {
        this.canvas = document.getElementById('auth-particles-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // Creer les particules
        this.particles = [];
        const particleCount = window.innerWidth < 768 ? 30 : 60;

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                pulse: Math.random() * Math.PI * 2
            });
        }

        window.addEventListener('resize', () => this.resizeCanvas());
        this.animateParticles();
    },

    /**
     * Redimensionne le canvas
     */
    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    /**
     * Anime les particules
     */
    animateParticles() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            // Update position
            p.x += p.speedX;
            p.y += p.speedY;
            p.pulse += 0.02;

            // Wrap around
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            // Draw
            const opacity = p.opacity * (0.5 + Math.sin(p.pulse) * 0.5);
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(212, 175, 55, ${opacity})`;
            this.ctx.fill();

            // Glow
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
            gradient.addColorStop(0, `rgba(212, 175, 55, ${opacity * 0.3})`);
            gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });

        // Connect nearby particles
        this.particles.forEach((p1, i) => {
            this.particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    const opacity = (1 - dist / 120) * 0.15;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;
                    this.ctx.stroke();
                }
            });
        });

        this.animationFrame = requestAnimationFrame(() => this.animateParticles());
    },

    /**
     * Bind les evenements
     */
    bindEvents(mode) {
        const form = document.getElementById('auth-rev-form');
        const passwordInput = document.getElementById('auth-password');
        const toggleBtns = document.querySelectorAll('.auth-rev-toggle-btn');

        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e, mode));
        }

        if (passwordInput && mode === 'register') {
            passwordInput.addEventListener('input', (e) => this.updatePasswordStrength(e.target.value));
        }

        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const newMode = btn.dataset.mode;
                if (newMode !== mode) {
                    this.switchMode(newMode);
                }
            });
        });

        // Focus animations
        document.querySelectorAll('.auth-rev-field input').forEach(input => {
            input.addEventListener('focus', () => {
                input.closest('.auth-rev-field').classList.add('focused');
            });
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.closest('.auth-rev-field').classList.remove('focused');
                }
            });
        });
    },

    /**
     * Change de mode login/register
     */
    switchMode(mode) {
        const card = document.querySelector('.auth-rev-card');
        card.classList.add('switching');

        setTimeout(() => {
            this.show(mode);
        }, 300);
    },

    /**
     * Toggle password visibility
     */
    togglePassword() {
        const input = document.getElementById('auth-password');
        const eyeOpen = document.querySelector('.eye-open');
        const eyeClosed = document.querySelector('.eye-closed');

        if (input.type === 'password') {
            input.type = 'text';
            eyeOpen.classList.add('hidden');
            eyeClosed.classList.remove('hidden');
        } else {
            input.type = 'password';
            eyeOpen.classList.remove('hidden');
            eyeClosed.classList.add('hidden');
        }
    },

    /**
     * Update password strength indicator
     */
    updatePasswordStrength(password) {
        const container = document.getElementById('password-strength-rev');
        if (!container) return;

        const bars = container.querySelectorAll('.strength-bar');
        const label = container.querySelector('.strength-label');

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        const labels = ['Tres faible', 'Faible', 'Moyen', 'Fort'];
        const colors = ['#ef4444', '#f97316', '#eab308', '#10b981'];

        bars.forEach((bar, i) => {
            if (i < strength) {
                bar.classList.add('active');
                bar.style.background = colors[strength - 1];
            } else {
                bar.classList.remove('active');
                bar.style.background = '';
            }
        });

        label.textContent = password ? labels[strength - 1] || 'Tres faible' : 'Force du mot de passe';
        label.style.color = password ? colors[strength - 1] || colors[0] : '';
    },

    /**
     * Affiche une erreur
     */
    showError(message) {
        const errorEl = document.getElementById('auth-error');
        if (errorEl) {
            errorEl.querySelector('span').textContent = message;
            errorEl.classList.remove('hidden');
            errorEl.classList.add('shake');
            setTimeout(() => errorEl.classList.remove('shake'), 500);
        }
    },

    /**
     * Cache l'erreur
     */
    hideError() {
        const errorEl = document.getElementById('auth-error');
        if (errorEl) {
            errorEl.classList.add('hidden');
        }
    },

    /**
     * Gere la soumission du formulaire
     */
    async handleSubmit(e, mode) {
        e.preventDefault();
        this.hideError();

        const btn = document.getElementById('auth-submit');
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;

        // Validation
        if (!email || !password) {
            this.showError('Remplis tous les champs');
            return;
        }

        if (mode === 'register') {
            const name = document.getElementById('auth-name').value.trim();
            const confirmPassword = document.getElementById('auth-password-confirm').value;
            const terms = document.getElementById('auth-terms').checked;

            if (!name) {
                this.showError('Entre ton nom');
                return;
            }

            if (password.length < 8) {
                this.showError('Mot de passe trop court (8 caracteres min)');
                return;
            }

            if (password !== confirmPassword) {
                this.showError('Les mots de passe ne correspondent pas');
                return;
            }

            if (!terms) {
                this.showError('Accepte les conditions pour continuer');
                return;
            }
        }

        // Loading state
        btn.classList.add('loading');

        try {
            const endpoint = mode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';
            const body = mode === 'login'
                ? { email, password }
                : { email, password, name: document.getElementById('auth-name').value.trim() };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.success) {
                // Success animation
                btn.classList.remove('loading');
                btn.classList.add('success');

                // Save tokens
                if (typeof ApiTokens !== 'undefined' && data.data?.tokens) {
                    ApiTokens.setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
                }
                if (data.data?.user) {
                    localStorage.setItem('user', JSON.stringify(data.data.user));
                }

                // Redirect after animation
                setTimeout(() => {
                    if (mode === 'register') {
                        // Show onboarding for new users
                        this.showOnboarding(data.data.user);
                    } else {
                        // Reload for login
                        window.location.reload();
                    }
                }, 1500);
            } else {
                btn.classList.remove('loading');
                this.showError(data.error?.message || 'Une erreur est survenue');
            }
        } catch (error) {
            console.error('[AuthRevolution] Error:', error);
            btn.classList.remove('loading');
            this.showError('Erreur de connexion au serveur');
        }
    },

    /**
     * Affiche la page mot de passe oublie
     */
    showForgotPassword() {
        const card = document.querySelector('.auth-rev-card');

        card.innerHTML = `
            <div class="auth-rev-logo-container">
                <div class="auth-rev-logo-glow"></div>
                <img src="https://d1yei2z3i6k35z.cloudfront.net/15127401/69726e0a0f7c4_ChatGPTImage29d%C3%A9c.202514_44_011.png"
                     alt="ProductiveApp"
                     class="auth-rev-logo">
            </div>

            <h1 class="auth-rev-title">Mot de passe oublie ?</h1>
            <p class="auth-rev-subtitle">Entre ton email, on t'envoie un lien de reinitialisation</p>

            <form id="forgot-form" class="auth-rev-form">
                <div class="auth-rev-field">
                    <div class="field-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                    </div>
                    <div class="field-content">
                        <input type="email" id="forgot-email" placeholder=" " autocomplete="email" required>
                        <label>Adresse email</label>
                        <div class="field-line"></div>
                        <div class="field-glow"></div>
                    </div>
                </div>

                <div class="auth-rev-error hidden" id="auth-error">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span></span>
                </div>

                <div class="auth-rev-success hidden" id="auth-success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>Email envoye ! Verifie ta boite mail.</span>
                </div>

                <button type="submit" class="auth-rev-submit" id="auth-submit">
                    <span class="btn-text">Envoyer le lien</span>
                    <span class="btn-loader">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"></circle>
                        </svg>
                    </span>
                    <div class="btn-glow"></div>
                </button>
            </form>

            <div class="auth-rev-footer" style="margin-top: 32px;">
                <p><a href="#" onclick="AuthRevolution.show('login'); return false;">← Retour a la connexion</a></p>
            </div>
        `;

        // Bind events
        document.getElementById('forgot-form').addEventListener('submit', (e) => this.handleForgotPassword(e));

        // Focus animation
        const input = document.getElementById('forgot-email');
        input.addEventListener('focus', () => input.closest('.auth-rev-field').classList.add('focused'));
        input.addEventListener('blur', () => {
            if (!input.value) input.closest('.auth-rev-field').classList.remove('focused');
        });
    },

    /**
     * Gere la demande de reset password
     */
    async handleForgotPassword(e) {
        e.preventDefault();

        const email = document.getElementById('forgot-email').value.trim();
        const btn = document.getElementById('auth-submit');
        const successEl = document.getElementById('auth-success');

        if (!email) {
            this.showError('Entre ton adresse email');
            return;
        }

        btn.classList.add('loading');
        this.hideError();

        try {
            await fetch('/api/v1/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            btn.classList.remove('loading');

            // Always show success (don't reveal if email exists)
            successEl.classList.remove('hidden');
            document.getElementById('forgot-form').querySelector('button[type="submit"]').disabled = true;

        } catch (error) {
            console.error('[AuthRevolution] Forgot password error:', error);
            btn.classList.remove('loading');
            this.showError('Erreur de connexion');
        }
    },

    /**
     * Affiche l'onboarding revolutionnaire
     */
    showOnboarding(user) {
        console.log('[AuthRevolution] Show onboarding for:', user);

        // Close auth modal
        this.close();

        // Start revolutionary onboarding
        setTimeout(() => {
            if (typeof OnboardingRevolution !== 'undefined') {
                OnboardingRevolution.show(user);
            } else if (typeof OnboardingModule !== 'undefined') {
                OnboardingModule.show();
            } else {
                window.location.reload();
            }
        }, 600);
    },

    /**
     * Social login placeholder
     */
    socialLogin(provider) {
        console.log('[AuthRevolution] Social login:', provider);
        alert('Bientot disponible !');
    },

    /**
     * Ferme le systeme d'auth
     */
    close() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        const container = document.getElementById('auth-revolution');
        if (container) {
            container.classList.remove('visible');
            setTimeout(() => container.remove(), 500);
        }
    }
};

// Export global
if (typeof window !== 'undefined') {
    window.AuthRevolution = AuthRevolution;
}
