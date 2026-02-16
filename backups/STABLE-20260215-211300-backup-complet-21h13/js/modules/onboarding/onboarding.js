// =============================================
// PRODUCTIVEAPP - ONBOARDING MODULE
// Parcours d'accueil nouveaux utilisateurs
// =============================================

const OnboardingModule = {
    initialized: false,
    currentStep: 0,
    steps: [
        { id: 'welcome', title: 'Bienvenue', description: 'Decouvrez ProductiveApp' },
        { id: 'workspace', title: 'Workspace', description: 'Votre espace de travail' },
        { id: 'tasks', title: 'Taches', description: 'Gerez vos taches' },
        { id: 'projects', title: 'Projets', description: 'Organisez par projets' },
        { id: 'collaboration', title: 'Equipe', description: 'Collaborez efficacement' },
        { id: 'complete', title: 'Termine', description: 'Vous etes pret !' }
    ],

    /**
     * Initialise le module
     */
    init() {
        if (this.initialized) return;
        this.loadProgress();
        console.log('[OnboardingModule] Initialized');
        this.initialized = true;
    },

    /**
     * Charge la progression sauvegardee
     */
    loadProgress() {
        const saved = localStorage.getItem('onboarding_step');
        this.currentStep = saved ? parseInt(saved, 10) : 0;
    },

    /**
     * Sauvegarde la progression
     */
    saveProgress() {
        localStorage.setItem('onboarding_step', this.currentStep.toString());
    },

    /**
     * Passe a l'etape suivante
     */
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.saveProgress();
            this.render();
        }
    },

    /**
     * Retourne a l'etape precedente
     */
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.saveProgress();
            this.render();
        }
    },

    /**
     * Termine l'onboarding
     */
    complete() {
        localStorage.setItem('onboarding_completed', 'true');
        this.hide();
    },

    /**
     * Verifie si l'onboarding est termine
     */
    isCompleted() {
        return localStorage.getItem('onboarding_completed') === 'true';
    },

    /**
     * Affiche le modal d'onboarding
     */
    show() {
        if (this.isCompleted()) return;
        this.render();
        const modal = document.getElementById('onboarding-modal');
        if (modal) modal.classList.remove('hidden');
    },

    /**
     * Cache le modal
     */
    hide() {
        const modal = document.getElementById('onboarding-modal');
        if (modal) modal.classList.add('hidden');
    },

    /**
     * Render l'etape courante
     */
    render() {
        const step = this.steps[this.currentStep];
        const container = document.getElementById('onboarding-content');
        if (!container) return;

        container.innerHTML = `
            <div class="onboarding-step">
                <h2>${step.title}</h2>
                <p>${step.description}</p>
                <div class="onboarding-progress">
                    ${this.steps.map((s, i) => `
                        <span class="progress-dot ${i <= this.currentStep ? 'active' : ''}"></span>
                    `).join('')}
                </div>
                <div class="onboarding-actions">
                    ${this.currentStep > 0 ? '<button onclick="OnboardingModule.prevStep()">Precedent</button>' : ''}
                    ${this.currentStep < this.steps.length - 1
                        ? '<button onclick="OnboardingModule.nextStep()">Suivant</button>'
                        : '<button onclick="OnboardingModule.complete()">Terminer</button>'}
                </div>
            </div>
        `;
    }
};

// Auto-init
if (typeof window !== 'undefined') {
    window.OnboardingModule = OnboardingModule;
}
