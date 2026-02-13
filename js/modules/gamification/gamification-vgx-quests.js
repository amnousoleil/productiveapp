/**
 * GAMIFICATION VGX - QUEST SYSTEM
 * Système de quêtes immersif avec storyline
 * ProductiveApp: Legends
 */

const GamificationVGXQuests = {
  activeQuests: [],
  completedQuests: [],
  availableQuests: [],

  // Database of quests with story
  QUEST_LIBRARY: {
    // CHAPITRE 1: L'ÉVEIL
    'awakening_1': {
      id: 'awakening_1',
      chapter: 1,
      title: '🌅 Premier Pas vers l\'Éveil',
      description: 'Votre voyage commence ici. Accomplissez votre première tâche pour montrer votre détermination.',
      story: 'Dans les terres oubliées de la Productivité, un nouveau héros émerge. Vous devez prouver votre valeur en accomplissant votre première quête...',
      objectives: [
        { type: 'complete_tasks', target: 1, current: 0, description: 'Terminer 1 tâche' }
      ],
      rewards: {
        xp: 100,
        coins: 50,
        title: 'Initié de l\'Éveil'
      },
      unlockLevel: 1,
      rarity: 'common'
    },

    'awakening_2': {
      id: 'awakening_2',
      chapter: 1,
      title: '📝 L\'Art de la Note',
      description: 'Les sages notent leurs pensées. Créez votre première note pour capturer vos idées.',
      story: 'Les anciens disent que celui qui note ses pensées possède le pouvoir de façonner la réalité...',
      objectives: [
        { type: 'create_notes', target: 1, current: 0, description: 'Créer 1 note' }
      ],
      rewards: {
        xp: 100,
        coins: 50
      },
      unlockLevel: 1,
      rarity: 'common'
    },

    'awakening_3': {
      id: 'awakening_3',
      chapter: 1,
      title: '🔥 Série Sacrée',
      description: 'La constance est la clé du pouvoir. Maintenez une série de 3 jours.',
      story: 'Le feu sacré de la motivation ne s\'éteint jamais pour ceux qui reviennent chaque jour...',
      objectives: [
        { type: 'streak_days', target: 3, current: 0, description: 'Série de 3 jours' }
      ],
      rewards: {
        xp: 200,
        coins: 100,
        badge: 'streak_initiate'
      },
      unlockLevel: 1,
      rarity: 'uncommon'
    },

    // CHAPITRE 2: L'EXPLORATION
    'exploration_1': {
      id: 'exploration_1',
      chapter: 2,
      title: '⚡ Maître des Tâches',
      description: 'Prouvez votre maîtrise en complétant 10 tâches.',
      story: 'Les légendes parlent d\'un guerrier qui accomplissait dix quêtes avant le lever du soleil...',
      objectives: [
        { type: 'complete_tasks', target: 10, current: 0, description: 'Terminer 10 tâches' }
      ],
      rewards: {
        xp: 500,
        coins: 200,
        title: 'Maître des Tâches'
      },
      unlockLevel: 5,
      rarity: 'uncommon'
    },

    'exploration_2': {
      id: 'exploration_2',
      chapter: 2,
      title: '🎯 Projet d\'Excellence',
      description: 'Créez votre premier projet pour organiser vos ambitions.',
      story: 'Les grands architectes ne construisent pas au hasard, ils planifient leurs empires...',
      objectives: [
        { type: 'create_project', target: 1, current: 0, description: 'Créer 1 projet' }
      ],
      rewards: {
        xp: 300,
        coins: 150,
        unlockFeature: 'project_templates'
      },
      unlockLevel: 5,
      rarity: 'rare'
    },

    // CHAPITRE 3: LA MAÎTRISE
    'mastery_1': {
      id: 'mastery_1',
      chapter: 3,
      title: '💎 Collectionneur d\'Exploits',
      description: 'Débloquez 5 achievements pour prouver votre polyvalence.',
      story: 'Seuls les plus grands héros collectent les exploits comme des trophées...',
      objectives: [
        { type: 'unlock_achievements', target: 5, current: 0, description: 'Débloquer 5 exploits' }
      ],
      rewards: {
        xp: 1000,
        coins: 500,
        badge: 'achievement_hunter'
      },
      unlockLevel: 15,
      rarity: 'rare'
    },

    'mastery_2': {
      id: 'mastery_2',
      chapter: 3,
      title: '🔥 Flamme Éternelle',
      description: 'Maintenez une série de 30 jours sans interruption.',
      story: 'La flamme éternelle ne s\'éteint jamais pour celui qui alimente son feu chaque jour...',
      objectives: [
        { type: 'streak_days', target: 30, current: 0, description: 'Série de 30 jours' }
      ],
      rewards: {
        xp: 2000,
        coins: 1000,
        title: 'Gardien de la Flamme',
        badge: 'eternal_flame'
      },
      unlockLevel: 15,
      rarity: 'epic'
    },

    // CHAPITRE 4: L'EXCELLENCE
    'excellence_1': {
      id: 'excellence_1',
      chapter: 4,
      title: '⚔️ Vaincre le Boss: Procrastination',
      description: 'Accomplissez 25 tâches en une journée pour vaincre le Boss de la Procrastination.',
      story: 'Le plus grand ennemi est celui qui vit en vous. Terrassez la procrastination par l\'action massive !',
      objectives: [
        { type: 'complete_tasks_daily', target: 25, current: 0, description: 'Terminer 25 tâches en 1 jour' }
      ],
      rewards: {
        xp: 5000,
        coins: 2500,
        title: 'Tueur de Procrastination',
        badge: 'boss_slayer_1',
        cosmetic: 'flaming_sword'
      },
      unlockLevel: 30,
      rarity: 'epic'
    },

    'excellence_2': {
      id: 'excellence_2',
      chapter: 4,
      title: '🌟 Ascension au Niveau 50',
      description: 'Atteignez le niveau 50 pour rejoindre l\'élite.',
      story: 'Seuls 1% des héros atteignent ce niveau de puissance. Vous êtes sur le point d\'entrer dans la légende...',
      objectives: [
        { type: 'reach_level', target: 50, current: 0, description: 'Atteindre le niveau 50' }
      ],
      rewards: {
        xp: 10000,
        coins: 5000,
        title: 'Maître de l\'Excellence',
        badge: 'level_50_master',
        skillPoints: 5
      },
      unlockLevel: 40,
      rarity: 'legendary'
    },

    // CHAPITRE 5: LA TRANSCENDANCE
    'transcendence_1': {
      id: 'transcendence_1',
      chapter: 5,
      title: '🌌 Le Pouvoir du Prestige',
      description: 'Utilisez votre premier Prestige pour transcender vos limites.',
      story: 'Les plus grands héros savent que parfois, il faut tout recommencer pour atteindre des sommets inimaginables...',
      objectives: [
        { type: 'prestige_once', target: 1, current: 0, description: 'Prestige x1' }
      ],
      rewards: {
        xp: 50000,
        coins: 10000,
        title: 'Transcendant',
        badge: 'prestige_master',
        prestigeBonus: 0.1
      },
      unlockLevel: 75,
      rarity: 'legendary'
    },

    'transcendence_2': {
      id: 'transcendence_2',
      chapter: 5,
      title: '👑 Architecte des Galaxies',
      description: 'Atteignez le niveau 100 et devenez une légende vivante.',
      story: 'Vous avez atteint l\'apogée de la productivité. Vous êtes devenu un Architecte des Galaxies, façonnant la réalité par votre volonté pure.',
      objectives: [
        { type: 'reach_level', target: 100, current: 0, description: 'Atteindre le niveau 100' }
      ],
      rewards: {
        xp: 100000,
        coins: 50000,
        title: 'Architecte des Galaxies',
        badge: 'galaxy_architect',
        skillPoints: 10,
        cosmetic: 'galaxy_crown'
      },
      unlockLevel: 90,
      rarity: 'legendary'
    }
  },

  async init() {
    console.log('📜 [VGX] Initializing Quest System...');
    await this.loadQuests();
  },

  async loadQuests() {
    // TODO: Charger depuis le backend ou localStorage
    const savedQuests = localStorage.getItem('vgx_quests');
    if (savedQuests) {
      const data = JSON.parse(savedQuests);
      this.activeQuests = data.active || [];
      this.completedQuests = data.completed || [];
    } else {
      // Démarrer avec les quêtes du chapitre 1
      this.activeQuests = [
        this.QUEST_LIBRARY['awakening_1'],
        this.QUEST_LIBRARY['awakening_2'],
        this.QUEST_LIBRARY['awakening_3']
      ];
    }

    this.updateAvailableQuests();
  },

  updateAvailableQuests() {
    const profile = window.GamificationVGXHero?.profile;
    if (!profile) return;

    const currentLevel = profile.level;

    // Filtrer les quêtes disponibles basées sur le niveau
    this.availableQuests = Object.values(this.QUEST_LIBRARY).filter(quest => {
      const isUnlocked = currentLevel >= quest.unlockLevel;
      const isNotActive = !this.activeQuests.find(q => q.id === quest.id);
      const isNotCompleted = !this.completedQuests.find(id => id === quest.id);
      return isUnlocked && isNotActive && isNotCompleted;
    });
  },

  saveQuests() {
    const data = {
      active: this.activeQuests,
      completed: this.completedQuests
    };
    localStorage.setItem('vgx_quests', JSON.stringify(data));
  },

  open() {
    const modal = this.createModal();
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('visible'), 10);
  },

  close() {
    const modal = document.getElementById('vgx-quests-modal');
    if (modal) {
      modal.classList.remove('visible');
      setTimeout(() => modal.remove(), 300);
    }
  },

  createModal() {
    const modal = document.createElement('div');
    modal.id = 'vgx-quests-modal';
    modal.className = 'vgx-modal';
    modal.innerHTML = `
      <div class="vgx-modal-overlay" onclick="GamificationVGXQuests.close()"></div>
      <div class="vgx-modal-content vgx-quests-modal">
        <div class="vgx-modal-header">
          <h2>📜 Livre des Quêtes</h2>
          <button class="vgx-modal-close" onclick="GamificationVGXQuests.close()">×</button>
        </div>

        <div class="vgx-quests-tabs">
          <button class="vgx-quest-tab active" data-tab="active">
            En Cours (${this.activeQuests.length})
          </button>
          <button class="vgx-quest-tab" data-tab="available">
            Disponibles (${this.availableQuests.length})
          </button>
          <button class="vgx-quest-tab" data-tab="completed">
            Terminées (${this.completedQuests.length})
          </button>
        </div>

        <div class="vgx-quests-content">
          <div class="vgx-quest-panel active" data-panel="active">
            ${this.renderActiveQuests()}
          </div>
          <div class="vgx-quest-panel" data-panel="available">
            ${this.renderAvailableQuests()}
          </div>
          <div class="vgx-quest-panel" data-panel="completed">
            ${this.renderCompletedQuests()}
          </div>
        </div>
      </div>
    `;

    this.attachModalEvents(modal);
    return modal;
  },

  renderActiveQuests() {
    if (this.activeQuests.length === 0) {
      return '<p class="vgx-empty-state">Aucune quête active. Consultez les quêtes disponibles !</p>';
    }

    return this.activeQuests.map(quest => this.renderQuestCard(quest, 'active')).join('');
  },

  renderAvailableQuests() {
    if (this.availableQuests.length === 0) {
      return '<p class="vgx-empty-state">Aucune quête disponible pour le moment. Continuez à progresser !</p>';
    }

    return this.availableQuests.map(quest => this.renderQuestCard(quest, 'available')).join('');
  },

  renderCompletedQuests() {
    if (this.completedQuests.length === 0) {
      return '<p class="vgx-empty-state">Aucune quête terminée. Lancez-vous dans l\'aventure !</p>';
    }

    return this.completedQuests.map(questId => {
      const quest = this.QUEST_LIBRARY[questId];
      return this.renderQuestCard(quest, 'completed');
    }).join('');
  },

  renderQuestCard(quest, status) {
    const rarityClass = `vgx-rarity-${quest.rarity}`;
    const progressPercent = this.calculateQuestProgress(quest);
    const isCompleted = status === 'completed';

    return `
      <div class="vgx-quest-card ${rarityClass} ${isCompleted ? 'completed' : ''}" data-quest-id="${quest.id}">
        <div class="vgx-quest-header">
          <div class="vgx-quest-chapter">Chapitre ${quest.chapter}</div>
          <div class="vgx-quest-rarity">${this.getRarityLabel(quest.rarity)}</div>
        </div>

        <h3 class="vgx-quest-title">${quest.title}</h3>
        <p class="vgx-quest-description">${quest.description}</p>

        ${quest.story ? `
          <div class="vgx-quest-story">
            <em>"${quest.story}"</em>
          </div>
        ` : ''}

        <div class="vgx-quest-objectives">
          ${quest.objectives.map(obj => `
            <div class="vgx-objective">
              <span class="vgx-objective-text">${obj.description}</span>
              <span class="vgx-objective-progress">${obj.current} / ${obj.target}</span>
            </div>
            <div class="vgx-objective-bar">
              <div class="vgx-objective-fill" style="width: ${(obj.current / obj.target) * 100}%"></div>
            </div>
          `).join('')}
        </div>

        <div class="vgx-quest-rewards">
          <div class="vgx-reward-label">Récompenses:</div>
          <div class="vgx-rewards-list">
            ${quest.rewards.xp ? `<span class="vgx-reward">⚡ ${quest.rewards.xp.toLocaleString()} XP</span>` : ''}
            ${quest.rewards.coins ? `<span class="vgx-reward">💎 ${quest.rewards.coins.toLocaleString()} Cristaux</span>` : ''}
            ${quest.rewards.title ? `<span class="vgx-reward">👑 Titre: ${quest.rewards.title}</span>` : ''}
            ${quest.rewards.badge ? `<span class="vgx-reward">🏆 Badge</span>` : ''}
            ${quest.rewards.skillPoints ? `<span class="vgx-reward">🌟 ${quest.rewards.skillPoints} Points de Talent</span>` : ''}
          </div>
        </div>

        ${status === 'available' ? `
          <button class="vgx-quest-accept" onclick="GamificationVGXQuests.acceptQuest('${quest.id}')">
            Accepter la Quête
          </button>
        ` : ''}

        ${status === 'active' && progressPercent >= 100 ? `
          <button class="vgx-quest-claim" onclick="GamificationVGXQuests.completeQuest('${quest.id}')">
            Réclamer les Récompenses
          </button>
        ` : ''}

        ${isCompleted ? '<div class="vgx-quest-completed-badge">✓ Terminée</div>' : ''}
      </div>
    `;
  },

  calculateQuestProgress(quest) {
    if (!quest.objectives) return 0;
    const totalProgress = quest.objectives.reduce((sum, obj) => {
      return sum + (obj.current / obj.target);
    }, 0);
    return (totalProgress / quest.objectives.length) * 100;
  },

  getRarityLabel(rarity) {
    const labels = {
      common: 'Commune',
      uncommon: 'Inhabituelle',
      rare: 'Rare',
      epic: 'Épique',
      legendary: 'Légendaire'
    };
    return labels[rarity] || rarity;
  },

  attachModalEvents(modal) {
    // Tab switching
    const tabs = modal.querySelectorAll('.vgx-quest-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;

        // Update tabs
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update panels
        const panels = modal.querySelectorAll('.vgx-quest-panel');
        panels.forEach(p => p.classList.remove('active'));
        modal.querySelector(`[data-panel="${targetTab}"]`).classList.add('active');
      });
    });
  },

  acceptQuest(questId) {
    const quest = this.QUEST_LIBRARY[questId];
    if (!quest) return;

    // Ajouter aux quêtes actives
    this.activeQuests.push({ ...quest });

    // Retirer des disponibles
    this.availableQuests = this.availableQuests.filter(q => q.id !== questId);

    this.saveQuests();
    this.close();

    Toast?.success?.(`Quête acceptée: ${quest.title}`);

    // Rouvrir pour refresh
    setTimeout(() => this.open(), 300);
  },

  completeQuest(questId) {
    const quest = this.activeQuests.find(q => q.id === questId);
    if (!quest) return;

    // Donner les récompenses
    this.grantRewards(quest.rewards);

    // Marquer comme terminée
    this.completedQuests.push(questId);
    this.activeQuests = this.activeQuests.filter(q => q.id !== questId);

    this.saveQuests();
    this.close();

    // Animation de récompense
    this.showRewardAnimation(quest);

    // Rouvrir pour refresh
    setTimeout(() => this.open(), 2000);
  },

  async grantRewards(rewards) {
    const workspaceId = State.getCurrentWorkspaceId();

    if (rewards.xp) {
      try {
        await GamificationAPI.addXP(workspaceId, 'quest_complete', rewards.xp);
        console.log(`✅ [VGX] Granted ${rewards.xp} XP`);
      } catch (error) {
        console.error('❌ [VGX] Failed to grant XP:', error);
      }
    }

    // TODO: Grant coins, titles, badges, etc.
    if (rewards.coins) {
      console.log(`💎 [VGX] Granted ${rewards.coins} coins (TODO: implement backend)`);
    }
  },

  showRewardAnimation(quest) {
    const overlay = document.createElement('div');
    overlay.className = 'vgx-reward-animation';
    overlay.innerHTML = `
      <div class="vgx-reward-popup">
        <h2>🎉 Quête Terminée !</h2>
        <h3>${quest.title}</h3>
        <div class="vgx-reward-items">
          ${quest.rewards.xp ? `<div class="vgx-reward-item">⚡ +${quest.rewards.xp.toLocaleString()} XP</div>` : ''}
          ${quest.rewards.coins ? `<div class="vgx-reward-item">💎 +${quest.rewards.coins.toLocaleString()} Cristaux</div>` : ''}
          ${quest.rewards.title ? `<div class="vgx-reward-item">👑 Nouveau Titre: ${quest.rewards.title}</div>` : ''}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => overlay.classList.add('visible'), 10);
    setTimeout(() => {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 500);
    }, 3000);
  },

  // Mise à jour de la progression des quêtes
  updateQuestProgress(type, amount = 1) {
    let updated = false;

    this.activeQuests.forEach(quest => {
      quest.objectives.forEach(obj => {
        if (obj.type === type) {
          obj.current = Math.min(obj.current + amount, obj.target);
          updated = true;
        }
      });
    });

    if (updated) {
      this.saveQuests();
      this.checkCompletions();
    }
  },

  checkCompletions() {
    this.activeQuests.forEach(quest => {
      const progress = this.calculateQuestProgress(quest);
      if (progress >= 100) {
        Toast?.success?.(`🎉 Quête terminée: ${quest.title}. Réclamez vos récompenses !`);
      }
    });
  }
};

// Export global
window.GamificationVGXQuests = GamificationVGXQuests;
