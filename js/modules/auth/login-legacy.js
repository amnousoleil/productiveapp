// =============================================
// PRODUCTIVEAPP - LOGIN LEGACY UI
// Belle page avec avatars et animations particules
// À réintégrer après tests API
// =============================================

const LoginLegacy = {
    /**
     * Render la grille de sélection utilisateur avec avatars
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
     */
    selectUser(userId) {
        const user = AppConfig.USERS.find(u => u.id === userId);
        if (!user) return;

        AppState.currentUser = user;
        document.getElementById('login-username').textContent = `${user.avatar} ${user.name}`;
        document.getElementById('user-select-grid').classList.add('hidden');
        document.getElementById('password-form').classList.remove('hidden');
        document.getElementById('login-password').focus();
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

            if (index < 0) index = buttons.length - 1;
            if (index >= buttons.length) index = 0;
            currentProfileIndex = index;

            buttons.forEach((btn, i) => {
                if (i === index) {
                    btn.style.display = 'flex';
                    btn.style.opacity = '1';
                    btn.style.transform = 'scale(1.1)';
                    btn.style.animation = 'none';
                    btn.offsetHeight;

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
            prevBtn.addEventListener('click', () => showProfile(currentProfileIndex - 1, 'left'));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => showProfile(currentProfileIndex + 1, 'right'));
        }

        setTimeout(() => showProfile(0), 3000);
    },

    /**
     * HTML template pour l'écran de login legacy
     */
    getTemplate() {
        return `
        <div id="login-screen-legacy" class="login-screen">
            <div class="login-container">
                <img src="https://d1yei2z3i6k35z.cloudfront.net/15127401/69726e0a0f7c4_ChatGPTImage29d%C3%A9c.202514_44_011.png" alt="Logo" class="login-logo">
                <h1>ProductiveApp</h1>
                <p>Sélectionne ton profil</p>

                <div class="user-carousel">
                    <button class="carousel-arrow carousel-prev" id="carousel-prev">‹</button>
                    <div class="user-select-grid" id="user-select-grid"></div>
                    <button class="carousel-arrow carousel-next" id="carousel-next">›</button>
                </div>

                <div class="login-form hidden" id="password-form">
                    <p id="login-username"></p>
                    <input type="password" id="login-password" placeholder="Mot de passe...">
                    <button id="login-btn">Entrer</button>
                    <button id="back-btn" class="btn-secondary">← Retour</button>
                </div>

                <p id="login-error" class="error-text"></p>
            </div>
        </div>
        `;
    }
};

if (typeof window !== 'undefined') {
    window.LoginLegacy = LoginLegacy;
}
