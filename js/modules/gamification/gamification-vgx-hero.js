/**
 * GAMIFICATION VGX - HERO DASHBOARD
 * Interface principale RPG/MMO immersive
 * ProductiveApp: Legends
 */

const GamificationVGXHero = {
  profile: null,

  async init() {
    console.log('🎮 [VGX] Initializing Hero Dashboard...');
    await this.loadProfile();
    this.render();
  },

  async loadProfile() {
    try {
      const workspaceId = State.getCurrentWorkspaceId();
      this.profile = await GamificationAPI.getProfile(workspaceId);
      console.log('🎮 [VGX] Profile loaded:', this.profile);
    } catch (error) {
      console.error('❌ [VGX] Failed to load profile:', error);
      Toast?.error?.('Impossible de charger votre profil');
    }
  },

  render() {
    const container = document.getElementById('vgx-hero-dashboard');
    if (!container) {
      console.warn('⚠️ [VGX] Container not found');
      return;
    }

    if (!this.profile) {
      container.innerHTML = this.renderLoading();
      return;
    }

    container.innerHTML = this.renderHeroDashboard();
    this.attachEvents();
    this.startAnimations();
  },

  renderLoading() {
    return `
      <div class="vgx-loading">
        <div class="vgx-loading-spinner"></div>
        <p>Chargement de votre héros...</p>
      </div>
    `;
  },

  renderHeroDashboard() {
    const { profile } = this;
    const levelProgress = this.calculateLevelProgress(profile.xp, profile.level);
    const nextLevelXP = this.getNextLevelXP(profile.level);
    const currentLevelXP = this.getCurrentLevelXP(profile.level);
    const xpInLevel = profile.xp - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;
    const progressPercent = (xpInLevel / xpNeeded) * 100;

    return `
      <div class="vgx-hero-container">
        <!-- CHARACTER DISPLAY -->
        <div class="vgx-hero-character">
          <div class="vgx-hero-avatar-frame">
            <div class="vgx-hero-avatar-glow ${this.getRarityClass(profile.level)}"></div>
            <div class="vgx-hero-avatar" style="background-image: url('${this.getHeroAvatar(profile)}')">
              ${profile.avatar_url ? '' : '<div class="vgx-hero-avatar-placeholder">👤</div>'}
            </div>
            <div class="vgx-hero-level-badge">${profile.level}</div>
          </div>

          <div class="vgx-hero-info">
            <h2 class="vgx-hero-name">${this.getHeroName(profile)}</h2>
            <p class="vgx-hero-title">${this.getHeroTitle(profile.level)}</p>
            <div class="vgx-hero-phase">${this.getPhase(profile.level)}</div>
          </div>
        </div>

        <!-- STATS PANEL -->
        <div class="vgx-hero-stats">
          <div class="vgx-stat-card">
            <div class="vgx-stat-icon">⚡</div>
            <div class="vgx-stat-content">
              <div class="vgx-stat-label">Puissance</div>
              <div class="vgx-stat-value">${profile.xp.toLocaleString()}</div>
            </div>
          </div>

          <div class="vgx-stat-card">
            <div class="vgx-stat-icon">🔥</div>
            <div class="vgx-stat-content">
              <div class="vgx-stat-label">Série</div>
              <div class="vgx-stat-value">${profile.current_streak || 0} jours</div>
            </div>
          </div>

          <div class="vgx-stat-card">
            <div class="vgx-stat-icon">🏆</div>
            <div class="vgx-stat-content">
              <div class="vgx-stat-label">Exploits</div>
              <div class="vgx-stat-value">${profile.badges_earned || 0}</div>
            </div>
          </div>

          <div class="vgx-stat-card">
            <div class="vgx-stat-icon">💎</div>
            <div class="vgx-stat-content">
              <div class="vgx-stat-label">Cristaux</div>
              <div class="vgx-stat-value">${profile.coins || 0}</div>
            </div>
          </div>
        </div>

        <!-- XP BAR -->
        <div class="vgx-xp-container">
          <div class="vgx-xp-label">
            <span>Niveau ${profile.level}</span>
            <span>${xpInLevel.toLocaleString()} / ${xpNeeded.toLocaleString()} XP</span>
          </div>
          <div class="vgx-xp-bar-bg">
            <div class="vgx-xp-bar-fill" style="width: ${progressPercent}%">
              <div class="vgx-xp-bar-shine"></div>
            </div>
            <div class="vgx-xp-particles" id="vgx-xp-particles"></div>
          </div>
        </div>

        <!-- QUICK ACTIONS -->
        <div class="vgx-quick-actions">
          <button class="vgx-action-btn vgx-action-quests" data-action="quests">
            <span class="vgx-action-icon">📜</span>
            <span class="vgx-action-label">Quêtes</span>
            <span class="vgx-action-badge">${this.getActiveQuestsCount()}</span>
          </button>

          <button class="vgx-action-btn vgx-action-map" data-action="map">
            <span class="vgx-action-icon">🗺️</span>
            <span class="vgx-action-label">Carte du Monde</span>
          </button>

          <button class="vgx-action-btn vgx-action-boss" data-action="boss">
            <span class="vgx-action-icon">⚔️</span>
            <span class="vgx-action-label">Boss Battle</span>
            ${this.hasBossAvailable() ? '<span class="vgx-action-pulse"></span>' : ''}
          </button>

          <button class="vgx-action-btn vgx-action-shop" data-action="shop">
            <span class="vgx-action-icon">🛒</span>
            <span class="vgx-action-label">Boutique</span>
          </button>

          <button class="vgx-action-btn vgx-action-skills" data-action="skills">
            <span class="vgx-action-icon">🌟</span>
            <span class="vgx-action-label">Talents</span>
            ${this.hasSkillPoints() ? '<span class="vgx-action-badge">!</span>' : ''}
          </button>

          <button class="vgx-action-btn vgx-action-guild" data-action="guild">
            <span class="vgx-action-icon">🛡️</span>
            <span class="vgx-action-label">Guilde</span>
          </button>
        </div>

        <!-- RECENT ACTIVITIES -->
        <div class="vgx-recent-activities">
          <h3>📰 Activités Récentes</h3>
          <div class="vgx-activities-list" id="vgx-activities-list">
            ${this.renderRecentActivities()}
          </div>
        </div>
      </div>
    `;
  },

  getHeroName(profile) {
    // Utilise le nom du membre actuel
    const member = State.getCurrentMember();
    return member?.name || profile.email?.split('@')[0] || 'Héros';
  },

  getHeroAvatar(profile) {
    const member = State.getCurrentMember();
    return member?.avatar || profile.avatar_url || '';
  },

  getHeroTitle(level) {
    if (level >= 100) return '🌟 Architecte des Galaxies';
    if (level >= 76) return '✨ Transcendant';
    if (level >= 51) return '💎 Maître de l\'Excellence';
    if (level >= 26) return '🔥 Champion de la Maîtrise';
    if (level >= 11) return '⚡ Explorateur Éveillé';
    return '🌱 Novice en Éveil';
  },

  getPhase(level) {
    if (level >= 100) return 'Phase: Architecte 🏛️';
    if (level >= 76) return 'Phase: Transcendance 🌌';
    if (level >= 51) return 'Phase: Excellence 💫';
    if (level >= 26) return 'Phase: Maîtrise 🎯';
    if (level >= 11) return 'Phase: Exploration 🧭';
    return 'Phase: Éveil 🌅';
  },

  getRarityClass(level) {
    if (level >= 100) return 'vgx-rarity-legendary';
    if (level >= 76) return 'vgx-rarity-epic';
    if (level >= 51) return 'vgx-rarity-rare';
    if (level >= 26) return 'vgx-rarity-uncommon';
    return 'vgx-rarity-common';
  },

  getNextLevelXP(level) {
    // Formule: 100 * (1.15 ^ level)
    return Math.floor(100 * Math.pow(1.15, level));
  },

  getCurrentLevelXP(level) {
    if (level === 1) return 0;
    return Math.floor(100 * Math.pow(1.15, level - 1));
  },

  calculateLevelProgress(xp, level) {
    const currentLevelXP = this.getCurrentLevelXP(level);
    const nextLevelXP = this.getNextLevelXP(level);
    const xpInLevel = xp - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;
    return (xpInLevel / xpNeeded) * 100;
  },

  getActiveQuestsCount() {
    // TODO: Implémenter le système de quêtes
    return 3; // Placeholder
  },

  hasBossAvailable() {
    // TODO: Vérifier si un boss est disponible
    return this.profile?.level >= 10;
  },

  hasSkillPoints() {
    // TODO: Vérifier si des points de talent sont disponibles
    return this.profile?.level >= 5;
  },

  renderRecentActivities() {
    // TODO: Récupérer les vraies activités récentes
    const activities = [
      { icon: '⚡', text: 'Tâche "Design UI" terminée', xp: '+50 XP', time: 'Il y a 5min' },
      { icon: '🔥', text: 'Série de 7 jours maintenue', xp: '+100 XP', time: 'Il y a 1h' },
      { icon: '🏆', text: 'Exploit débloqué: "Productif"', xp: '+200 XP', time: 'Il y a 2h' },
    ];

    return activities.map(activity => `
      <div class="vgx-activity-item">
        <span class="vgx-activity-icon">${activity.icon}</span>
        <span class="vgx-activity-text">${activity.text}</span>
        <span class="vgx-activity-xp">${activity.xp}</span>
        <span class="vgx-activity-time">${activity.time}</span>
      </div>
    `).join('');
  },

  attachEvents() {
    // Quick action buttons
    const actionButtons = document.querySelectorAll('.vgx-action-btn');
    actionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleAction(action);
      });
    });
  },

  handleAction(action) {
    console.log(`🎮 [VGX] Action: ${action}`);

    switch (action) {
      case 'quests':
        this.openQuests();
        break;
      case 'map':
        this.openMap();
        break;
      case 'boss':
        this.openBoss();
        break;
      case 'shop':
        this.openShop();
        break;
      case 'skills':
        this.openSkills();
        break;
      case 'guild':
        this.openGuild();
        break;
      default:
        Toast?.info?.(`Section "${action}" en cours de développement...`);
    }
  },

  openQuests() {
    if (window.GamificationVGXQuests) {
      GamificationVGXQuests.open();
    } else {
      Toast?.info?.('Système de quêtes bientôt disponible...');
    }
  },

  openMap() {
    if (window.GamificationVGXMap) {
      GamificationVGXMap.open();
    } else {
      Toast?.info?.('Carte du monde bientôt disponible...');
    }
  },

  openBoss() {
    if (window.GamificationVGXBoss) {
      GamificationVGXBoss.open();
    } else {
      Toast?.info?.('Boss battles bientôt disponibles...');
    }
  },

  openShop() {
    if (window.GamificationVGXShop) {
      GamificationVGXShop.open();
    } else {
      Toast?.info?.('Boutique bientôt disponible...');
    }
  },

  openSkills() {
    if (window.GamificationVGXSkills) {
      GamificationVGXSkills.open();
    } else {
      Toast?.info?.('Arbre de talents bientôt disponible...');
    }
  },

  openGuild() {
    if (window.GamificationVGXGuild) {
      GamificationVGXGuild.open();
    } else {
      Toast?.info?.('Système de guildes bientôt disponible...');
    }
  },

  startAnimations() {
    // Particules XP
    this.animateXPParticles();

    // Glow de l'avatar
    this.animateAvatarGlow();
  },

  animateXPParticles() {
    const container = document.getElementById('vgx-xp-particles');
    if (!container) return;

    setInterval(() => {
      const particle = document.createElement('div');
      particle.className = 'vgx-xp-particle';
      particle.style.left = `${Math.random() * 100}%`;
      container.appendChild(particle);

      setTimeout(() => particle.remove(), 2000);
    }, 500);
  },

  animateAvatarGlow() {
    const glow = document.querySelector('.vgx-hero-avatar-glow');
    if (!glow) return;

    // Pulsation du glow
    setInterval(() => {
      glow.style.transform = 'scale(1.1)';
      setTimeout(() => {
        glow.style.transform = 'scale(1)';
      }, 1000);
    }, 2000);
  },

  async refresh() {
    await this.loadProfile();
    this.render();
  }
};

// Export global
window.GamificationVGXHero = GamificationVGXHero;
