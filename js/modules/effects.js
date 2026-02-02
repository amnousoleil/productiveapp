// =============================================
// PRODUCTIVEAPP - EFFECTS MODULE
// Effets visuels et animations
// =============================================

const Effects = {
    /**
     * Crée les bulles de feu traversantes (écran de login)
     */
    createFireBubbles() {
        const loginScreen = Utils.$('login-screen');
        if (!loginScreen) return;

        let container = document.querySelector('.fire-bubbles-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'fire-bubbles-container';
            loginScreen.appendChild(container);
        }

        const fireColors = [
            'radial-gradient(circle, #00d4ff 0%, #0099cc 50%, #006699 100%)',
            'radial-gradient(circle, #9966ff 0%, #7733ff 50%, #5500cc 100%)',
            'radial-gradient(circle, #cc66ff 0%, #9933ff 50%, #6600cc 100%)',
            'radial-gradient(circle, #66ccff 0%, #3399ff 50%, #0066cc 100%)',
            'radial-gradient(circle, #bf7fff 0%, #9933ff 50%, #7700cc 100%)'
        ];

        const spawnFireBubble = () => {
            if (loginScreen.classList.contains('hidden')) return;

            const bubble = document.createElement('div');
            bubble.className = 'fire-bubble';

            const size = 15 + Math.random() * 35;
            bubble.style.width = size + 'px';
            bubble.style.height = size + 'px';
            bubble.style.top = (10 + Math.random() * 80) + '%';
            bubble.style.background = fireColors[Math.floor(Math.random() * fireColors.length)];

            const isBlue = Math.random() > 0.5;
            const glowColor = isBlue ? 'rgba(0, 150, 255, 0.7)' : 'rgba(150, 50, 255, 0.7)';
            const glowColor2 = isBlue ? 'rgba(0, 100, 200, 0.4)' : 'rgba(100, 0, 200, 0.4)';
            bubble.style.boxShadow = `0 0 ${size/2}px ${glowColor}, 0 0 ${size}px ${glowColor2}, 0 0 ${size*1.5}px ${glowColor2}`;

            const goRight = Math.random() > 0.5;
            bubble.style.left = goRight ? '0' : 'auto';
            bubble.style.right = goRight ? 'auto' : '0';
            bubble.style.animationName = goRight ? 'fireBubbleTraverse' : 'fireBubbleTraverseReverse';

            const duration = 6 + Math.random() * 8;
            bubble.style.animationDuration = duration + 's';

            container.appendChild(bubble);
            setTimeout(() => bubble.remove(), duration * 1000);
        };

        setInterval(spawnFireBubble, 800);
        for (let i = 0; i < 5; i++) {
            setTimeout(spawnFireBubble, i * 300);
        }
    },

    /**
     * Initialise les particules de souffle de feu (autour des avatars)
     */
    initFireBreathParticles() {
        const containers = document.querySelectorAll('.fire-breath-container');
        if (containers.length === 0) return;

        const fireColors = [
            '#ffd700', '#ffaa00', '#ff8c00', '#ff6b35',
            '#ff4500', '#ff6347', '#ffb300', '#fff176'
        ];

        const createBreathWave = (container) => {
            const particleCount = 8 + Math.floor(Math.random() * 6);
            const startAngle = Math.random() * 360;

            for (let i = 0; i < particleCount; i++) {
                setTimeout(() => {
                    this.createBreathParticle(container, startAngle + (i * 15), fireColors);
                }, i * 40);
            }
        };

        const breathCycle = () => {
            containers.forEach(container => {
                const btn = container.closest('.user-select-btn');
                if (btn && btn.style.display !== 'none') {
                    createBreathWave(container);
                }
            });
        };

        setTimeout(() => {
            breathCycle();
            setInterval(breathCycle, 2500);
        }, 4500);
    },

    /**
     * Crée une particule de souffle
     */
    createBreathParticle(container, startAngle, colors) {
        const particle = document.createElement('div');
        particle.className = 'breath-particle';

        const size = 3 + Math.random() * 5;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
        particle.style.boxShadow = `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}80`;

        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.transform = 'translate(-50%, -50%)';

        container.appendChild(particle);

        const duration = 1500 + Math.random() * 1000;
        const radius = 50 + Math.random() * 30;
        const rotations = 0.8 + Math.random() * 0.6;
        const angleRad = (startAngle * Math.PI) / 180;

        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / duration;

            if (progress >= 1) {
                particle.remove();
                return;
            }

            const currentAngle = angleRad + (progress * rotations * Math.PI * 2);
            const currentRadius = radius * (0.3 + progress * 0.7);
            const x = Math.cos(currentAngle) * currentRadius;
            const y = Math.sin(currentAngle) * currentRadius;

            const opacity = progress < 0.2 ? progress * 5 : (1 - progress) * 1.25;

            particle.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
            particle.style.opacity = Math.min(1, opacity);

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    },

    /**
     * Surligne les résultats de recherche
     * @param {string} query - Texte recherché
     */
    highlightSearchResults(query) {
        const bubbles = document.querySelectorAll('.bubble');
        let matchCount = 0;

        bubbles.forEach(bubble => {
            const text = bubble.textContent.toLowerCase();
            if (text.includes(query)) {
                bubble.classList.add('search-match');
                bubble.classList.remove('search-hidden');
                matchCount++;
                if (matchCount === 1) {
                    Utils.scrollTo(bubble);
                }
            } else {
                bubble.classList.remove('search-match');
                bubble.classList.add('search-hidden');
            }
        });

        Utils.$('search-count').textContent = matchCount > 0 ? matchCount : '';
    },

    /**
     * Efface les surlignages de recherche
     */
    clearSearchHighlights() {
        document.querySelectorAll('.bubble').forEach(bubble => {
            bubble.classList.remove('search-match', 'search-hidden');
        });
        Utils.$('search-count').textContent = '';
    },

    /**
     * Initialise la barre de recherche
     */
    initSearch() {
        const searchContainer = Utils.$('search-container');
        const searchToggleBtn = Utils.$('search-toggle-btn');
        const searchInput = Utils.$('search-input');

        if (!searchToggleBtn) return;

        searchToggleBtn.addEventListener('click', () => {
            searchContainer.classList.toggle('expanded');
            searchToggleBtn.classList.toggle('active');
            if (searchContainer.classList.contains('expanded')) {
                searchInput.focus();
            } else {
                searchInput.value = '';
                this.clearSearchHighlights();
            }
        });

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            if (query.length < 2) {
                this.clearSearchHighlights();
                return;
            }
            this.highlightSearchResults(query);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchContainer.classList.remove('expanded');
                searchToggleBtn.classList.remove('active');
                searchInput.value = '';
                this.clearSearchHighlights();
            }
        });
    },

    /**
     * Initialise le menu dropdown
     */
    initMenuDropdown() {
        const menuToggleBtn = Utils.$('menu-toggle-btn');
        const menuDropdown = Utils.$('menu-dropdown');

        if (!menuToggleBtn) return;

        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!menuToggleBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
                menuDropdown.classList.remove('active');
            }
        });

        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                menuDropdown.classList.remove('active');
            });
        });
    },

    /**
     * Initialise le bouton gyrophare
     */
    initGyrophare() {
        const btn = Utils.$('urgent-filter-btn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const modes = ['off', 'urgent', 'normal', 'zen'];
            const currentIndex = modes.indexOf(AppState.filters.priority);
            AppState.setFilter('priority', modes[(currentIndex + 1) % modes.length]);

            btn.classList.remove('active', 'mode-urgent', 'mode-normal', 'mode-zen');
            if (AppState.filters.priority !== 'off') {
                btn.classList.add('active', 'mode-' + AppState.filters.priority);
            }

            btn.querySelector('.gyrophare-icon').src = AppConfig.GYRO_IMAGES[AppState.filters.priority];

            Tasks.render();
        });
    },

    /**
     * Initialise le toggle de vue
     */
    initViewToggle() {
        const btn = Utils.$('view-toggle-btn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const newMode = AppState.ui.viewMode === 'columns' ? 'bubbles' : 'columns';
            AppState.setViewMode(newMode);

            const columnsView = Utils.$('columns-view');
            const bubblesView = Utils.$('bubbles-view');

            if (newMode === 'columns') {
                columnsView.classList.remove('hidden');
                bubblesView.classList.add('hidden');
                btn.textContent = '📊';
                btn.title = 'Mode Simple (2 colonnes)';
            } else {
                columnsView.classList.add('hidden');
                bubblesView.classList.remove('hidden');
                btn.textContent = '📋';
                btn.title = 'Mode Workflow (3 colonnes)';
            }

            Tasks.render();
        });
    },

    /**
     * Met à jour l'affichage du mode de vue
     */
    updateViewMode() {
        const columnsView = Utils.$('columns-view');
        const bubblesView = Utils.$('bubbles-view');
        const toggleBtn = Utils.$('view-toggle-btn');

        if (AppState.ui.viewMode === 'columns') {
            columnsView?.classList.remove('hidden');
            bubblesView?.classList.add('hidden');
            if (toggleBtn) {
                toggleBtn.textContent = '📊';
                toggleBtn.title = 'Mode Simple (2 colonnes)';
            }
        } else {
            columnsView?.classList.add('hidden');
            bubblesView?.classList.remove('hidden');
            if (toggleBtn) {
                toggleBtn.textContent = '📋';
                toggleBtn.title = 'Mode Workflow (3 colonnes)';
            }
        }
    }
};

// Exposer globalement
window.Effects = Effects;
window.highlightSearchResults = (query) => Effects.highlightSearchResults(query);
window.clearSearchHighlights = () => Effects.clearSearchHighlights();
