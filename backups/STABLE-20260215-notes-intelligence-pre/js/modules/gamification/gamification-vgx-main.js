/**
 * GAMIFICATION VGX - MAIN CONTROLLER
 * Contrôleur principal pour ProductiveApp: Legends
 * Remplace gamification-view.js avec l'expérience VGX
 */

const GamificationVGXMain = {
  initialized: false,
  currentView: 'hero', // hero, quests, map, boss, shop, skills, guild

  async init() {
    if (this.initialized) return;

    console.log('🎮 [VGX] Initializing ProductiveApp: Legends...');

    // Charger tous les modules
    await this.initModules();

    // Rendre la vue hero par défaut
    await this.renderHero();

    this.initialized = true;
    console.log('✅ [VGX] ProductiveApp: Legends ready!');
  },

  async initModules() {
    // Init Hero Dashboard
    if (window.GamificationVGXHero) {
      await GamificationVGXHero.init();
    }

    // Init Quest System
    if (window.GamificationVGXQuests) {
      await GamificationVGXQuests.init();
    }

    // Init other modules when they load
    if (window.GamificationVGXMap) await GamificationVGXMap.init();
    if (window.GamificationVGXBoss) await GamificationVGXBoss.init();
    if (window.GamificationVGXShop) await GamificationVGXShop.init();
    if (window.GamificationVGXSkills) await GamificationVGXSkills.init();
    if (window.GamificationVGXGuild) await GamificationVGXGuild.init();
  },

  async renderHero() {
    this.currentView = 'hero';
    const container = document.getElementById('view-gamification');
    if (!container) {
      console.error('❌ [VGX] Container #view-gamification not found');
      return;
    }

    container.innerHTML = `
      <div class="vgx-main-container">
        <!-- Header avec navigation -->
        <div class="vgx-header">
          <h1 class="vgx-title">
            <span class="vgx-logo">👑</span>
            ProductiveApp: Legends
          </h1>
          <div class="vgx-header-actions">
            <button class="vgx-header-btn" onclick="GamificationVGXMain.toggleView('classic')">
              <span>📊</span> Vue Classique
            </button>
            <button class="vgx-header-btn" onclick="GamificationVGXMain.refresh()">
              <span>🔄</span> Actualiser
            </button>
          </div>
        </div>

        <!-- Hero Dashboard -->
        <div id="vgx-hero-dashboard"></div>
      </div>
    `;

    // Rendre le hero dashboard
    if (window.GamificationVGXHero) {
      await GamificationVGXHero.render();
    }
  },

  toggleView(view) {
    if (view === 'classic') {
      // Basculer vers la vue classique
      this.renderClassicView();
    } else {
      this.renderHero();
    }
  },

  renderClassicView() {
    const container = document.getElementById('view-gamification');
    if (!container) return;

    container.innerHTML = `
      <div class="vgx-classic-container">
        <div class="vgx-classic-header">
          <h2>Vue Classique - Gamification</h2>
          <button class="vgx-header-btn" onclick="GamificationVGXMain.toggleView('vgx')">
            <span>🎮</span> Retour au Mode Jeu
          </button>
        </div>
        <p style="padding: 20px; color: var(--text-muted);">
          Vue classique de la gamification. Utilisez le bouton ci-dessus pour retourner à l'expérience VGX immersive.
        </p>
        <!-- Intégrer ici l'ancien gamification-view si besoin -->
        <div id="classic-gamification-content"></div>
      </div>
    `;

    // Charger l'ancien système si disponible
    if (window.GamificationView) {
      GamificationView.render('classic-gamification-content');
    }
  },

  async refresh() {
    console.log('🔄 [VGX] Refreshing...');

    // Refresh hero profile
    if (window.GamificationVGXHero) {
      await GamificationVGXHero.refresh();
    }

    Toast?.success?.('Données mises à jour !');
  },

  // Hooks pour mettre à jour les quêtes depuis d'autres modules
  onTaskCompleted() {
    if (window.GamificationVGXQuests) {
      GamificationVGXQuests.updateQuestProgress('complete_tasks', 1);
      GamificationVGXQuests.updateQuestProgress('complete_tasks_daily', 1);
    }
  },

  onNoteCreated() {
    if (window.GamificationVGXQuests) {
      GamificationVGXQuests.updateQuestProgress('create_notes', 1);
    }
  },

  onProjectCreated() {
    if (window.GamificationVGXQuests) {
      GamificationVGXQuests.updateQuestProgress('create_project', 1);
    }
  },

  onAchievementUnlocked() {
    if (window.GamificationVGXQuests) {
      GamificationVGXQuests.updateQuestProgress('unlock_achievements', 1);
    }
  },

  onLevelUp(newLevel) {
    if (window.GamificationVGXQuests) {
      GamificationVGXQuests.updateQuestProgress('reach_level', newLevel);
    }

    // Afficher animation level up
    this.showLevelUpAnimation(newLevel);
  },

  showLevelUpAnimation(level) {
    const overlay = document.createElement('div');
    overlay.className = 'vgx-levelup-effect';
    overlay.innerHTML = `
      <div class="vgx-levelup-content">
        <h1 class="vgx-levelup-title">🌟 NIVEAU ${level} 🌟</h1>
        <p class="vgx-levelup-subtitle">Nouveau niveau atteint !</p>
        <div class="vgx-levelup-rays"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Son de level up (si disponible)
    this.playSound('levelup');

    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
    }, 3000);
  },

  playSound(soundName) {
    // TODO: Implémenter sons
    console.log(`🔊 [VGX] Playing sound: ${soundName}`);
  },

  // Gestion des événements XP
  onXPGained(amount, source) {
    // Afficher XP gain flottant
    this.showFloatingXP(amount);

    // Mettre à jour le hero dashboard
    if (window.GamificationVGXHero) {
      setTimeout(() => GamificationVGXHero.refresh(), 500);
    }
  },

  showFloatingXP(amount) {
    const xpFloat = document.createElement('div');
    xpFloat.className = 'vgx-xp-float';
    xpFloat.textContent = `+${amount} XP`;
    xpFloat.style.left = `${Math.random() * 80 + 10}%`;
    xpFloat.style.top = `${Math.random() * 50 + 25}%`;

    document.body.appendChild(xpFloat);

    setTimeout(() => xpFloat.remove(), 2000);
  }
};

// Export global
window.GamificationVGXMain = GamificationVGXMain;

// Auto-init quand on arrive sur la vue gamification
document.addEventListener('DOMContentLoaded', () => {
  // Observer pour détecter quand #view-gamification devient active
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const target = mutation.target;
        if (target.id === 'view-gamification' && target.classList.contains('active')) {
          console.log('🎮 [VGX] Gamification view activated');
          GamificationVGXMain.init();
        }
      }
    });
  });

  const gamificationView = document.getElementById('view-gamification');
  if (gamificationView) {
    observer.observe(gamificationView, { attributes: true });

    // Si déjà active au chargement
    if (gamificationView.classList.contains('active')) {
      GamificationVGXMain.init();
    }
  }
});
