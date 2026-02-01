// =============================================
// PRODUCTIVEAPP - GAMIFICATION.JS v1.0
// Système XP & Niveaux style RPG (Dofus-like)
// =============================================

// === STATE ===
let playerXP = 0;
let playerLevel = 1;
let totalXPEarned = 0;
let tasksCompleted = 0;
let streakDays = 0;
let lastActivityDate = null;
let unlockedFeatures = [];
let achievements = [];

// === CONSTANTES ===
const MAX_LEVEL = 100;
const BASE_XP = 100; // XP pour niveau 2
const XP_EXPONENT = 1.8; // Courbe de difficulté (plus c'est haut, plus c'est dur)

// === MOTS-CLÉS POUR DÉTECTION D'URGENCE ===
const URGENCY_KEYWORDS = {
    critical: {
        words: ['urgent', 'urgente', 'asap', 'immédiat', 'immédiate', 'critique', 'critical',
                'deadline', 'emergency', 'priorité max', 'tout de suite', 'maintenant',
                'aujourd\'hui', 'ce soir', 'ce matin', 'dans 1h', 'dans 2h'],
        multiplier: 3.0,
        baseXP: 50
    },
    high: {
        words: ['important', 'importante', 'prioritaire', 'vite', 'rapidement', 'bientôt',
                'demain', 'cette semaine', 'dès que possible', 'ne pas oublier', 'crucial',
                'essentiel', 'à faire', 'obligatoire', 'impératif'],
        multiplier: 2.0,
        baseXP: 35
    },
    medium: {
        words: ['normal', 'standard', 'planifié', 'prévu', 'semaine prochaine', 'quand possible',
                'à programmer', 'éventuellement', 'penser à', 'idée'],
        multiplier: 1.5,
        baseXP: 25
    },
    low: {
        words: ['optionnel', 'optionnelle', 'bonus', 'si temps', 'un jour', 'peut-être',
                'facultatif', 'nice to have', 'amélioration', 'plus tard'],
        multiplier: 1.0,
        baseXP: 15
    }
};

// === CATÉGORIES DE TÂCHES (bonus XP) ===
const TASK_CATEGORIES = {
    work: {
        keywords: ['travail', 'boulot', 'projet', 'client', 'réunion', 'meeting', 'rapport',
                   'présentation', 'code', 'dev', 'bug', 'feature', 'deploy', 'livraison'],
        bonusXP: 10
    },
    health: {
        keywords: ['sport', 'gym', 'médecin', 'santé', 'yoga', 'course', 'marche',
                   'sommeil', 'eau', 'vitamines', 'médicament'],
        bonusXP: 15
    },
    learning: {
        keywords: ['apprendre', 'cours', 'formation', 'lire', 'livre', 'tuto', 'tutorial',
                   'étudier', 'réviser', 'certification', 'compétence'],
        bonusXP: 20
    },
    finance: {
        keywords: ['facture', 'payer', 'banque', 'budget', 'impôts', 'comptabilité',
                   'investir', 'épargne', 'salaire'],
        bonusXP: 10
    },
    personal: {
        keywords: ['famille', 'amis', 'anniversaire', 'cadeau', 'vacances', 'loisir',
                   'hobby', 'sortie', 'resto', 'film'],
        bonusXP: 5
    }
};

// === FONCTIONNALITÉS DÉBLOQUABLES ===
const UNLOCKABLE_FEATURES = [
    { level: 1, id: 'basic', name: 'Fonctions de base', icon: '🎯', description: 'Créer et gérer des tâches' },
    { level: 3, id: 'themes_basic', name: 'Thèmes basiques', icon: '🎨', description: '4 thèmes visuels' },
    { level: 5, id: 'priority', name: 'Système de priorités', icon: '⚡', description: 'Marquer les tâches urgentes' },
    { level: 8, id: 'journal', name: 'Journal personnel', icon: '📔', description: 'Noter vos pensées' },
    { level: 10, id: 'galaxy_view', name: 'Galaxy View', icon: '🌌', description: 'Mind mapping visuel' },
    { level: 15, id: 'themes_premium', name: 'Thèmes Premium', icon: '✨', description: '8 thèmes supplémentaires' },
    { level: 20, id: 'chatbot', name: 'Assistant IA', icon: '🤖', description: 'Chatbot intelligent' },
    { level: 25, id: 'stats', name: 'Statistiques', icon: '📊', description: 'Analytics de productivité' },
    { level: 30, id: 'themes_all', name: 'Tous les thèmes', icon: '🌈', description: '16 thèmes complets' },
    { level: 35, id: 'export', name: 'Export avancé', icon: '📤', description: 'Export PDF et CSV' },
    { level: 40, id: 'shortcuts', name: 'Raccourcis clavier', icon: '⌨️', description: 'Productivité maximale' },
    { level: 50, id: 'zen_mode', name: 'Mode Zen', icon: '🧘', description: 'Interface minimaliste' },
    { level: 60, id: 'automation', name: 'Automatisations', icon: '⚙️', description: 'Tâches récurrentes auto' },
    { level: 75, id: 'badges', name: 'Système de badges', icon: '🏆', description: 'Collectionnez les succès' },
    { level: 90, id: 'custom_sounds', name: 'Sons personnalisés', icon: '🔊', description: 'Changez les effets sonores' },
    { level: 100, id: 'master', name: 'Maître Productif', icon: '👑', description: 'Titre légendaire + tout débloqué' }
];

// === ACHIEVEMENTS (Succès) ===
const ACHIEVEMENTS = [
    { id: 'first_task', name: 'Premier pas', description: 'Compléter votre première tâche', icon: '🎯', xpReward: 50 },
    { id: 'streak_3', name: 'En forme', description: '3 jours consécutifs d\'activité', icon: '🔥', xpReward: 100 },
    { id: 'streak_7', name: 'Semaine parfaite', description: '7 jours consécutifs', icon: '⭐', xpReward: 250 },
    { id: 'streak_30', name: 'Mois légendaire', description: '30 jours consécutifs', icon: '💎', xpReward: 1000 },
    { id: 'tasks_10', name: 'Productif', description: '10 tâches complétées', icon: '📋', xpReward: 75 },
    { id: 'tasks_50', name: 'Machine de guerre', description: '50 tâches complétées', icon: '🚀', xpReward: 300 },
    { id: 'tasks_100', name: 'Centurion', description: '100 tâches complétées', icon: '🏛️', xpReward: 500 },
    { id: 'tasks_500', name: 'Légende vivante', description: '500 tâches complétées', icon: '🌟', xpReward: 2000 },
    { id: 'level_10', name: 'Apprenti', description: 'Atteindre le niveau 10', icon: '📚', xpReward: 100 },
    { id: 'level_25', name: 'Compagnon', description: 'Atteindre le niveau 25', icon: '🎓', xpReward: 250 },
    { id: 'level_50', name: 'Expert', description: 'Atteindre le niveau 50', icon: '🏅', xpReward: 500 },
    { id: 'level_75', name: 'Maître', description: 'Atteindre le niveau 75', icon: '👨‍🏫', xpReward: 750 },
    { id: 'level_100', name: 'Grand Maître Suprême', description: 'Atteindre le niveau 100', icon: '👑', xpReward: 5000 },
    { id: 'urgent_master', name: 'Pompier', description: '20 tâches urgentes complétées', icon: '🚒', xpReward: 200 },
    { id: 'night_owl', name: 'Hibou nocturne', description: 'Tâche complétée après minuit', icon: '🦉', xpReward: 50 },
    { id: 'early_bird', name: 'Lève-tôt', description: 'Tâche complétée avant 6h', icon: '🐦', xpReward: 50 }
];

// === AUDIO CONTEXT (Sons synthétiques) ===
let audioContext = null;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// === SONS ===

// Son de gain d'XP (style RPG - notes ascendantes)
function playXPSound(xpAmount) {
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Nombre de notes selon l'XP gagné
    const noteCount = Math.min(Math.ceil(xpAmount / 15), 6);
    const baseFreq = 523.25; // Do5

    // Gamme majeure ascendante
    const scale = [1, 1.125, 1.25, 1.333, 1.5, 1.667, 1.875, 2];

    for (let i = 0; i < noteCount; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.value = baseFreq * scale[i % scale.length];

        const startTime = now + i * 0.08;
        const duration = 0.15;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    // Note finale brillante
    setTimeout(() => {
        playSparkleSound();
    }, noteCount * 80 + 50);
}

// Son de level up (fanfare épique)
function playLevelUpSound() {
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Accord majeur triomphant
    const frequencies = [261.63, 329.63, 392, 523.25]; // Do Mi Sol Do

    frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'triangle';
        osc.frequency.value = freq;

        const startTime = now + i * 0.1;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
        gain.gain.setValueAtTime(0.4, startTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);

        osc.start(startTime);
        osc.stop(startTime + 0.8);
    });

    // Arpège final
    setTimeout(() => {
        const arpFreqs = [523.25, 659.25, 783.99, 1046.5];
        arpFreqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.value = freq;

            const startTime = ctx.currentTime + i * 0.05;

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

            osc.start(startTime);
            osc.stop(startTime + 0.4);
        });
    }, 500);
}

// Son sparkle (paillettes)
function playSparkleSound() {
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Plusieurs petites notes aiguës
    for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.value = 1500 + Math.random() * 1000;

        const startTime = now + i * 0.05;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

        osc.start(startTime);
        osc.stop(startTime + 0.1);
    }
}

// Son d'achievement (succès débloqué)
function playAchievementSound() {
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Fanfare courte mais épique
    const melody = [
        { freq: 392, time: 0, dur: 0.15 },      // Sol
        { freq: 523.25, time: 0.15, dur: 0.15 }, // Do
        { freq: 659.25, time: 0.3, dur: 0.15 },  // Mi
        { freq: 783.99, time: 0.45, dur: 0.4 }   // Sol aigu (tenu)
    ];

    melody.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'square';
        osc.frequency.value = note.freq;

        const startTime = now + note.time;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gain.gain.setValueAtTime(0.2, startTime + note.dur * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.dur);

        osc.start(startTime);
        osc.stop(startTime + note.dur);
    });
}

// === CALCULS XP ===

// XP nécessaire pour atteindre un niveau donné (depuis le niveau 1)
function getXPForLevel(level) {
    if (level <= 1) return 0;

    let totalXP = 0;
    for (let i = 2; i <= level; i++) {
        totalXP += getXPToNextLevel(i - 1);
    }
    return Math.floor(totalXP);
}

// XP nécessaire pour passer du niveau actuel au suivant
function getXPToNextLevel(level) {
    if (level >= MAX_LEVEL) return Infinity;
    return Math.floor(BASE_XP * Math.pow(level, XP_EXPONENT));
}

// Calculer le niveau basé sur l'XP total
function calculateLevel(totalXP) {
    let level = 1;
    let xpNeeded = 0;

    while (level < MAX_LEVEL) {
        xpNeeded += getXPToNextLevel(level);
        if (totalXP < xpNeeded) break;
        level++;
    }

    return level;
}

// XP dans le niveau actuel (pour la barre de progression)
function getXPInCurrentLevel() {
    const xpForCurrentLevel = getXPForLevel(playerLevel);
    return playerXP - xpForCurrentLevel;
}

// Pourcentage de progression dans le niveau actuel
function getLevelProgress() {
    if (playerLevel >= MAX_LEVEL) return 100;

    const xpInLevel = getXPInCurrentLevel();
    const xpNeeded = getXPToNextLevel(playerLevel);

    return Math.min(100, Math.floor((xpInLevel / xpNeeded) * 100));
}

// === ANALYSE DE TÂCHE ===

// Analyser le texte d'une tâche pour déterminer l'urgence
function analyzeTaskUrgency(taskText) {
    const text = taskText.toLowerCase();

    // Vérifier chaque niveau d'urgence
    for (const [level, data] of Object.entries(URGENCY_KEYWORDS)) {
        for (const keyword of data.words) {
            if (text.includes(keyword)) {
                return {
                    level: level,
                    multiplier: data.multiplier,
                    baseXP: data.baseXP,
                    matchedKeyword: keyword
                };
            }
        }
    }

    // Par défaut : urgence moyenne
    return {
        level: 'medium',
        multiplier: 1.5,
        baseXP: 25,
        matchedKeyword: null
    };
}

// Analyser la catégorie de la tâche
function analyzeTaskCategory(taskText) {
    const text = taskText.toLowerCase();
    const categories = [];

    for (const [category, data] of Object.entries(TASK_CATEGORIES)) {
        for (const keyword of data.keywords) {
            if (text.includes(keyword)) {
                categories.push({
                    name: category,
                    bonusXP: data.bonusXP
                });
                break; // Une seule correspondance par catégorie
            }
        }
    }

    return categories;
}

// Calculer l'XP total pour une tâche
function calculateTaskXP(taskText, manualPriority = null) {
    const urgency = analyzeTaskUrgency(taskText);
    const categories = analyzeTaskCategory(taskText);

    // XP de base selon l'urgence détectée
    let xp = urgency.baseXP;

    // Bonus pour priorité manuelle (1 = urgent, 2 = normal, 3 = basse)
    if (manualPriority === 1) {
        xp *= 1.5;
    } else if (manualPriority === 3) {
        xp *= 0.8;
    }

    // Bonus de catégorie
    for (const cat of categories) {
        xp += cat.bonusXP;
    }

    // Bonus de streak (jours consécutifs)
    if (streakDays > 0) {
        const streakBonus = Math.min(streakDays * 0.05, 0.5); // Max +50%
        xp *= (1 + streakBonus);
    }

    // Bonus heure (tâche tôt le matin ou tard le soir)
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 7) {
        xp *= 1.2; // Bonus lève-tôt
    } else if (hour >= 22 || hour < 5) {
        xp *= 1.1; // Bonus noctambule
    }

    return {
        total: Math.floor(xp),
        urgency: urgency,
        categories: categories,
        breakdown: {
            base: urgency.baseXP,
            urgencyMultiplier: urgency.multiplier,
            categoryBonus: categories.reduce((sum, c) => sum + c.bonusXP, 0),
            streakBonus: streakDays > 0 ? `+${Math.min(streakDays * 5, 50)}%` : null
        }
    };
}

// === GESTION DES GAINS D'XP ===

// Gagner de l'XP (appelé quand une tâche est complétée)
async function gainXP(amount, source = 'task', showNotification = true) {
    const previousLevel = playerLevel;
    const previousXP = playerXP;

    playerXP += amount;
    totalXPEarned += amount;

    // Recalculer le niveau
    const newLevel = calculateLevel(playerXP);

    // Jouer le son d'XP
    if (showNotification) {
        playXPSound(amount);
    }

    // Afficher l'animation de gain d'XP
    if (showNotification) {
        showXPGainAnimation(amount);
    }

    // Level up ?
    if (newLevel > previousLevel) {
        playerLevel = newLevel;
        await handleLevelUp(previousLevel, newLevel);
    }

    // Mettre à jour l'UI
    updateXPBar();

    // Sauvegarder
    saveGamificationData();

    // Vérifier les achievements
    checkAchievements();

    console.log(`✨ +${amount} XP (${source}) | Total: ${playerXP} | Niveau: ${playerLevel}`);

    return {
        xpGained: amount,
        newTotal: playerXP,
        level: playerLevel,
        leveledUp: newLevel > previousLevel
    };
}

// Gérer le level up
async function handleLevelUp(oldLevel, newLevel) {
    console.log(`🎉 LEVEL UP! ${oldLevel} → ${newLevel}`);

    // Jouer le son de level up
    playLevelUpSound();

    // Afficher la notification de level up
    showLevelUpNotification(newLevel);

    // Vérifier les fonctionnalités débloquées
    const newUnlocks = UNLOCKABLE_FEATURES.filter(f =>
        f.level > oldLevel && f.level <= newLevel
    );

    for (const feature of newUnlocks) {
        if (!unlockedFeatures.includes(feature.id)) {
            unlockedFeatures.push(feature.id);
            await showFeatureUnlockNotification(feature);
        }
    }

    // Sauvegarder
    saveGamificationData();
}

// Compléter une tâche (fonction principale à appeler)
async function completeTask(taskText, manualPriority = null) {
    tasksCompleted++;

    // Calculer l'XP
    const xpInfo = calculateTaskXP(taskText, manualPriority);

    // Gagner l'XP
    await gainXP(xpInfo.total, 'task');

    // Mettre à jour le streak
    updateStreak();

    // Vérifier les achievements liés aux tâches
    checkTaskAchievements(taskText, manualPriority);

    return xpInfo;
}

// === STREAK ===

function updateStreak() {
    const today = new Date().toDateString();

    if (lastActivityDate === today) {
        // Déjà actif aujourd'hui
        return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastActivityDate === yesterday.toDateString()) {
        // Jour consécutif !
        streakDays++;
        console.log(`🔥 Streak: ${streakDays} jours`);
    } else if (lastActivityDate !== today) {
        // Streak cassé
        streakDays = 1;
    }

    lastActivityDate = today;
    saveGamificationData();
}

// === ACHIEVEMENTS ===

function checkAchievements() {
    const newAchievements = [];

    for (const achievement of ACHIEVEMENTS) {
        if (achievements.includes(achievement.id)) continue;

        let earned = false;

        switch (achievement.id) {
            case 'first_task':
                earned = tasksCompleted >= 1;
                break;
            case 'streak_3':
                earned = streakDays >= 3;
                break;
            case 'streak_7':
                earned = streakDays >= 7;
                break;
            case 'streak_30':
                earned = streakDays >= 30;
                break;
            case 'tasks_10':
                earned = tasksCompleted >= 10;
                break;
            case 'tasks_50':
                earned = tasksCompleted >= 50;
                break;
            case 'tasks_100':
                earned = tasksCompleted >= 100;
                break;
            case 'tasks_500':
                earned = tasksCompleted >= 500;
                break;
            case 'level_10':
                earned = playerLevel >= 10;
                break;
            case 'level_25':
                earned = playerLevel >= 25;
                break;
            case 'level_50':
                earned = playerLevel >= 50;
                break;
            case 'level_75':
                earned = playerLevel >= 75;
                break;
            case 'level_100':
                earned = playerLevel >= 100;
                break;
        }

        if (earned) {
            achievements.push(achievement.id);
            newAchievements.push(achievement);
        }
    }

    // Afficher et récompenser les nouveaux achievements
    for (const achievement of newAchievements) {
        showAchievementNotification(achievement);
        // Bonus XP pour l'achievement (sans notification pour éviter la boucle)
        gainXP(achievement.xpReward, 'achievement', false);
    }

    if (newAchievements.length > 0) {
        saveGamificationData();
    }
}

function checkTaskAchievements(taskText, priority) {
    const hour = new Date().getHours();

    // Hibou nocturne
    if ((hour >= 0 && hour < 5) && !achievements.includes('night_owl')) {
        achievements.push('night_owl');
        const achievement = ACHIEVEMENTS.find(a => a.id === 'night_owl');
        showAchievementNotification(achievement);
        gainXP(achievement.xpReward, 'achievement', false);
    }

    // Lève-tôt
    if ((hour >= 5 && hour < 6) && !achievements.includes('early_bird')) {
        achievements.push('early_bird');
        const achievement = ACHIEVEMENTS.find(a => a.id === 'early_bird');
        showAchievementNotification(achievement);
        gainXP(achievement.xpReward, 'achievement', false);
    }

    saveGamificationData();
}

// === UI ===

// Créer la barre d'XP
function createXPBar() {
    // Supprimer si existe déjà
    const existing = document.getElementById('xp-bar-container');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'xp-bar-container';
    container.className = 'xp-bar-container';

    container.innerHTML = `
        <div class="xp-bar-wrapper">
            <div class="xp-level-badge" id="xp-level-badge">
                <span class="level-number">${playerLevel}</span>
            </div>
            <div class="xp-bar-track">
                <div class="xp-bar-fill" id="xp-bar-fill" style="width: ${getLevelProgress()}%"></div>
                <div class="xp-bar-shimmer"></div>
            </div>
            <div class="xp-info">
                <span class="xp-current" id="xp-current">${getXPInCurrentLevel()}</span>
                <span class="xp-separator">/</span>
                <span class="xp-needed" id="xp-needed">${getXPToNextLevel(playerLevel)}</span>
                <span class="xp-label">XP</span>
            </div>
        </div>
        <div class="xp-bar-tooltip" id="xp-bar-tooltip">
            <div class="tooltip-title">Niveau ${playerLevel}</div>
            <div class="tooltip-progress">${getLevelProgress()}% vers niveau ${playerLevel + 1}</div>
            <div class="tooltip-total">Total XP: ${playerXP.toLocaleString()}</div>
            <div class="tooltip-streak">🔥 Streak: ${streakDays} jour${streakDays > 1 ? 's' : ''}</div>
        </div>
    `;

    // Insérer dans le header ou au début du body
    const header = document.querySelector('.header') || document.querySelector('header');
    if (header) {
        header.appendChild(container);
    } else {
        document.body.insertBefore(container, document.body.firstChild);
    }

    // Event listeners pour tooltip
    container.addEventListener('mouseenter', showXPTooltip);
    container.addEventListener('mouseleave', hideXPTooltip);
    container.addEventListener('click', openGamificationPanel);
}

// Mettre à jour la barre d'XP
function updateXPBar() {
    const fill = document.getElementById('xp-bar-fill');
    const levelBadge = document.getElementById('xp-level-badge');
    const xpCurrent = document.getElementById('xp-current');
    const xpNeeded = document.getElementById('xp-needed');
    const tooltip = document.getElementById('xp-bar-tooltip');

    if (fill) {
        const progress = getLevelProgress();
        fill.style.width = `${progress}%`;
    }

    if (levelBadge) {
        levelBadge.querySelector('.level-number').textContent = playerLevel;
    }

    if (xpCurrent) {
        xpCurrent.textContent = getXPInCurrentLevel();
    }

    if (xpNeeded) {
        xpNeeded.textContent = playerLevel >= MAX_LEVEL ? 'MAX' : getXPToNextLevel(playerLevel);
    }

    if (tooltip) {
        tooltip.querySelector('.tooltip-title').textContent = `Niveau ${playerLevel}`;
        tooltip.querySelector('.tooltip-progress').textContent =
            playerLevel >= MAX_LEVEL ? 'Niveau maximum atteint !' : `${getLevelProgress()}% vers niveau ${playerLevel + 1}`;
        tooltip.querySelector('.tooltip-total').textContent = `Total XP: ${playerXP.toLocaleString()}`;
        tooltip.querySelector('.tooltip-streak').textContent = `🔥 Streak: ${streakDays} jour${streakDays > 1 ? 's' : ''}`;
    }
}

// Animation de gain d'XP
function showXPGainAnimation(amount) {
    const xpBar = document.getElementById('xp-bar-container');
    if (!xpBar) return;

    const popup = document.createElement('div');
    popup.className = 'xp-gain-popup';
    popup.innerHTML = `+${amount} <span class="xp-text">XP</span>`;

    // Position aléatoire autour de la barre
    const randomX = Math.random() * 60 - 30;
    popup.style.setProperty('--popup-x', `${randomX}px`);

    xpBar.appendChild(popup);

    // Supprimer après l'animation
    setTimeout(() => popup.remove(), 1500);
}

// Notification de level up
function showLevelUpNotification(level) {
    const overlay = document.createElement('div');
    overlay.className = 'level-up-overlay';

    const unlockedAtLevel = UNLOCKABLE_FEATURES.find(f => f.level === level);
    const unlockText = unlockedAtLevel ?
        `<div class="level-up-unlock">🔓 ${unlockedAtLevel.name} débloqué !</div>` : '';

    overlay.innerHTML = `
        <div class="level-up-content">
            <div class="level-up-particles"></div>
            <div class="level-up-icon">⬆️</div>
            <div class="level-up-title">LEVEL UP!</div>
            <div class="level-up-number">
                <span class="level-from">${level - 1}</span>
                <span class="level-arrow">→</span>
                <span class="level-to">${level}</span>
            </div>
            ${unlockText}
            <div class="level-up-progress">
                ${Math.floor((level / MAX_LEVEL) * 100)}% vers le niveau maximum
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Fermer au clic ou après 4 secondes
    const close = () => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 500);
    };

    overlay.addEventListener('click', close);
    setTimeout(close, 4000);
}

// Notification de fonctionnalité débloquée
async function showFeatureUnlockNotification(feature) {
    const notification = document.createElement('div');
    notification.className = 'feature-unlock-notification';

    notification.innerHTML = `
        <div class="feature-unlock-icon">${feature.icon}</div>
        <div class="feature-unlock-content">
            <div class="feature-unlock-title">🔓 Nouveau débloqué !</div>
            <div class="feature-unlock-name">${feature.name}</div>
            <div class="feature-unlock-desc">${feature.description}</div>
        </div>
    `;

    document.body.appendChild(notification);

    // Animation d'entrée
    await new Promise(r => setTimeout(r, 50));
    notification.classList.add('show');

    // Fermer après 5 secondes
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// Notification d'achievement
function showAchievementNotification(achievement) {
    playAchievementSound();

    const notification = document.createElement('div');
    notification.className = 'achievement-notification';

    notification.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-content">
            <div class="achievement-title">🏆 Succès débloqué !</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.description}</div>
            <div class="achievement-reward">+${achievement.xpReward} XP</div>
        </div>
    `;

    document.body.appendChild(notification);

    // Animation
    setTimeout(() => notification.classList.add('show'), 50);

    // Fermer après 5 secondes
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// Tooltip de la barre XP
function showXPTooltip() {
    const tooltip = document.getElementById('xp-bar-tooltip');
    if (tooltip) tooltip.classList.add('show');
}

function hideXPTooltip() {
    const tooltip = document.getElementById('xp-bar-tooltip');
    if (tooltip) tooltip.classList.remove('show');
}

// Panel de gamification complet
function openGamificationPanel() {
    // Supprimer si existe
    const existing = document.getElementById('gamification-panel');
    if (existing) {
        existing.remove();
        return;
    }

    const panel = document.createElement('div');
    panel.id = 'gamification-panel';
    panel.className = 'gamification-panel';

    // Générer la liste des fonctionnalités
    const featuresHTML = UNLOCKABLE_FEATURES.map(f => {
        const isUnlocked = playerLevel >= f.level;
        return `
            <div class="feature-item ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="feature-level">Niv. ${f.level}</div>
                <div class="feature-icon">${f.icon}</div>
                <div class="feature-info">
                    <div class="feature-name">${f.name}</div>
                    <div class="feature-desc">${f.description}</div>
                </div>
                <div class="feature-status">${isUnlocked ? '✅' : '🔒'}</div>
            </div>
        `;
    }).join('');

    // Générer la liste des achievements
    const achievementsHTML = ACHIEVEMENTS.map(a => {
        const isEarned = achievements.includes(a.id);
        return `
            <div class="achievement-item ${isEarned ? 'earned' : 'locked'}">
                <div class="achievement-icon">${a.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${a.name}</div>
                    <div class="achievement-desc">${a.description}</div>
                </div>
                <div class="achievement-reward">+${a.xpReward} XP</div>
            </div>
        `;
    }).join('');

    panel.innerHTML = `
        <div class="panel-overlay" onclick="closeGamificationPanel()"></div>
        <div class="panel-content">
            <button class="panel-close" onclick="closeGamificationPanel()">✕</button>

            <div class="panel-header">
                <div class="player-avatar">
                    <div class="avatar-level">${playerLevel}</div>
                </div>
                <div class="player-info">
                    <div class="player-title">${getPlayerTitle()}</div>
                    <div class="player-stats">
                        <span>📊 ${tasksCompleted} tâches</span>
                        <span>🔥 ${streakDays} jours</span>
                        <span>✨ ${totalXPEarned.toLocaleString()} XP total</span>
                    </div>
                </div>
            </div>

            <div class="panel-xp-bar">
                <div class="panel-xp-fill" style="width: ${getLevelProgress()}%"></div>
                <div class="panel-xp-text">
                    ${getXPInCurrentLevel()} / ${playerLevel >= MAX_LEVEL ? 'MAX' : getXPToNextLevel(playerLevel)} XP
                </div>
            </div>

            <div class="panel-tabs">
                <button class="tab-btn active" data-tab="features">🎮 Fonctionnalités</button>
                <button class="tab-btn" data-tab="achievements">🏆 Succès</button>
                <button class="tab-btn" data-tab="stats">📈 Stats</button>
            </div>

            <div class="panel-tab-content" id="tab-features">
                <div class="features-list">
                    ${featuresHTML}
                </div>
            </div>

            <div class="panel-tab-content hidden" id="tab-achievements">
                <div class="achievements-list">
                    ${achievementsHTML}
                </div>
            </div>

            <div class="panel-tab-content hidden" id="tab-stats">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-value">${tasksCompleted}</div>
                        <div class="stat-label">Tâches complétées</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-value">${playerLevel}</div>
                        <div class="stat-label">Niveau actuel</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✨</div>
                        <div class="stat-value">${totalXPEarned.toLocaleString()}</div>
                        <div class="stat-label">XP total gagné</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-value">${streakDays}</div>
                        <div class="stat-label">Jours de streak</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🏆</div>
                        <div class="stat-value">${achievements.length}/${ACHIEVEMENTS.length}</div>
                        <div class="stat-label">Succès débloqués</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🔓</div>
                        <div class="stat-value">${unlockedFeatures.length}/${UNLOCKABLE_FEATURES.length}</div>
                        <div class="stat-label">Fonctionnalités</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(panel);

    // Animation d'entrée
    setTimeout(() => panel.classList.add('show'), 50);

    // Event listeners pour les tabs
    panel.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            panel.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            panel.querySelectorAll('.panel-tab-content').forEach(c => c.classList.add('hidden'));
            document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
        });
    });
}

function closeGamificationPanel() {
    const panel = document.getElementById('gamification-panel');
    if (panel) {
        panel.classList.remove('show');
        setTimeout(() => panel.remove(), 300);
    }
}

// Titre du joueur selon le niveau
function getPlayerTitle() {
    if (playerLevel >= 100) return '👑 Grand Maître Suprême';
    if (playerLevel >= 90) return '🌟 Légende Vivante';
    if (playerLevel >= 75) return '👨‍🏫 Maître Productif';
    if (playerLevel >= 60) return '🏅 Expert Confirmé';
    if (playerLevel >= 50) return '💪 Vétéran';
    if (playerLevel >= 40) return '⚔️ Guerrier';
    if (playerLevel >= 30) return '🎖️ Officier';
    if (playerLevel >= 20) return '🛡️ Chevalier';
    if (playerLevel >= 15) return '📚 Érudit';
    if (playerLevel >= 10) return '🎓 Apprenti';
    if (playerLevel >= 5) return '🌱 Novice';
    return '👶 Débutant';
}

// === VÉRIFICATION DES FONCTIONNALITÉS DÉBLOQUÉES ===

function isFeatureUnlocked(featureId) {
    const feature = UNLOCKABLE_FEATURES.find(f => f.id === featureId);
    if (!feature) return true; // Si pas trouvé, autoriser par défaut
    return playerLevel >= feature.level;
}

// === PERSISTANCE ===

function saveGamificationData() {
    const data = {
        playerXP,
        playerLevel,
        totalXPEarned,
        tasksCompleted,
        streakDays,
        lastActivityDate,
        unlockedFeatures,
        achievements,
        version: '1.0'
    };

    localStorage.setItem('productiveapp_gamification', JSON.stringify(data));
    console.log('💾 Gamification sauvegardée');
}

function loadGamificationData() {
    const saved = localStorage.getItem('productiveapp_gamification');
    if (!saved) {
        console.log('🆕 Nouvelle partie - Bienvenue !');
        initializeNewPlayer();
        return;
    }

    try {
        const data = JSON.parse(saved);

        playerXP = data.playerXP || 0;
        playerLevel = data.playerLevel || 1;
        totalXPEarned = data.totalXPEarned || 0;
        tasksCompleted = data.tasksCompleted || 0;
        streakDays = data.streakDays || 0;
        lastActivityDate = data.lastActivityDate || null;
        unlockedFeatures = data.unlockedFeatures || [];
        achievements = data.achievements || [];

        console.log(`📂 Gamification chargée - Niveau ${playerLevel} (${playerXP} XP)`);
    } catch (e) {
        console.error('❌ Erreur chargement gamification:', e);
        initializeNewPlayer();
    }
}

function initializeNewPlayer() {
    playerXP = 0;
    playerLevel = 1;
    totalXPEarned = 0;
    tasksCompleted = 0;
    streakDays = 0;
    lastActivityDate = null;
    unlockedFeatures = ['basic'];
    achievements = [];

    saveGamificationData();
}

// === INITIALISATION ===

function initGamification() {
    console.log('🎮 Initialisation du système de gamification...');

    loadGamificationData();
    createXPBar();
    updateStreak();

    // Mettre à jour les fonctionnalités débloquées selon le niveau
    UNLOCKABLE_FEATURES.forEach(feature => {
        if (playerLevel >= feature.level && !unlockedFeatures.includes(feature.id)) {
            unlockedFeatures.push(feature.id);
        }
    });

    saveGamificationData();

    console.log(`✅ Gamification initialisée - Niveau ${playerLevel} | ${playerXP} XP | ${tasksCompleted} tâches`);
}

// === EXPORTS ===

window.initGamification = initGamification;
window.gainXP = gainXP;
window.completeTask = completeTask;
window.calculateTaskXP = calculateTaskXP;
window.isFeatureUnlocked = isFeatureUnlocked;
window.openGamificationPanel = openGamificationPanel;
window.closeGamificationPanel = closeGamificationPanel;
window.getPlayerLevel = () => playerLevel;
window.getPlayerXP = () => playerXP;

console.log('📦 gamification.js v1.0 chargé - Système XP style RPG');
