/**
 * PSYCHO-AUDIT GAMIFICATION ENGINE v1.0
 * ProductiveApp v7.0 - Système de Gamification Premium
 *
 * Moteur complet de gamification thérapeutique :
 * - Système XP avec 30 niveaux progressifs
 * - 40 badges/achievements déblocables
 * - Streaks quotidiens avec flammes animées
 * - Défis quotidiens & hebdomadaires
 * - Célébrations visuelles & sonores
 * - Arbre de compétences thérapeutiques
 */

const PaGamification = (function() {
    'use strict';

    const STORAGE_KEY = 'pa_gamification_v1';

    // =========================================================================
    // CONFIGURATION DES NIVEAUX (30 niveaux)
    // =========================================================================
    const LEVELS = [
        { level: 1, xpRequired: 0, title: 'Éveil', subtitle: 'Le voyage commence', icon: '🌱', color: '#6ee7b7' },
        { level: 2, xpRequired: 50, title: 'Curieux', subtitle: 'L\'exploration intérieure', icon: '🔍', color: '#6ee7b7' },
        { level: 3, xpRequired: 120, title: 'Apprenti', subtitle: 'Les premiers pas', icon: '📖', color: '#6ee7b7' },
        { level: 4, xpRequired: 220, title: 'Chercheur', subtitle: 'La quête de sens', icon: '🧭', color: '#6ee7b7' },
        { level: 5, xpRequired: 350, title: 'Initiée', subtitle: 'La porte s\'ouvre', icon: '🚪', color: '#86efac' },
        { level: 6, xpRequired: 500, title: 'Conscient', subtitle: 'L\'éveil s\'installe', icon: '👁️', color: '#a78bfa' },
        { level: 7, xpRequired: 700, title: 'Pratiquant', subtitle: 'La discipline naît', icon: '🧘', color: '#a78bfa' },
        { level: 8, xpRequired: 950, title: 'Exploratrice', subtitle: 'Les profondeurs', icon: '🌊', color: '#a78bfa' },
        { level: 9, xpRequired: 1250, title: 'Résiliente', subtitle: 'La force intérieure', icon: '🛡️', color: '#a78bfa' },
        { level: 10, xpRequired: 1600, title: 'Éveillé(e)', subtitle: 'La conscience s\'étend', icon: '✨', color: '#c084fc' },
        { level: 11, xpRequired: 2000, title: 'Transformateur', subtitle: 'Le changement opère', icon: '🦋', color: '#f472b6' },
        { level: 12, xpRequired: 2500, title: 'Alchimiste', subtitle: 'Transmuter la douleur', icon: '⚗️', color: '#f472b6' },
        { level: 13, xpRequired: 3100, title: 'Guérisseur', subtitle: 'Se soigner soi-même', icon: '💊', color: '#f472b6' },
        { level: 14, xpRequired: 3800, title: 'Guerrier Intérieur', subtitle: 'Combattre ses démons', icon: '⚔️', color: '#f472b6' },
        { level: 15, xpRequired: 4600, title: 'Phénix', subtitle: 'Renaître de ses cendres', icon: '🔥', color: '#fb923c' },
        { level: 16, xpRequired: 5500, title: 'Maître de Soi', subtitle: 'La maîtrise commence', icon: '🎭', color: '#fbbf24' },
        { level: 17, xpRequired: 6500, title: 'Sage Moderne', subtitle: 'La sagesse en action', icon: '📿', color: '#fbbf24' },
        { level: 18, xpRequired: 7600, title: 'Architecte Mental', subtitle: 'Construire son esprit', icon: '🏛️', color: '#fbbf24' },
        { level: 19, xpRequired: 8800, title: 'Libre', subtitle: 'Au-delà des chaînes', icon: '🕊️', color: '#fbbf24' },
        { level: 20, xpRequired: 10000, title: 'Illuminé(e)', subtitle: 'La lumière intérieure', icon: '🌟', color: '#fde047' },
        { level: 21, xpRequired: 11500, title: 'Guide', subtitle: 'Montrer le chemin', icon: '🗺️', color: '#67e8f9' },
        { level: 22, xpRequired: 13200, title: 'Visionnaire', subtitle: 'Voir au-delà', icon: '🔮', color: '#67e8f9' },
        { level: 23, xpRequired: 15000, title: 'Mentor', subtitle: 'Transmettre le savoir', icon: '🎓', color: '#67e8f9' },
        { level: 24, xpRequired: 17000, title: 'Harmonique', subtitle: 'L\'équilibre parfait', icon: '☯️', color: '#67e8f9' },
        { level: 25, xpRequired: 19500, title: 'Transcendant', subtitle: 'Au-delà des limites', icon: '💫', color: '#c4b5fd' },
        { level: 26, xpRequired: 22500, title: 'Maître Intérieur', subtitle: 'La maîtrise totale', icon: '👑', color: '#e879f9' },
        { level: 27, xpRequired: 26000, title: 'Éveilleur', subtitle: 'Éveiller les autres', icon: '🌅', color: '#e879f9' },
        { level: 28, xpRequired: 30000, title: 'Cosmique', subtitle: 'Connexion universelle', icon: '🌌', color: '#e879f9' },
        { level: 29, xpRequired: 35000, title: 'Légende Vivante', subtitle: 'L\'immortalité de l\'âme', icon: '🏆', color: '#fcd34d' },
        { level: 30, xpRequired: 42000, title: 'Être de Lumière', subtitle: 'L\'accomplissement ultime', icon: '☀️', color: '#fcd34d' }
    ];

    // =========================================================================
    // CONFIGURATION DES BADGES (40 badges)
    // =========================================================================
    const BADGES = [
        // Premiers pas
        { id: 'first_audit', title: 'Premier Pas', description: 'Complétez votre premier audit', icon: '🌱', category: 'debut', rarity: 'common', xpReward: 25 },
        { id: 'first_exercise', title: 'Première Pratique', description: 'Complétez votre premier exercice', icon: '🎯', category: 'debut', rarity: 'common', xpReward: 15 },
        { id: 'first_journal', title: 'Première Page', description: 'Écrivez votre premier journal', icon: '📝', category: 'debut', rarity: 'common', xpReward: 15 },
        { id: 'first_mood', title: 'Miroir Intérieur', description: 'Enregistrez votre première humeur', icon: '🪞', category: 'debut', rarity: 'common', xpReward: 10 },
        { id: 'first_gratitude', title: 'Coeur Ouvert', description: 'Écrivez vos 3 premières gratitudes', icon: '💗', category: 'debut', rarity: 'common', xpReward: 15 },

        // Streaks
        { id: 'streak_3', title: 'Flamme Naissante', description: '3 jours consécutifs d\'activité', icon: '🔥', category: 'streak', rarity: 'common', xpReward: 30 },
        { id: 'streak_7', title: 'Feu Intérieur', description: '7 jours consécutifs', icon: '🔥', category: 'streak', rarity: 'uncommon', xpReward: 75 },
        { id: 'streak_14', title: 'Brasier Mental', description: '14 jours consécutifs', icon: '🔥', category: 'streak', rarity: 'rare', xpReward: 150 },
        { id: 'streak_30', title: 'Volcan Intérieur', description: '30 jours consécutifs', icon: '🌋', category: 'streak', rarity: 'epic', xpReward: 400 },
        { id: 'streak_60', title: 'Soleil Perpétuel', description: '60 jours consécutifs', icon: '☀️', category: 'streak', rarity: 'legendary', xpReward: 1000 },

        // Exercices
        { id: 'exercises_5', title: 'Pratiquant Assidu', description: 'Complétez 5 exercices', icon: '💪', category: 'exercises', rarity: 'common', xpReward: 40 },
        { id: 'exercises_15', title: 'Artisan du Bien-être', description: 'Complétez 15 exercices', icon: '🛠️', category: 'exercises', rarity: 'uncommon', xpReward: 100 },
        { id: 'exercises_30', title: 'Maître Praticien', description: 'Complétez 30 exercices', icon: '🎖️', category: 'exercises', rarity: 'rare', xpReward: 250 },
        { id: 'exercises_50', title: 'Virtuose Thérapeutique', description: 'Complétez 50 exercices', icon: '🏅', category: 'exercises', rarity: 'epic', xpReward: 500 },
        { id: 'exercises_100', title: 'Centurion de l\'Âme', description: '100 exercices complétés', icon: '🏛️', category: 'exercises', rarity: 'legendary', xpReward: 1500 },

        // Catégories d'exercices
        { id: 'cat_cbt', title: 'Penseur Restructuré', description: 'Complétez 3 exercices TCC', icon: '🧠', category: 'mastery', rarity: 'uncommon', xpReward: 60 },
        { id: 'cat_mindfulness', title: 'Esprit Présent', description: 'Complétez 3 exercices Pleine Conscience', icon: '🧘', category: 'mastery', rarity: 'uncommon', xpReward: 60 },
        { id: 'cat_shadow', title: 'Explorateur de l\'Ombre', description: 'Complétez 3 exercices Travail de l\'Ombre', icon: '🌑', category: 'mastery', rarity: 'rare', xpReward: 100 },
        { id: 'cat_somatic', title: 'Corps Éveillé', description: 'Complétez 3 exercices Intelligence Somatique', icon: '🫀', category: 'mastery', rarity: 'uncommon', xpReward: 60 },
        { id: 'cat_spiritual', title: 'Connexion Sacrée', description: 'Complétez 3 exercices Éveil & Conscience', icon: '✨', category: 'mastery', rarity: 'rare', xpReward: 100 },
        { id: 'cat_all', title: 'Renaissance Totale', description: 'Essayez les 10 catégories d\'exercices', icon: '🌈', category: 'mastery', rarity: 'epic', xpReward: 500 },

        // Audits
        { id: 'audits_3', title: 'Introspecteur', description: 'Complétez 3 audits', icon: '🔍', category: 'audit', rarity: 'common', xpReward: 50 },
        { id: 'audits_10', title: 'Analyste de Soi', description: 'Complétez 10 audits', icon: '📊', category: 'audit', rarity: 'uncommon', xpReward: 150 },
        { id: 'audits_25', title: 'Archéologue Intérieur', description: 'Complétez 25 audits', icon: '⛏️', category: 'audit', rarity: 'rare', xpReward: 300 },
        { id: 'score_80', title: 'Excellence', description: 'Atteignez un score > 80', icon: '⭐', category: 'audit', rarity: 'uncommon', xpReward: 100 },
        { id: 'score_comeback', title: 'Phénix', description: 'Score > 75 après un score < 40', icon: '🔥', category: 'audit', rarity: 'epic', xpReward: 300 },
        { id: 'score_improve_20', title: 'Bond Quantique', description: 'Améliorez de +20 points en un audit', icon: '🚀', category: 'audit', rarity: 'rare', xpReward: 200 },

        // Journal
        { id: 'journal_7', title: 'Chroniqueur', description: '7 entrées de journal', icon: '📔', category: 'journal', rarity: 'uncommon', xpReward: 75 },
        { id: 'journal_30', title: 'Écrivain de l\'Âme', description: '30 entrées de journal', icon: '✒️', category: 'journal', rarity: 'rare', xpReward: 200 },
        { id: 'gratitudes_21', title: 'Cœur Reconnaissant', description: '21 jours de gratitudes (63 total)', icon: '🙏', category: 'journal', rarity: 'rare', xpReward: 250 },
        { id: 'gratitudes_100', title: 'Source de Gratitude', description: '100 gratitudes écrites', icon: '💎', category: 'journal', rarity: 'epic', xpReward: 500 },

        // Niveaux
        { id: 'level_5', title: 'Initié(e)', description: 'Atteignez le niveau 5', icon: '🚪', category: 'level', rarity: 'common', xpReward: 0 },
        { id: 'level_10', title: 'Éveillé(e)', description: 'Atteignez le niveau 10', icon: '✨', category: 'level', rarity: 'uncommon', xpReward: 0 },
        { id: 'level_15', title: 'Phénix', description: 'Atteignez le niveau 15', icon: '🔥', category: 'level', rarity: 'rare', xpReward: 0 },
        { id: 'level_20', title: 'Illuminé(e)', description: 'Atteignez le niveau 20', icon: '🌟', category: 'level', rarity: 'epic', xpReward: 0 },
        { id: 'level_25', title: 'Transcendant(e)', description: 'Atteignez le niveau 25', icon: '💫', category: 'level', rarity: 'epic', xpReward: 0 },
        { id: 'level_30', title: 'Être de Lumière', description: 'Atteignez le niveau 30', icon: '☀️', category: 'level', rarity: 'legendary', xpReward: 0 },

        // Spéciaux
        { id: 'night_owl', title: 'Hibou Nocturne', description: 'Pratiquez après 23h', icon: '🦉', category: 'special', rarity: 'uncommon', xpReward: 30 },
        { id: 'early_bird', title: 'Lève-tôt Conscient', description: 'Pratiquez avant 7h', icon: '🐦', category: 'special', rarity: 'uncommon', xpReward: 30 },
        { id: 'weekend_warrior', title: 'Guerrier du Weekend', description: 'Pratiquez samedi et dimanche', icon: '⚔️', category: 'special', rarity: 'uncommon', xpReward: 40 }
    ];

    // =========================================================================
    // DÉFIS QUOTIDIENS
    // =========================================================================
    const DAILY_CHALLENGES = [
        { id: 'dc_audit', title: 'Introspection du jour', description: 'Complétez un audit', icon: '🧠', xpReward: 30, action: 'audit' },
        { id: 'dc_exercise', title: 'Pratique quotidienne', description: 'Complétez 1 exercice', icon: '🎯', xpReward: 20, action: 'exercise' },
        { id: 'dc_journal', title: 'Page de conscience', description: 'Écrivez dans votre journal', icon: '📝', xpReward: 20, action: 'journal' },
        { id: 'dc_mood_3', title: 'Baromètre émotionnel', description: 'Enregistrez votre humeur 3 fois', icon: '🌡️', xpReward: 15, action: 'mood_3' },
        { id: 'dc_gratitude', title: 'Triple bénédiction', description: 'Écrivez 3 gratitudes', icon: '🙏', xpReward: 15, action: 'gratitude' },
        { id: 'dc_2exercises', title: 'Double dose', description: 'Complétez 2 exercices', icon: '💊', xpReward: 35, action: 'exercises_2' },
        { id: 'dc_new_category', title: 'Terra incognita', description: 'Essayez une catégorie inexplorée', icon: '🗺️', xpReward: 40, action: 'new_category' },
        { id: 'dc_deep_work', title: 'Travail profond', description: 'Complétez un exercice de l\'ombre', icon: '🌑', xpReward: 35, action: 'shadow_exercise' },
        { id: 'dc_morning_routine', title: 'Rituel du matin', description: 'Pratiquez avant 9h', icon: '🌅', xpReward: 25, action: 'morning' },
        { id: 'dc_full_day', title: 'Journée complète', description: 'Audit + exercice + journal', icon: '⭐', xpReward: 60, action: 'full_day' }
    ];

    const WEEKLY_CHALLENGES = [
        { id: 'wc_5exercises', title: 'Semaine active', description: '5 exercices cette semaine', icon: '🏃', xpReward: 100, action: 'exercises_5_week' },
        { id: 'wc_streak', title: 'Sans interruption', description: '7 jours consécutifs', icon: '🔥', xpReward: 150, action: 'streak_7_week' },
        { id: 'wc_3audits', title: 'Triple introspection', description: '3 audits cette semaine', icon: '🔍', xpReward: 120, action: 'audits_3_week' },
        { id: 'wc_variety', title: 'Polyvalent', description: '3 catégories différentes', icon: '🌈', xpReward: 100, action: 'variety_3_week' },
        { id: 'wc_journal_5', title: 'Journal intime', description: 'Écrivez 5 jours sur 7', icon: '📖', xpReward: 100, action: 'journal_5_week' }
    ];

    // =========================================================================
    // STATE MANAGEMENT
    // =========================================================================

    let state = null;

    function getDefaultState() {
        return {
            xp: 0,
            level: 1,
            badges: [],
            streak: { current: 0, best: 0, lastActivityDate: null, freezesUsed: 0 },
            stats: {
                totalAudits: 0,
                totalExercises: 0,
                totalJournals: 0,
                totalGratitudes: 0,
                totalMoods: 0,
                categoriesExplored: [],
                lowestScore: 100,
                highestScore: 0,
                lastScore: null
            },
            dailyChallenge: null,
            dailyChallengeDate: null,
            weeklyChallenge: null,
            weeklyChallengeDate: null,
            dailyProgress: {},
            weeklyProgress: {},
            notifications: [],
            createdAt: new Date().toISOString()
        };
    }

    function loadState() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                state = JSON.parse(saved);
                // Ensure new fields exist
                if (!state.notifications) state.notifications = [];
                if (!state.dailyProgress) state.dailyProgress = {};
                if (!state.weeklyProgress) state.weeklyProgress = {};
            } else {
                state = getDefaultState();
            }
        } catch (e) {
            state = getDefaultState();
        }
        refreshChallenges();
        checkStreakStatus();
        return state;
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('PaGamification: Save failed', e);
        }
    }

    function getState() {
        if (!state) loadState();
        return state;
    }

    // =========================================================================
    // XP & LEVELING SYSTEM
    // =========================================================================

    function addXP(amount, reason) {
        if (!state) loadState();
        var oldLevel = state.level;
        state.xp += amount;

        // Calculate new level
        var newLevel = 1;
        for (var i = LEVELS.length - 1; i >= 0; i--) {
            if (state.xp >= LEVELS[i].xpRequired) {
                newLevel = LEVELS[i].level;
                break;
            }
        }

        var leveledUp = newLevel > oldLevel;
        state.level = newLevel;
        saveState();

        // Show XP toast
        showXPToast(amount, reason);

        // Check level badges
        if (leveledUp) {
            showLevelUpCelebration(newLevel);
            checkLevelBadges(newLevel);
        }

        return { xpGained: amount, newTotal: state.xp, level: newLevel, leveledUp: leveledUp };
    }

    function getCurrentLevel() {
        if (!state) loadState();
        return LEVELS.find(function(l) { return l.level === state.level; }) || LEVELS[0];
    }

    function getNextLevel() {
        if (!state) loadState();
        return LEVELS.find(function(l) { return l.level === state.level + 1; }) || null;
    }

    function getLevelProgress() {
        if (!state) loadState();
        var current = getCurrentLevel();
        var next = getNextLevel();
        if (!next) return { percent: 100, xpCurrent: state.xp, xpNeeded: 0, xpInLevel: 0 };
        var xpInLevel = state.xp - current.xpRequired;
        var xpNeeded = next.xpRequired - current.xpRequired;
        return {
            percent: Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)),
            xpCurrent: xpInLevel,
            xpNeeded: xpNeeded,
            xpTotal: state.xp
        };
    }

    // =========================================================================
    // STREAK SYSTEM
    // =========================================================================

    function recordActivity() {
        if (!state) loadState();
        var today = new Date().toISOString().split('T')[0];

        if (state.streak.lastActivityDate === today) return; // Already recorded today

        var yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (state.streak.lastActivityDate === yesterday) {
            state.streak.current++;
        } else if (state.streak.lastActivityDate !== today) {
            // Streak broken (unless freeze available)
            var daysSince = state.streak.lastActivityDate ?
                Math.floor((Date.now() - new Date(state.streak.lastActivityDate).getTime()) / 86400000) : 0;

            if (daysSince === 2 && state.streak.freezesUsed < 1) {
                // Allow one freeze per week
                state.streak.freezesUsed++;
                state.streak.current++;
            } else {
                state.streak.current = 1;
            }
        }

        state.streak.lastActivityDate = today;
        if (state.streak.current > state.streak.best) {
            state.streak.best = state.streak.current;
        }

        // Reset weekly freeze counter on Mondays
        if (new Date().getDay() === 1) {
            state.streak.freezesUsed = 0;
        }

        saveState();
        checkStreakBadges();
    }

    function checkStreakStatus() {
        if (!state) return;
        var today = new Date().toISOString().split('T')[0];
        var yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (state.streak.lastActivityDate &&
            state.streak.lastActivityDate !== today &&
            state.streak.lastActivityDate !== yesterday) {
            // Streak is broken unless we have a freeze
            var daysSince = Math.floor((Date.now() - new Date(state.streak.lastActivityDate).getTime()) / 86400000);
            if (daysSince > 2 || state.streak.freezesUsed >= 1) {
                state.streak.current = 0;
            }
        }
    }

    // =========================================================================
    // BADGE SYSTEM
    // =========================================================================

    function awardBadge(badgeId) {
        if (!state) loadState();
        if (state.badges.indexOf(badgeId) !== -1) return false; // Already earned

        var badge = BADGES.find(function(b) { return b.id === badgeId; });
        if (!badge) return false;

        state.badges.push(badgeId);
        saveState();

        // Show badge celebration
        showBadgeCelebration(badge);

        // Award badge XP
        if (badge.xpReward > 0) {
            setTimeout(function() { addXP(badge.xpReward, 'Badge: ' + badge.title); }, 1500);
        }

        return true;
    }

    function hasBadge(badgeId) {
        if (!state) loadState();
        return state.badges.indexOf(badgeId) !== -1;
    }

    function checkLevelBadges(level) {
        [5, 10, 15, 20, 25, 30].forEach(function(l) {
            if (level >= l) awardBadge('level_' + l);
        });
    }

    function checkStreakBadges() {
        if (!state) return;
        [3, 7, 14, 30, 60].forEach(function(s) {
            if (state.streak.current >= s) awardBadge('streak_' + s);
        });
    }

    function checkExerciseBadges() {
        if (!state) return;
        [5, 15, 30, 50, 100].forEach(function(n) {
            if (state.stats.totalExercises >= n) awardBadge('exercises_' + n);
        });
    }

    function checkAuditBadges() {
        if (!state) return;
        [3, 10, 25].forEach(function(n) {
            if (state.stats.totalAudits >= n) awardBadge('audits_' + n);
        });
    }

    function checkCategoryBadges(categoryId) {
        if (!state) return;
        // Track category exercises
        var catCounts = JSON.parse(localStorage.getItem('pa_cat_counts') || '{}');
        catCounts[categoryId] = (catCounts[categoryId] || 0) + 1;
        localStorage.setItem('pa_cat_counts', JSON.stringify(catCounts));

        // Category-specific badges
        var catBadgeMap = {
            cbt: 'cat_cbt', mindfulness: 'cat_mindfulness', shadow: 'cat_shadow',
            somatic: 'cat_somatic', spiritual: 'cat_spiritual'
        };
        if (catBadgeMap[categoryId] && catCounts[categoryId] >= 3) {
            awardBadge(catBadgeMap[categoryId]);
        }

        // All categories badge
        if (!state.stats.categoriesExplored) state.stats.categoriesExplored = [];
        if (state.stats.categoriesExplored.indexOf(categoryId) === -1) {
            state.stats.categoriesExplored.push(categoryId);
        }
        if (state.stats.categoriesExplored.length >= 10) {
            awardBadge('cat_all');
        }
        saveState();
    }

    function checkJournalBadges() {
        if (!state) return;
        if (state.stats.totalJournals >= 7) awardBadge('journal_7');
        if (state.stats.totalJournals >= 30) awardBadge('journal_30');
    }

    function checkGratitudeBadges() {
        if (!state) return;
        if (state.stats.totalGratitudes >= 63) awardBadge('gratitudes_21');
        if (state.stats.totalGratitudes >= 100) awardBadge('gratitudes_100');
    }

    function checkTimeBadges() {
        var hour = new Date().getHours();
        if (hour >= 23 || hour < 4) awardBadge('night_owl');
        if (hour >= 5 && hour < 7) awardBadge('early_bird');
        if (new Date().getDay() === 0 || new Date().getDay() === 6) {
            var weekendKey = 'pa_weekend_' + getWeekId();
            var days = JSON.parse(localStorage.getItem(weekendKey) || '[]');
            var today = new Date().getDay();
            if (days.indexOf(today) === -1) days.push(today);
            localStorage.setItem(weekendKey, JSON.stringify(days));
            if (days.length >= 2) awardBadge('weekend_warrior');
        }
    }

    // =========================================================================
    // DAILY & WEEKLY CHALLENGES
    // =========================================================================

    function refreshChallenges() {
        if (!state) return;
        var today = new Date().toISOString().split('T')[0];
        var weekId = getWeekId();

        // Daily challenge refresh
        if (state.dailyChallengeDate !== today) {
            // Seed-based pseudo-random for consistent daily challenge
            var seed = hashDate(today);
            state.dailyChallenge = DAILY_CHALLENGES[seed % DAILY_CHALLENGES.length];
            state.dailyChallengeDate = today;
            state.dailyProgress = {};
            saveState();
        }

        // Weekly challenge refresh
        if (state.weeklyChallengeDate !== weekId) {
            var wseed = hashDate(weekId);
            state.weeklyChallenge = WEEKLY_CHALLENGES[wseed % WEEKLY_CHALLENGES.length];
            state.weeklyChallengeDate = weekId;
            state.weeklyProgress = {};
            saveState();
        }
    }

    function getDailyChallenge() {
        if (!state) loadState();
        return state.dailyChallenge;
    }

    function getWeeklyChallenge() {
        if (!state) loadState();
        return state.weeklyChallenge;
    }

    function isDailyChallengeComplete() {
        if (!state) loadState();
        return state.dailyProgress && state.dailyProgress.completed === true;
    }

    function isWeeklyChallengeComplete() {
        if (!state) loadState();
        return state.weeklyProgress && state.weeklyProgress.completed === true;
    }

    function updateDailyProgress(action) {
        if (!state) loadState();
        if (!state.dailyChallenge || isDailyChallengeComplete()) return;
        if (!state.dailyProgress) state.dailyProgress = {};

        var challenge = state.dailyChallenge;
        var completed = false;

        switch (challenge.action) {
            case 'audit': completed = action === 'audit'; break;
            case 'exercise': completed = action === 'exercise'; break;
            case 'journal': completed = action === 'journal'; break;
            case 'gratitude': completed = action === 'gratitude'; break;
            case 'mood_3':
                state.dailyProgress.moodCount = (state.dailyProgress.moodCount || 0) + (action === 'mood' ? 1 : 0);
                completed = state.dailyProgress.moodCount >= 3;
                break;
            case 'exercises_2':
                state.dailyProgress.exCount = (state.dailyProgress.exCount || 0) + (action === 'exercise' ? 1 : 0);
                completed = state.dailyProgress.exCount >= 2;
                break;
            case 'new_category': completed = action === 'new_category'; break;
            case 'shadow_exercise': completed = action === 'shadow_exercise'; break;
            case 'morning': completed = action === 'morning'; break;
            case 'full_day':
                if (action === 'audit') state.dailyProgress.hasAudit = true;
                if (action === 'exercise') state.dailyProgress.hasExercise = true;
                if (action === 'journal') state.dailyProgress.hasJournal = true;
                completed = state.dailyProgress.hasAudit && state.dailyProgress.hasExercise && state.dailyProgress.hasJournal;
                break;
        }

        if (completed) {
            state.dailyProgress.completed = true;
            saveState();
            addXP(challenge.xpReward, 'Défi: ' + challenge.title);
            showChallengeCelebration(challenge, 'daily');
        } else {
            saveState();
        }
    }

    function updateWeeklyProgress(action) {
        if (!state) loadState();
        if (!state.weeklyChallenge || isWeeklyChallengeComplete()) return;
        if (!state.weeklyProgress) state.weeklyProgress = {};

        var challenge = state.weeklyChallenge;
        var completed = false;

        switch (challenge.action) {
            case 'exercises_5_week':
                state.weeklyProgress.exCount = (state.weeklyProgress.exCount || 0) + (action === 'exercise' ? 1 : 0);
                completed = state.weeklyProgress.exCount >= 5;
                break;
            case 'streak_7_week':
                completed = state.streak && state.streak.current >= 7;
                break;
            case 'audits_3_week':
                state.weeklyProgress.auditCount = (state.weeklyProgress.auditCount || 0) + (action === 'audit' ? 1 : 0);
                completed = state.weeklyProgress.auditCount >= 3;
                break;
            case 'variety_3_week':
                if (!state.weeklyProgress.cats) state.weeklyProgress.cats = [];
                if (action.startsWith('cat_') && state.weeklyProgress.cats.indexOf(action) === -1) {
                    state.weeklyProgress.cats.push(action);
                }
                completed = state.weeklyProgress.cats.length >= 3;
                break;
            case 'journal_5_week':
                state.weeklyProgress.journalCount = (state.weeklyProgress.journalCount || 0) + (action === 'journal' ? 1 : 0);
                completed = state.weeklyProgress.journalCount >= 5;
                break;
        }

        if (completed) {
            state.weeklyProgress.completed = true;
            saveState();
            addXP(challenge.xpReward, 'Défi hebdo: ' + challenge.title);
            showChallengeCelebration(challenge, 'weekly');
        } else {
            saveState();
        }
    }

    // =========================================================================
    // EVENT TRACKING (called by PaPremiumUI)
    // =========================================================================

    function onAuditComplete(score) {
        if (!state) loadState();
        state.stats.totalAudits++;
        if (score > state.stats.highestScore) state.stats.highestScore = score;
        if (score < state.stats.lowestScore) state.stats.lowestScore = score;

        // Check comeback badge
        if (state.stats.lastScore !== null && state.stats.lastScore < 40 && score > 75) {
            awardBadge('score_comeback');
        }
        // Check improvement badge
        if (state.stats.lastScore !== null && score - state.stats.lastScore >= 20) {
            awardBadge('score_improve_20');
        }
        // Check score badge
        if (score > 80) awardBadge('score_80');

        state.stats.lastScore = score;
        if (state.stats.totalAudits === 1) awardBadge('first_audit');

        recordActivity();
        checkTimeBadges();
        checkAuditBadges();
        addXP(50, 'Audit complété');
        updateDailyProgress('audit');
        updateWeeklyProgress('audit');
        saveState();
    }

    function onExerciseComplete(exerciseId, categoryId) {
        if (!state) loadState();
        state.stats.totalExercises++;
        if (state.stats.totalExercises === 1) awardBadge('first_exercise');

        recordActivity();
        checkTimeBadges();
        checkExerciseBadges();
        if (categoryId) checkCategoryBadges(categoryId);

        // Check if shadow exercise
        var isShadow = categoryId === 'shadow';
        var isMorning = new Date().getHours() < 9;

        addXP(15, 'Exercice: ' + (exerciseId || ''));
        updateDailyProgress('exercise');
        updateWeeklyProgress('exercise');
        if (isShadow) updateDailyProgress('shadow_exercise');
        if (isMorning) updateDailyProgress('morning');
        if (categoryId) updateWeeklyProgress('cat_' + categoryId);

        // Check new category
        if (categoryId && state.stats.categoriesExplored &&
            state.stats.categoriesExplored.indexOf(categoryId) === -1) {
            updateDailyProgress('new_category');
        }

        saveState();
    }

    function onJournalSave(gratitudeCount) {
        if (!state) loadState();
        state.stats.totalJournals++;
        state.stats.totalGratitudes += (gratitudeCount || 0);
        if (state.stats.totalJournals === 1) awardBadge('first_journal');
        if (gratitudeCount >= 3 && !hasBadge('first_gratitude')) awardBadge('first_gratitude');

        recordActivity();
        checkTimeBadges();
        checkJournalBadges();
        checkGratitudeBadges();
        addXP(20, 'Journal sauvegardé');
        if (gratitudeCount >= 3) {
            addXP(10, 'Gratitudes');
            updateDailyProgress('gratitude');
        }
        updateDailyProgress('journal');
        updateWeeklyProgress('journal');
        saveState();
    }

    function onMoodLog() {
        if (!state) loadState();
        state.stats.totalMoods++;
        if (state.stats.totalMoods === 1) awardBadge('first_mood');
        recordActivity();
        addXP(5, 'Humeur enregistrée');
        updateDailyProgress('mood');
        saveState();
    }

    // =========================================================================
    // CELEBRATION ANIMATIONS
    // =========================================================================

    function showXPToast(amount, reason) {
        var toast = document.createElement('div');
        toast.className = 'pa-xp-toast';
        toast.innerHTML = '<span class="pa-xp-amount">+' + amount + ' XP</span>' +
            (reason ? '<span class="pa-xp-reason">' + reason + '</span>' : '');
        document.body.appendChild(toast);

        requestAnimationFrame(function() {
            toast.classList.add('show');
            setTimeout(function() {
                toast.classList.add('hide');
                setTimeout(function() { toast.remove(); }, 500);
            }, 2000);
        });
    }

    function showLevelUpCelebration(newLevel) {
        var levelData = LEVELS.find(function(l) { return l.level === newLevel; });
        if (!levelData) return;

        var overlay = document.createElement('div');
        overlay.className = 'pa-levelup-overlay';
        overlay.innerHTML = '<div class="pa-levelup-content">' +
            '<div class="pa-levelup-particles"></div>' +
            '<div class="pa-levelup-icon">' + levelData.icon + '</div>' +
            '<div class="pa-levelup-text">NIVEAU ' + newLevel + '</div>' +
            '<div class="pa-levelup-title" style="color:' + levelData.color + '">' + levelData.title + '</div>' +
            '<div class="pa-levelup-subtitle">' + levelData.subtitle + '</div>' +
            '<button class="pa-levelup-btn" onclick="this.closest(\'.pa-levelup-overlay\').remove()">Continuer le voyage</button>' +
            '</div>';

        document.body.appendChild(overlay);
        createParticles(overlay.querySelector('.pa-levelup-particles'), levelData.color);

        requestAnimationFrame(function() { overlay.classList.add('show'); });

        // Auto-dismiss after 5s
        setTimeout(function() {
            if (overlay.parentNode) {
                overlay.classList.add('hide');
                setTimeout(function() { overlay.remove(); }, 600);
            }
        }, 5000);
    }

    function showBadgeCelebration(badge) {
        var rarityColors = { common: '#9ca3af', uncommon: '#22c55e', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b' };
        var rarityLabels = { common: 'Commun', uncommon: 'Peu commun', rare: 'Rare', epic: 'Épique', legendary: 'Légendaire' };
        var color = rarityColors[badge.rarity] || '#9ca3af';

        var toast = document.createElement('div');
        toast.className = 'pa-badge-toast rarity-' + badge.rarity;
        toast.innerHTML = '<div class="pa-badge-toast-inner">' +
            '<div class="pa-badge-toast-icon">' + badge.icon + '</div>' +
            '<div class="pa-badge-toast-info">' +
            '<div class="pa-badge-toast-label" style="color:' + color + '">Badge débloqué!</div>' +
            '<div class="pa-badge-toast-title">' + badge.title + '</div>' +
            '<div class="pa-badge-toast-desc">' + badge.description + '</div>' +
            '<div class="pa-badge-toast-rarity" style="color:' + color + '">' + (rarityLabels[badge.rarity] || '') +
            (badge.xpReward > 0 ? ' · +' + badge.xpReward + ' XP' : '') + '</div>' +
            '</div></div>';

        document.body.appendChild(toast);
        requestAnimationFrame(function() {
            toast.classList.add('show');
            setTimeout(function() {
                toast.classList.add('hide');
                setTimeout(function() { toast.remove(); }, 600);
            }, 4000);
        });
    }

    function showChallengeCelebration(challenge, type) {
        var toast = document.createElement('div');
        toast.className = 'pa-challenge-toast';
        toast.innerHTML = '<div class="pa-challenge-toast-inner">' +
            '<div class="pa-challenge-toast-icon">' + challenge.icon + '</div>' +
            '<div class="pa-challenge-toast-info">' +
            '<div class="pa-challenge-toast-label">Défi ' + (type === 'weekly' ? 'hebdo' : 'du jour') + ' accompli!</div>' +
            '<div class="pa-challenge-toast-title">' + challenge.title + '</div>' +
            '<div class="pa-challenge-toast-xp">+' + challenge.xpReward + ' XP</div>' +
            '</div></div>';

        document.body.appendChild(toast);
        requestAnimationFrame(function() {
            toast.classList.add('show');
            setTimeout(function() {
                toast.classList.add('hide');
                setTimeout(function() { toast.remove(); }, 600);
            }, 3500);
        });
    }

    function createParticles(container, color) {
        if (!container) return;
        var emojis = ['✨', '🌟', '⭐', '💫', '🎆', '🎇'];
        for (var i = 0; i < 20; i++) {
            var p = document.createElement('div');
            p.className = 'pa-particle';
            p.textContent = emojis[i % emojis.length];
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDelay = (Math.random() * 0.5) + 's';
            p.style.animationDuration = (1 + Math.random() * 2) + 's';
            container.appendChild(p);
        }
    }

    // =========================================================================
    // UI RENDERING HELPERS
    // =========================================================================

    function renderXPBar() {
        if (!state) loadState();
        var level = getCurrentLevel();
        var progress = getLevelProgress();
        var next = getNextLevel();

        return '<div class="pa-xp-bar-wrapper">' +
            '<div class="pa-xp-header">' +
            '<div class="pa-xp-level">' +
            '<span class="pa-xp-level-icon">' + level.icon + '</span>' +
            '<span class="pa-xp-level-num">Niv. ' + state.level + '</span>' +
            '<span class="pa-xp-level-title">' + level.title + '</span>' +
            '</div>' +
            '<div class="pa-xp-value">' + state.xp + ' XP</div>' +
            '</div>' +
            '<div class="pa-xp-bar">' +
            '<div class="pa-xp-fill" style="width:' + progress.percent + '%; background: linear-gradient(90deg, ' + level.color + ', ' + (next ? next.color : level.color) + ')"></div>' +
            '<div class="pa-xp-glow" style="left:' + progress.percent + '%"></div>' +
            '</div>' +
            '<div class="pa-xp-footer">' +
            '<span class="pa-xp-progress">' + progress.xpCurrent + ' / ' + progress.xpNeeded + ' XP</span>' +
            (next ? '<span class="pa-xp-next">Prochain: ' + next.icon + ' ' + next.title + '</span>' : '<span class="pa-xp-max">Niveau maximum!</span>') +
            '</div>' +
            '</div>';
    }

    function renderStreak() {
        if (!state) loadState();
        var streak = state.streak.current;
        var flameClass = streak >= 30 ? 'inferno' : streak >= 14 ? 'blazing' : streak >= 7 ? 'burning' : streak >= 3 ? 'warm' : 'cold';

        return '<div class="pa-streak-widget ' + flameClass + '">' +
            '<div class="pa-streak-flame">' +
            (streak > 0 ? '<span class="pa-flame-icon">🔥</span>' : '<span class="pa-flame-icon cold">❄️</span>') +
            '</div>' +
            '<div class="pa-streak-info">' +
            '<span class="pa-streak-count">' + streak + '</span>' +
            '<span class="pa-streak-label">' + (streak === 1 ? 'jour' : 'jours') + '</span>' +
            '</div>' +
            '<div class="pa-streak-best">Record: ' + state.streak.best + '</div>' +
            '</div>';
    }

    function renderDailyChallenge() {
        if (!state) loadState();
        var challenge = state.dailyChallenge;
        if (!challenge) return '';
        var done = isDailyChallengeComplete();

        return '<div class="pa-challenge-card ' + (done ? 'completed' : '') + '">' +
            '<div class="pa-challenge-type">Défi du jour</div>' +
            '<div class="pa-challenge-row">' +
            '<span class="pa-challenge-icon">' + challenge.icon + '</span>' +
            '<div class="pa-challenge-info">' +
            '<div class="pa-challenge-title">' + challenge.title + '</div>' +
            '<div class="pa-challenge-desc">' + challenge.description + '</div>' +
            '</div>' +
            '<div class="pa-challenge-reward">' +
            (done ? '<span class="pa-challenge-done">✓</span>' : '<span class="pa-challenge-xp">+' + challenge.xpReward + '</span>') +
            '</div>' +
            '</div>' +
            '</div>';
    }

    function renderWeeklyChallenge() {
        if (!state) loadState();
        var challenge = state.weeklyChallenge;
        if (!challenge) return '';
        var done = isWeeklyChallengeComplete();

        return '<div class="pa-challenge-card weekly ' + (done ? 'completed' : '') + '">' +
            '<div class="pa-challenge-type">Défi de la semaine</div>' +
            '<div class="pa-challenge-row">' +
            '<span class="pa-challenge-icon">' + challenge.icon + '</span>' +
            '<div class="pa-challenge-info">' +
            '<div class="pa-challenge-title">' + challenge.title + '</div>' +
            '<div class="pa-challenge-desc">' + challenge.description + '</div>' +
            '</div>' +
            '<div class="pa-challenge-reward">' +
            (done ? '<span class="pa-challenge-done">✓</span>' : '<span class="pa-challenge-xp">+' + challenge.xpReward + '</span>') +
            '</div>' +
            '</div>' +
            '</div>';
    }

    function renderBadgeWall() {
        if (!state) loadState();
        var rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
        var sorted = BADGES.slice().sort(function(a, b) { return rarityOrder[a.rarity] - rarityOrder[b.rarity]; });
        var rarityColors = { common: '#9ca3af', uncommon: '#22c55e', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b' };

        var html = '<div class="pa-badge-wall">';
        html += '<div class="pa-badge-stats">' +
            '<span class="pa-badges-earned">' + state.badges.length + '</span>' +
            '<span class="pa-badges-total">/ ' + BADGES.length + ' badges</span>' +
            '</div>';
        html += '<div class="pa-badge-grid">';

        sorted.forEach(function(badge) {
            var earned = hasBadge(badge.id);
            var color = rarityColors[badge.rarity];
            html += '<div class="pa-badge-item ' + (earned ? 'earned' : 'locked') + ' rarity-' + badge.rarity + '" title="' + badge.description + '">' +
                '<div class="pa-badge-icon-wrap" style="' + (earned ? 'border-color:' + color + '; box-shadow: 0 0 12px ' + color + '40' : '') + '">' +
                '<span class="pa-badge-icon">' + (earned ? badge.icon : '🔒') + '</span>' +
                '</div>' +
                '<div class="pa-badge-name">' + badge.title + '</div>' +
                '</div>';
        });

        html += '</div></div>';
        return html;
    }

    function renderStatsOverview() {
        if (!state) loadState();
        return '<div class="pa-stats-grid">' +
            renderStatItem('🧠', 'Audits', state.stats.totalAudits) +
            renderStatItem('🎯', 'Exercices', state.stats.totalExercises) +
            renderStatItem('📝', 'Journaux', state.stats.totalJournals) +
            renderStatItem('🙏', 'Gratitudes', state.stats.totalGratitudes) +
            renderStatItem('🔥', 'Meilleur streak', state.stats ? state.streak.best : 0) +
            renderStatItem('⭐', 'Meilleur score', state.stats.highestScore || 0) +
            '</div>';
    }

    function renderStatItem(icon, label, value) {
        return '<div class="pa-stat-item">' +
            '<div class="pa-stat-icon">' + icon + '</div>' +
            '<div class="pa-stat-value">' + value + '</div>' +
            '<div class="pa-stat-label">' + label + '</div>' +
            '</div>';
    }

    // =========================================================================
    // UTILITY
    // =========================================================================

    function getWeekId() {
        var d = new Date();
        var onejan = new Date(d.getFullYear(), 0, 1);
        var week = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
        return d.getFullYear() + '-W' + week;
    }

    function hashDate(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    // =========================================================================
    // PUBLIC API
    // =========================================================================

    return {
        // Core
        loadState: loadState,
        getState: getState,
        addXP: addXP,
        getCurrentLevel: getCurrentLevel,
        getNextLevel: getNextLevel,
        getLevelProgress: getLevelProgress,

        // Events
        onAuditComplete: onAuditComplete,
        onExerciseComplete: onExerciseComplete,
        onJournalSave: onJournalSave,
        onMoodLog: onMoodLog,

        // Badges
        awardBadge: awardBadge,
        hasBadge: hasBadge,

        // Streak
        recordActivity: recordActivity,

        // Challenges
        getDailyChallenge: getDailyChallenge,
        getWeeklyChallenge: getWeeklyChallenge,
        isDailyChallengeComplete: isDailyChallengeComplete,
        isWeeklyChallengeComplete: isWeeklyChallengeComplete,

        // UI Helpers
        renderXPBar: renderXPBar,
        renderStreak: renderStreak,
        renderDailyChallenge: renderDailyChallenge,
        renderWeeklyChallenge: renderWeeklyChallenge,
        renderBadgeWall: renderBadgeWall,
        renderStatsOverview: renderStatsOverview,

        // Config
        LEVELS: LEVELS,
        BADGES: BADGES
    };
})();

if (typeof window !== 'undefined') {
    window.PaGamification = PaGamification;
}
