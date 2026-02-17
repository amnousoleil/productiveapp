// =============================================
// PRODUCTIVEAPP - REVOLUTIONARY ONBOARDING
// Experience immersive pour nouveaux utilisateurs
// =============================================

const OnboardingRevolution = {
    currentStep: 0,
    userData: {},
    confettiParticles: [],
    animationFrame: null,

    /**
     * Steps de l'onboarding
     */
    steps: [
        {
            id: 'welcome',
            icon: '&#10024;', // sparkles
            title: 'Bienvenue dans ProductiveApp',
            subtitle: 'Ton aventure vers la productivite commence ici',
            type: 'intro'
        },
        {
            id: 'profile',
            icon: '&#128100;', // bust
            title: 'Personalise ton profil',
            subtitle: 'Comment veux-tu qu\'on t\'appelle ?',
            type: 'input'
        },
        {
            id: 'workspace',
            icon: '&#127968;', // house
            title: 'Ton premier workspace',
            subtitle: 'Cree ton espace de travail personnel ou d\'equipe',
            type: 'workspace'
        },
        {
            id: 'theme',
            icon: '&#127912;', // artist palette
            title: 'Choisis ton ambiance',
            subtitle: 'Selectionne le theme qui te correspond',
            type: 'theme'
        },
        {
            id: 'features',
            icon: '&#128640;', // rocket
            title: 'Decouvre les fonctionnalites',
            subtitle: 'Un apercu de ce que tu peux accomplir',
            type: 'features'
        },
        {
            id: 'complete',
            icon: '&#127881;', // celebration
            title: 'Tu es pret !',
            subtitle: 'Commence a transformer ta vision en realite',
            type: 'complete'
        }
    ],

    /**
     * Lance l'onboarding
     */
    show(user = null) {
        if (this.isCompleted()) {
            console.log('[OnboardingRevolution] Already completed');
            return;
        }

        this.userData = user || JSON.parse(localStorage.getItem('user') || '{}');
        this.currentStep = 0;
        this.createContainer();
        this.render();
    },

    /**
     * Cree le container principal
     */
    createContainer() {
        // Remove existing
        const existing = document.getElementById('onboarding-revolution');
        if (existing) existing.remove();

        const container = document.createElement('div');
        container.id = 'onboarding-revolution';
        container.innerHTML = `
            <div class="onb-overlay">
                <!-- Background effects -->
                <canvas id="onb-canvas"></canvas>
                <div class="onb-bg-gradient"></div>
                <div class="onb-stars"></div>

                <!-- Main card -->
                <div class="onb-card" id="onb-card">
                    <div class="onb-card-content" id="onb-content"></div>
                </div>

                <!-- Progress bar -->
                <div class="onb-progress-container">
                    <div class="onb-progress-bar">
                        <div class="onb-progress-fill" id="onb-progress"></div>
                    </div>
                    <div class="onb-progress-steps" id="onb-progress-steps"></div>
                </div>

                <!-- Skip button -->
                <button class="onb-skip" onclick="OnboardingRevolution.skip()">
                    Passer
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(container);

        // Init canvas stars
        this.initStars();

        // Animation d'entree
        requestAnimationFrame(() => {
            container.classList.add('visible');
        });
    },

    /**
     * Initialise les etoiles animees
     */
    initStars() {
        const starsContainer = document.querySelector('.onb-stars');
        if (!starsContainer) return;

        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'onb-star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            star.style.animationDuration = (Math.random() * 2 + 2) + 's';
            starsContainer.appendChild(star);
        }
    },

    /**
     * Render le step courant
     */
    render() {
        const step = this.steps[this.currentStep];
        const content = document.getElementById('onb-content');
        const progress = document.getElementById('onb-progress');
        const progressSteps = document.getElementById('onb-progress-steps');

        if (!content) return;

        // Update progress
        const progressPercent = ((this.currentStep) / (this.steps.length - 1)) * 100;
        progress.style.width = progressPercent + '%';

        // Update step indicators
        progressSteps.innerHTML = this.steps.map((s, i) => `
            <div class="onb-step-dot ${i < this.currentStep ? 'completed' : ''} ${i === this.currentStep ? 'active' : ''}"
                 onclick="OnboardingRevolution.goToStep(${i})">
                <span class="dot-inner"></span>
                <span class="dot-pulse"></span>
            </div>
        `).join('');

        // Animate card exit
        const card = document.getElementById('onb-card');
        card.classList.add('switching');

        setTimeout(() => {
            content.innerHTML = this.getStepHTML(step);
            card.classList.remove('switching');
            card.classList.add('entering');

            setTimeout(() => card.classList.remove('entering'), 500);

            // Init step-specific features
            this.initStepFeatures(step);
        }, 300);
    },

    /**
     * Genere le HTML pour chaque type de step
     */
    getStepHTML(step) {
        const baseHeader = `
            <div class="onb-step-icon">${step.icon}</div>
            <h1 class="onb-step-title">${step.title}</h1>
            <p class="onb-step-subtitle">${step.subtitle}</p>
        `;

        switch (step.type) {
            case 'intro':
                return `
                    ${baseHeader}
                    <div class="onb-intro-visual">
                        <div class="onb-logo-showcase">
                            <div class="onb-logo-glow"></div>
                            <img src="/assets/images/logos/golden-ball.png?v=2"
                                 alt="ProductiveApp" class="onb-logo-img">
                        </div>
                        <div class="onb-welcome-name">
                            ${this.userData.name ? `Salut, <span>${this.userData.name.split(' ')[0]}</span> !` : 'Pret a commencer ?'}
                        </div>
                    </div>
                    <div class="onb-actions">
                        <button class="onb-btn primary" onclick="OnboardingRevolution.nextStep()">
                            <span>Commencer l'aventure</span>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </button>
                    </div>
                `;

            case 'input':
                return `
                    ${baseHeader}
                    <div class="onb-input-section">
                        <div class="onb-avatar-picker" id="avatar-picker">
                            <div class="onb-avatar-preview" id="avatar-preview">
                                ${this.getAvatarInitials()}
                            </div>
                            <button class="onb-avatar-change" onclick="OnboardingRevolution.cycleAvatar()">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M23 4v6h-6M1 20v-6h6"/>
                                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                                </svg>
                            </button>
                        </div>
                        <div class="onb-input-field">
                            <input type="text"
                                   id="onb-name-input"
                                   placeholder="Ton prenom ou pseudo"
                                   value="${this.userData.displayName || this.userData.name?.split(' ')[0] || ''}"
                                   onkeyup="OnboardingRevolution.updatePreview()">
                            <div class="onb-input-glow"></div>
                        </div>
                    </div>
                    <div class="onb-actions">
                        <button class="onb-btn secondary" onclick="OnboardingRevolution.prevStep()">Retour</button>
                        <button class="onb-btn primary" onclick="OnboardingRevolution.saveProfile()">Continuer</button>
                    </div>
                `;

            case 'workspace':
                return `
                    ${baseHeader}
                    <div class="onb-workspace-section">
                        <div class="onb-workspace-options">
                            <div class="onb-workspace-card" onclick="OnboardingRevolution.selectWorkspace('personal')" data-type="personal">
                                <div class="ws-card-icon">&#128187;</div>
                                <h3>Personnel</h3>
                                <p>Pour organiser ta vie et tes projets perso</p>
                                <div class="ws-card-glow"></div>
                            </div>
                            <div class="onb-workspace-card" onclick="OnboardingRevolution.selectWorkspace('team')" data-type="team">
                                <div class="ws-card-icon">&#128101;</div>
                                <h3>Equipe</h3>
                                <p>Collabore avec ton equipe sur des projets</p>
                                <div class="ws-card-glow"></div>
                            </div>
                            <div class="onb-workspace-card" onclick="OnboardingRevolution.selectWorkspace('freelance')" data-type="freelance">
                                <div class="ws-card-icon">&#128188;</div>
                                <h3>Freelance</h3>
                                <p>Gere tes clients et projets independants</p>
                                <div class="ws-card-glow"></div>
                            </div>
                        </div>
                        <div class="onb-workspace-name" id="ws-name-section" style="display: none;">
                            <label>Nom de ton workspace</label>
                            <input type="text" id="ws-name-input" placeholder="Mon Super Workspace">
                        </div>
                    </div>
                    <div class="onb-actions">
                        <button class="onb-btn secondary" onclick="OnboardingRevolution.prevStep()">Retour</button>
                        <button class="onb-btn primary" id="ws-continue-btn" onclick="OnboardingRevolution.saveWorkspace()" disabled>Continuer</button>
                    </div>
                `;

            case 'theme':
                return `
                    ${baseHeader}
                    <div class="onb-theme-section">
                        <div class="onb-theme-grid">
                            ${this.getThemeOptions()}
                        </div>
                    </div>
                    <div class="onb-actions">
                        <button class="onb-btn secondary" onclick="OnboardingRevolution.prevStep()">Retour</button>
                        <button class="onb-btn primary" onclick="OnboardingRevolution.nextStep()">Continuer</button>
                    </div>
                `;

            case 'features':
                return `
                    ${baseHeader}
                    <div class="onb-features-section">
                        <div class="onb-features-carousel" id="features-carousel">
                            <div class="feature-slide active">
                                <div class="feature-icon">&#128203;</div>
                                <h3>Taches intelligentes</h3>
                                <p>Organise, priorise et accomplis tes objectifs avec fluidite</p>
                            </div>
                            <div class="feature-slide">
                                <div class="feature-icon">&#128200;</div>
                                <h3>Projets structures</h3>
                                <p>Visualise ta progression et atteins tes milestones</p>
                            </div>
                            <div class="feature-slide">
                                <div class="feature-icon">&#128221;</div>
                                <h3>Notes connectees</h3>
                                <p>Capture tes idees et lie-les a tes projets</p>
                            </div>
                            <div class="feature-slide">
                                <div class="feature-icon">&#129302;</div>
                                <h3>IA Assistant</h3>
                                <p>Un assistant intelligent pour booster ta productivite</p>
                            </div>
                        </div>
                        <div class="onb-features-dots" id="features-dots">
                            <span class="feature-dot active" onclick="OnboardingRevolution.showFeature(0)"></span>
                            <span class="feature-dot" onclick="OnboardingRevolution.showFeature(1)"></span>
                            <span class="feature-dot" onclick="OnboardingRevolution.showFeature(2)"></span>
                            <span class="feature-dot" onclick="OnboardingRevolution.showFeature(3)"></span>
                        </div>
                    </div>
                    <div class="onb-actions">
                        <button class="onb-btn secondary" onclick="OnboardingRevolution.prevStep()">Retour</button>
                        <button class="onb-btn primary" onclick="OnboardingRevolution.nextStep()">Presque fini !</button>
                    </div>
                `;

            case 'complete':
                return `
                    ${baseHeader}
                    <div class="onb-complete-section">
                        <div class="onb-complete-visual">
                            <div class="onb-trophy">
                                <span class="trophy-icon">&#127942;</span>
                                <div class="trophy-glow"></div>
                                <div class="trophy-sparkles"></div>
                            </div>
                        </div>
                        <div class="onb-stats-preview">
                            <div class="stat-item">
                                <span class="stat-value">0</span>
                                <span class="stat-label">taches</span>
                            </div>
                            <div class="stat-divider"></div>
                            <div class="stat-item">
                                <span class="stat-value">1</span>
                                <span class="stat-label">workspace</span>
                            </div>
                            <div class="stat-divider"></div>
                            <div class="stat-item">
                                <span class="stat-value">&#8734;</span>
                                <span class="stat-label">possibilites</span>
                            </div>
                        </div>
                    </div>
                    <div class="onb-actions">
                        <button class="onb-btn primary large" onclick="OnboardingRevolution.complete()">
                            <span>Commencer a creer</span>
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                            <div class="btn-confetti"></div>
                        </button>
                    </div>
                `;

            default:
                return baseHeader;
        }
    },

    /**
     * Get avatar initials
     */
    getAvatarInitials() {
        const name = this.userData.name || 'User';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    },

    /**
     * Get theme options HTML
     */
    getThemeOptions() {
        const themes = [
            { id: 'dark', name: 'Sombre', color: '#1a1a2e', accent: '#d4af37' },
            { id: 'light', name: 'Clair', color: '#f8f9fa', accent: '#2563eb' },
            { id: 'midnight', name: 'Minuit', color: '#0f0f1a', accent: '#8b5cf6' },
            { id: 'forest', name: 'Foret', color: '#1a2f1a', accent: '#22c55e' },
            { id: 'ocean', name: 'Ocean', color: '#0c1929', accent: '#06b6d4' },
            { id: 'sunset', name: 'Sunset', color: '#2d1b1b', accent: '#f97316' }
        ];

        return themes.map(theme => `
            <div class="onb-theme-card" onclick="OnboardingRevolution.selectTheme('${theme.id}')" data-theme="${theme.id}">
                <div class="theme-preview" style="background: ${theme.color}">
                    <div class="theme-accent" style="background: ${theme.accent}"></div>
                    <div class="theme-lines">
                        <span style="background: ${theme.accent}"></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                <span class="theme-name">${theme.name}</span>
                <div class="theme-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
            </div>
        `).join('');
    },

    /**
     * Init step-specific features
     */
    initStepFeatures(step) {
        if (step.type === 'features') {
            this.startFeaturesCarousel();
        }
        if (step.type === 'complete') {
            this.startConfetti();
        }
    },

    /**
     * Start features carousel auto-rotation
     */
    startFeaturesCarousel() {
        this.featureIndex = 0;
        this.featureInterval = setInterval(() => {
            this.featureIndex = (this.featureIndex + 1) % 4;
            this.showFeature(this.featureIndex);
        }, 3000);
    },

    /**
     * Show specific feature
     */
    showFeature(index) {
        this.featureIndex = index;
        const slides = document.querySelectorAll('.feature-slide');
        const dots = document.querySelectorAll('.feature-dot');

        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    },

    /**
     * Start confetti animation
     */
    startConfetti() {
        const canvas = document.getElementById('onb-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ['#d4af37', '#f4d03f', '#ffffff', '#10b981', '#8b5cf6'];
        this.confettiParticles = [];

        for (let i = 0; i < 100; i++) {
            this.confettiParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: Math.random() * 3 + 2,
                speedX: (Math.random() - 0.5) * 2,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            this.confettiParticles.forEach(p => {
                p.y += p.speedY;
                p.x += p.speedX;
                p.rotation += p.rotationSpeed;

                if (p.y > canvas.height) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
                ctx.restore();
            });

            this.animationFrame = requestAnimationFrame(animate);
        };

        animate();
    },

    /**
     * Navigation
     */
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.render();
        }
    },

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.render();
        }
    },

    goToStep(index) {
        if (index <= this.currentStep) {
            this.currentStep = index;
            this.render();
        }
    },

    /**
     * Profile step handlers
     */
    updatePreview() {
        const input = document.getElementById('onb-name-input');
        const preview = document.getElementById('avatar-preview');
        if (input && preview) {
            const name = input.value || 'U';
            preview.textContent = name.substring(0, 2).toUpperCase();
        }
    },

    cycleAvatar() {
        const preview = document.getElementById('avatar-preview');
        if (preview) {
            const colors = ['#d4af37', '#8b5cf6', '#10b981', '#ef4444', '#06b6d4'];
            const currentBg = preview.style.background;
            const currentIndex = colors.findIndex(c => currentBg.includes(c));
            const nextIndex = (currentIndex + 1) % colors.length;
            preview.style.background = `linear-gradient(135deg, ${colors[nextIndex]}, ${colors[(nextIndex + 1) % colors.length]})`;
            this.userData.avatarColor = colors[nextIndex];
        }
    },

    saveProfile() {
        const input = document.getElementById('onb-name-input');
        if (input && input.value) {
            this.userData.displayName = input.value;
            localStorage.setItem('user_display_name', input.value);
        }
        this.nextStep();
    },

    /**
     * Workspace step handlers
     */
    selectWorkspace(type) {
        document.querySelectorAll('.onb-workspace-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.type === type);
        });

        this.userData.workspaceType = type;

        const nameSection = document.getElementById('ws-name-section');
        const continueBtn = document.getElementById('ws-continue-btn');

        if (nameSection) nameSection.style.display = 'block';
        if (continueBtn) continueBtn.disabled = false;
    },

    saveWorkspace() {
        const input = document.getElementById('ws-name-input');
        if (input && input.value) {
            this.userData.workspaceName = input.value;
        } else {
            const typeNames = {
                personal: 'Mon Espace',
                team: 'Mon Equipe',
                freelance: 'Mes Projets'
            };
            this.userData.workspaceName = typeNames[this.userData.workspaceType] || 'Mon Workspace';
        }
        this.nextStep();
    },

    /**
     * Theme step handlers
     */
    selectTheme(themeId) {
        document.querySelectorAll('.onb-theme-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.theme === themeId);
        });

        this.userData.theme = themeId;
        localStorage.setItem('preferred_theme', themeId);

        // Optionally apply theme preview
        document.documentElement.setAttribute('data-theme', themeId);
    },

    /**
     * Complete onboarding
     */
    complete() {
        // Save completion
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('onboarding_data', JSON.stringify(this.userData));

        // Cleanup
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.featureInterval) {
            clearInterval(this.featureInterval);
        }

        // Animate out
        const container = document.getElementById('onboarding-revolution');
        if (container) {
            container.classList.add('completing');
            setTimeout(() => {
                container.remove();
                window.location.reload();
            }, 800);
        }
    },

    /**
     * Skip onboarding
     */
    skip() {
        if (confirm('Es-tu sur de vouloir passer l\'introduction ?')) {
            this.complete();
        }
    },

    /**
     * Check if completed
     */
    isCompleted() {
        return localStorage.getItem('onboarding_completed') === 'true';
    },

    /**
     * Reset onboarding (for testing)
     */
    reset() {
        localStorage.removeItem('onboarding_completed');
        localStorage.removeItem('onboarding_data');
        localStorage.removeItem('user_display_name');
        console.log('[OnboardingRevolution] Reset complete');
    }
};

// Export global
if (typeof window !== 'undefined') {
    window.OnboardingRevolution = OnboardingRevolution;
}
