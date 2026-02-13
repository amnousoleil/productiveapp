/**
 * XP FEEDBACK SYSTEM
 * Système global de feedback visuel pour toutes les actions XP
 * Affiche toasts + floating numbers + met à jour la sidebar
 */

const XPFeedback = {
  // Cache du profil utilisateur
  currentProfile: null,

  /**
   * Initialise le système de feedback
   */
  async init() {
    console.log('🎮 [XPFeedback] Initializing...');
    await this.loadProfile();
  },

  /**
   * Charge le profil gamification de l'utilisateur
   */
  async loadProfile() {
    try {
      const workspaceId = ApiTokens?.getWorkspaceId?.() || localStorage.getItem('workspaceId');
      if (!workspaceId) return;

      this.currentProfile = await GamificationAPI.getProfile(workspaceId);
      console.log('✅ [XPFeedback] Profile loaded:', this.currentProfile);

      // Met à jour la sidebar XP bar
      this.updateSidebarXP();
    } catch (error) {
      console.error('❌ [XPFeedback] Failed to load profile:', error);
    }
  },

  /**
   * Action principale : enregistrer XP + afficher feedback
   * @param {string} reason - Raison XP (task_completed, note_created, etc.)
   * @param {number} amount - Montant XP (optionnel, le backend calcule)
   * @param {string} label - Label à afficher (ex: "Tâche terminée")
   */
  async recordAction(reason, amount = null, label = '') {
    try {
      const workspaceId = ApiTokens?.getWorkspaceId?.() || localStorage.getItem('workspaceId');
      if (!workspaceId) {
        console.warn('[XPFeedback] No workspace, skipping XP');
        return;
      }

      // Appel backend pour enregistrer l'XP
      const result = await GamificationAPI.recordAction(workspaceId, reason, amount);

      if (!result || !result.xpGained) {
        console.warn('[XPFeedback] No XP gained');
        return;
      }

      // Mise à jour du profil local
      const oldLevel = this.currentProfile?.level || 1;
      await this.loadProfile();
      const newLevel = this.currentProfile?.level || 1;

      // Affichage du feedback visuel
      this.showXPGain(result.xpGained, label || this.getActionLabel(reason));

      // Level up ?
      if (newLevel > oldLevel) {
        setTimeout(() => {
          this.showLevelUp(newLevel);
        }, 1500);
      }

      // Achievements débloqués ?
      if (result.achievements_unlocked && result.achievements_unlocked.length > 0) {
        setTimeout(() => {
          result.achievements_unlocked.forEach((ach, index) => {
            setTimeout(() => {
              this.showAchievementUnlock(ach);
            }, index * 3000); // Espacer de 3s si plusieurs
          });
        }, 2000);
      }

      return result;
    } catch (error) {
      console.error('❌ [XPFeedback] Error recording action:', error);
      return null;
    }
  },

  /**
   * Affiche le gain d'XP (toast + floating number)
   */
  showXPGain(amount, label) {
    // Toast notification
    if (window.Toast) {
      Toast.success(`+${amount} XP • ${label}`, {
        duration: 2500,
        position: 'top-right'
      });
    }

    // Floating XP number animation
    this.createFloatingXP(amount);
  },

  /**
   * Crée un nombre XP flottant animé
   */
  createFloatingXP(amount) {
    const xpFloat = document.createElement('div');
    xpFloat.className = 'xp-float-global';

    // Position aléatoire mais centrée
    const randomX = 40 + Math.random() * 20; // 40-60% horizontal
    const randomY = 30 + Math.random() * 20; // 30-50% vertical

    xpFloat.style.left = `${randomX}%`;
    xpFloat.style.top = `${randomY}%`;

    xpFloat.innerHTML = `
      <span class="xp-value">+${amount}</span>
      <span class="xp-icon">⚡</span>
    `;

    document.body.appendChild(xpFloat);

    // Auto-remove après animation
    setTimeout(() => xpFloat.remove(), 2500);
  },

  /**
   * Affiche l'animation de level up
   */
  showLevelUp(newLevel) {
    // Confetti si disponible
    if (window.confetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Toast spécial
    if (window.Toast) {
      Toast.success(`🎉 NIVEAU ${newLevel} ATTEINT !`, {
        duration: 5000,
        position: 'top-center'
      });
    }

    // Modal fullscreen level up (optionnel, pour plus tard)
    // this.showLevelUpModal(newLevel);
  },

  /**
   * Affiche le déblocage d'achievement avec animation premium (Quick Win #4)
   * @param {Object} achievement - Achievement débloqué
   */
  showAchievementUnlock(achievement) {
    console.log('🏆 [XPFeedback] Achievement unlocked:', achievement);

    const name = achievement.name || 'Nouveau succès';
    const description = achievement.description || '';
    const icon = achievement.icon || '🏆';
    const rarity = achievement.rarity || 'common';
    const xpReward = achievement.xp_reward || achievement.xpReward || 0;
    const coinReward = achievement.coin_reward || achievement.coinReward || 0;

    // Créer modal fullscreen
    const modal = document.createElement('div');
    modal.className = `achievement-unlock-modal rarity-${rarity}`;
    modal.innerHTML = `
      <div class="achievement-unlock-overlay"></div>
      <div class="achievement-unlock-content">
        <div class="achievement-rays"></div>
        <div class="achievement-glow"></div>
        <div class="achievement-icon-container">
          <div class="achievement-icon">${icon}</div>
        </div>
        <h1 class="achievement-unlock-title">Achievement Débloqué !</h1>
        <h2 class="achievement-name">${name}</h2>
        <p class="achievement-description">${description}</p>
        <div class="achievement-rarity-badge rarity-${rarity}">
          ${rarity.toUpperCase()}
        </div>
        <div class="achievement-rewards">
          ${xpReward > 0 ? `<div class="reward-item"><span class="reward-icon">⚡</span><span class="reward-value">+${xpReward} XP</span></div>` : ''}
          ${coinReward > 0 ? `<div class="reward-item"><span class="reward-icon">💰</span><span class="reward-value">+${coinReward} Coins</span></div>` : ''}
        </div>
        <button class="achievement-close-btn" onclick="this.closest('.achievement-unlock-modal').remove()">
          Continuer
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Animation d'entrée
    setTimeout(() => modal.classList.add('visible'), 50);

    // Confetti basé sur la rareté
    if (window.confetti) {
      const confettiConfig = {
        common: { particleCount: 50, spread: 60 },
        rare: { particleCount: 100, spread: 70 },
        epic: { particleCount: 200, spread: 90 },
        legendary: { particleCount: 300, spread: 120 }
      };

      const config = confettiConfig[rarity] || confettiConfig.common;

      setTimeout(() => {
        confetti({
          ...config,
          origin: { y: 0.6 },
          colors: this.getRarityColors(rarity)
        });
      }, 400);

      // Double confetti pour legendary
      if (rarity === 'legendary') {
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.7 },
            colors: ['#f59e0b', '#ef4444', '#8b5cf6']
          });
        }, 800);
      }
    }

    // Toast de backup
    if (window.Toast) {
      Toast.success(`🏆 ${name}`, {
        duration: 4000,
        position: 'top-center'
      });
    }

    // Auto-close après 6s
    setTimeout(() => {
      modal.classList.remove('visible');
      setTimeout(() => modal.remove(), 500);
    }, 6000);
  },

  /**
   * Retourne les couleurs selon la rareté
   */
  getRarityColors(rarity) {
    const colors = {
      common: ['#9ca3af', '#d1d5db', '#ffffff'],
      rare: ['#3b82f6', '#60a5fa', '#93c5fd'],
      epic: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
      legendary: ['#f59e0b', '#fbbf24', '#fcd34d', '#ef4444']
    };
    return colors[rarity] || colors.common;
  },

  /**
   * Affiche la célébration de connexion quotidienne (Quick Win #5)
   * @param {Object} xpResult - Résultat XP du login
   * @param {Object} streakResult - Résultat du streak
   */
  showLoginBonus(xpResult, streakResult) {
    console.log('🔥 [XPFeedback] Login bonus celebration:', { xpResult, streakResult });

    const xpGained = xpResult?.xpGained || 10;
    const currentStreak = streakResult?.current_streak || 1;
    const isNewStreak = streakResult?.is_new || false;

    // Créer overlay fullscreen
    const overlay = document.createElement('div');
    overlay.className = 'login-bonus-overlay';
    overlay.innerHTML = `
      <div class="login-bonus-content">
        <div class="login-bonus-icon">🔥</div>
        <h1 class="login-bonus-title">Connexion Quotidienne !</h1>
        <div class="login-bonus-xp">+${xpGained} XP</div>
        <div class="login-bonus-streak">
          <span class="streak-number">${currentStreak}</span>
          <span class="streak-text">${currentStreak === 1 ? 'jour' : 'jours'} consécutifs</span>
        </div>
        ${currentStreak >= 7 ? '<div class="login-bonus-milestone">🏆 Série de 7 jours !</div>' : ''}
        ${currentStreak >= 30 ? '<div class="login-bonus-milestone legendary">💎 Série de 30 jours !</div>' : ''}
        <div class="login-bonus-next">
          ${currentStreak < 7 ? `Plus que ${7 - currentStreak} jours pour le bonus 7 jours` : ''}
          ${currentStreak >= 7 && currentStreak < 30 ? `Plus que ${30 - currentStreak} jours pour le bonus 30 jours` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animation d'entrée
    setTimeout(() => overlay.classList.add('visible'), 50);

    // Confetti si milestone
    if ((currentStreak % 7 === 0 || currentStreak === 30) && window.confetti) {
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6']
        });
      }, 300);
    }

    // Auto-close après 4s
    setTimeout(() => {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 500);
    }, 4000);

    // Cliquer pour fermer
    overlay.addEventListener('click', () => {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 500);
    });
  },

  /**
   * Met à jour la XP bar dans la sidebar
   */
  updateSidebarXP() {
    if (!this.currentProfile) return;

    const container = document.getElementById('sidebar-xp-mini');
    if (!container) {
      // Créer le container si n'existe pas encore
      this.createSidebarXP();
      return;
    }

    // Calcul de la progression
    const currentLevel = this.currentProfile.level || 1;
    const currentXP = this.currentProfile.xp || 0;
    const currentLevelXP = this.getCurrentLevelXP(currentLevel);
    const nextLevelXP = this.getNextLevelXP(currentLevel);
    const xpInLevel = currentXP - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;
    const progressPercent = Math.min(100, (xpInLevel / xpNeeded) * 100);

    // Mise à jour de la barre
    const fillBar = container.querySelector('.xp-bar-fill-mini');
    if (fillBar) {
      fillBar.style.width = `${progressPercent}%`;
    }

    // Mise à jour du texte
    const textEl = container.querySelector('.xp-text-mini');
    if (textEl) {
      textEl.textContent = `Niveau ${currentLevel} • ${xpInLevel.toLocaleString()}/${xpNeeded.toLocaleString()} XP`;
    }

    // Tooltip : prochaine récompense
    const xpToNext = xpNeeded - xpInLevel;
    container.title = `Plus que ${xpToNext.toLocaleString()} XP pour le niveau ${currentLevel + 1} !`;
  },

  /**
   * Crée la XP bar dans la sidebar (Quick Win #2)
   */
  createSidebarXP() {
    // Cherche le user badge dans la sidebar
    const sidebar = document.querySelector('.sidebar-header') || document.querySelector('.sidebar');
    if (!sidebar) {
      console.warn('[XPFeedback] Sidebar not found, will retry later');
      return;
    }

    // Crée le container XP mini
    const xpContainer = document.createElement('div');
    xpContainer.id = 'sidebar-xp-mini';
    xpContainer.className = 'sidebar-xp-mini';
    xpContainer.innerHTML = `
      <div class="xp-bar-mini">
        <div class="xp-bar-fill-mini" style="width: 0%"></div>
      </div>
      <div class="xp-text-mini">Niveau 1 • 0/100 XP</div>
    `;

    // Insère après le user badge ou au début de la sidebar
    const userBadge = sidebar.querySelector('.user-badge') || sidebar.querySelector('.sidebar-user');
    if (userBadge) {
      userBadge.after(xpContainer);
    } else {
      sidebar.prepend(xpContainer);
    }

    // Force update immédiatement
    setTimeout(() => this.updateSidebarXP(), 100);
  },

  /**
   * Calcule l'XP requise pour le niveau actuel (début)
   */
  getCurrentLevelXP(level) {
    if (level === 1) return 0;
    return Math.floor(100 * Math.pow(1.15, level - 1));
  },

  /**
   * Calcule l'XP requise pour le prochain niveau
   */
  getNextLevelXP(level) {
    return Math.floor(100 * Math.pow(1.15, level));
  },

  /**
   * Retourne un label français pour chaque type d'action
   */
  getActionLabel(reason) {
    const labels = {
      'task_created': 'Tâche créée',
      'task_completed': 'Tâche terminée',
      'note_created': 'Note créée',
      'note_updated': 'Note mise à jour',
      'project_created': 'Projet créé',
      'message_sent': 'Message envoyé',
      'login_bonus': 'Connexion quotidienne',
      'streak_bonus': 'Bonus de série',
      'achievement': 'Achievement débloqué',
      'daily_goal': 'Objectif du jour',
      'weekly_goal': 'Objectif de la semaine',
      'pomodoro_completed': 'Pomodoro terminé'
    };
    return labels[reason] || 'Action effectuée';
  }
};

// Auto-init quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => XPFeedback.init());
} else {
  XPFeedback.init();
}

// Export global
window.XPFeedback = XPFeedback;
