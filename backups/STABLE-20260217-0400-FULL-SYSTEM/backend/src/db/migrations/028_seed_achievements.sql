-- Migration: 028_seed_achievements
-- Description: Seed 30 initial achievements across 7 categories
-- Created: 2026-02-13

-- ============================================================================
-- SEED ACHIEVEMENTS - 30 achievements répartis en 7 catégories
-- ============================================================================

-- Catégorie 1: DÉBUTANT (Common - 5 achievements)
-- Objectif : Premiers pas dans l'application

INSERT INTO achievements (id, name, description, icon, category, xp_reward, coin_reward, condition, is_secret, rarity) VALUES
(
    '00000000-0000-4000-a000-000000000001',
    'Première Tâche',
    'Créez votre toute première tâche',
    '📝',
    'productivity',
    10,
    5,
    '{"type": "task_created", "count": 1}',
    false,
    'common'
),
(
    '00000000-0000-4000-a000-000000000002',
    'Tâche Accomplie',
    'Complétez votre première tâche',
    '✅',
    'productivity',
    25,
    10,
    '{"type": "task_completed", "count": 1}',
    false,
    'common'
),
(
    '00000000-0000-4000-a000-000000000003',
    'Premier Projet',
    'Créez votre premier projet',
    '📁',
    'productivity',
    20,
    10,
    '{"type": "project_created", "count": 1}',
    false,
    'common'
),
(
    '00000000-0000-4000-a000-000000000004',
    'Première Note',
    'Créez votre première note',
    '📄',
    'productivity',
    15,
    5,
    '{"type": "note_created", "count": 1}',
    false,
    'common'
),
(
    '00000000-0000-4000-a000-000000000005',
    'Bienvenue',
    'Connectez-vous pour la première fois',
    '👋',
    'special',
    50,
    20,
    '{"type": "login_bonus", "count": 1}',
    false,
    'common'
);

-- Catégorie 2: EXPLORATEUR (Common/Rare - 5 achievements)
-- Objectif : Découvrir toutes les fonctionnalités

INSERT INTO achievements (id, name, description, icon, category, xp_reward, coin_reward, condition, is_secret, rarity) VALUES
(
    '00000000-0000-4000-a000-000000000006',
    'Touche-à-tout',
    'Créez 10 tâches',
    '🎯',
    'productivity',
    50,
    25,
    '{"type": "task_created", "count": 10}',
    false,
    'common'
),
(
    '00000000-0000-4000-a000-000000000007',
    'Organisé',
    'Créez 5 projets différents',
    '🗂️',
    'productivity',
    75,
    35,
    '{"type": "project_created", "count": 5}',
    false,
    'rare'
),
(
    '00000000-0000-4000-a000-000000000008',
    'Écrivain',
    'Créez 20 notes',
    '✍️',
    'productivity',
    100,
    40,
    '{"type": "note_created", "count": 20}',
    false,
    'rare'
),
(
    '00000000-0000-4000-a000-000000000009',
    'Communicateur',
    'Envoyez 10 messages dans TeamTalk',
    '💬',
    'social',
    60,
    30,
    '{"type": "message_sent", "count": 10}',
    false,
    'common'
),
(
    '00000000-0000-4000-a000-000000000010',
    'Pomodoro Novice',
    'Complétez 5 sessions Pomodoro',
    '🍅',
    'productivity',
    80,
    35,
    '{"type": "pomodoro_completed", "count": 5}',
    false,
    'rare'
);

-- Catégorie 3: PRODUCTIF (Rare - 5 achievements)
-- Objectif : Devenir vraiment productif

INSERT INTO achievements (id, name, description, icon, category, xp_reward, coin_reward, condition, is_secret, rarity) VALUES
(
    '00000000-0000-4000-a000-000000000011',
    'Machine à Tâches',
    'Complétez 50 tâches',
    '⚡',
    'productivity',
    200,
    75,
    '{"type": "task_completed", "count": 50}',
    false,
    'rare'
),
(
    '00000000-0000-4000-a000-000000000012',
    'Marathon Productif',
    'Complétez 10 tâches en une seule journée',
    '🏃',
    'productivity',
    150,
    60,
    '{"type": "task_completed_daily", "count": 10}',
    false,
    'rare'
),
(
    '00000000-0000-4000-a000-000000000013',
    'Bibliothèque Vivante',
    'Créez 50 notes',
    '📚',
    'productivity',
    180,
    70,
    '{"type": "note_created", "count": 50}',
    false,
    'rare'
),
(
    '00000000-0000-4000-a000-000000000014',
    'Chef de Projet',
    'Complétez un projet de A à Z',
    '🎬',
    'productivity',
    250,
    100,
    '{"type": "project_completed", "count": 1}',
    false,
    'rare'
),
(
    '00000000-0000-4000-a000-000000000015',
    'Focus Master',
    'Complétez 25 sessions Pomodoro',
    '🔥',
    'productivity',
    220,
    85,
    '{"type": "pomodoro_completed", "count": 25}',
    false,
    'rare'
);

-- Catégorie 4: SOCIAL (Rare - 4 achievements)
-- Objectif : Collaborer avec l'équipe

INSERT INTO achievements (id, name, description, icon, category, xp_reward, coin_reward, condition, is_secret, rarity) VALUES
(
    '00000000-0000-4000-a000-000000000016',
    'Networker',
    'Envoyez 50 messages dans TeamTalk',
    '🌐',
    'social',
    150,
    60,
    '{"type": "message_sent", "count": 50}',
    false,
    'rare'
),
(
    '00000000-0000-4000-a000-000000000017',
    'Team Player',
    'Assignez 10 tâches à des collègues',
    '🤝',
    'social',
    180,
    70,
    '{"type": "task_assigned", "count": 10}',
    false,
    'rare'
),
(
    '00000000-0000-4000-a000-000000000018',
    'Rapporteur',
    'Générez 5 rapports d''analyse',
    '📊',
    'productivity',
    200,
    80,
    '{"type": "report_generated", "count": 5}',
    false,
    'rare'
),
(
    '00000000-0000-4000-a000-000000000019',
    'Mentor',
    'Aidez 3 collègues à compléter leurs tâches',
    '🎓',
    'social',
    250,
    100,
    '{"type": "tasks_helped", "count": 3}',
    false,
    'rare'
);

-- Catégorie 5: EXPERT (Epic - 5 achievements)
-- Objectif : Maîtriser l'application

INSERT INTO achievements (id, name, description, icon, category, xp_reward, coin_reward, condition, is_secret, rarity) VALUES
(
    '00000000-0000-4000-a000-000000000020',
    'Centurion',
    'Complétez 100 tâches',
    '💯',
    'productivity',
    500,
    200,
    '{"type": "task_completed", "count": 100}',
    false,
    'epic'
),
(
    '00000000-0000-4000-a000-000000000021',
    'Encyclopédie',
    'Créez 100 notes',
    '📖',
    'productivity',
    450,
    180,
    '{"type": "note_created", "count": 100}',
    false,
    'epic'
),
(
    '00000000-0000-4000-a000-000000000022',
    'Architecte',
    'Créez 15 projets',
    '🏗️',
    'productivity',
    400,
    160,
    '{"type": "project_created", "count": 15}',
    false,
    'epic'
),
(
    '00000000-0000-4000-a000-000000000023',
    'Focus Olympien',
    'Complétez 100 sessions Pomodoro',
    '⚜️',
    'productivity',
    600,
    250,
    '{"type": "pomodoro_completed", "count": 100}',
    false,
    'epic'
),
(
    '00000000-0000-4000-a000-000000000024',
    'Niveau 10',
    'Atteignez le niveau 10',
    '🔟',
    'special',
    1000,
    400,
    '{"type": "level_reached", "value": 10}',
    false,
    'epic'
);

-- Catégorie 6: MAÎTRE (Epic - 4 achievements)
-- Objectif : Devenir un maître de la productivité

INSERT INTO achievements (id, name, description, icon, category, xp_reward, coin_reward, condition, is_secret, rarity) VALUES
(
    '00000000-0000-4000-a000-000000000025',
    'Série de Feu',
    'Maintenez une série de connexion de 7 jours',
    '🔥',
    'streak',
    300,
    120,
    '{"type": "login_streak", "count": 7}',
    false,
    'epic'
),
(
    '00000000-0000-4000-a000-000000000026',
    'Marathonien',
    'Maintenez une série de connexion de 30 jours',
    '🏅',
    'streak',
    800,
    350,
    '{"type": "login_streak", "count": 30}',
    false,
    'epic'
),
(
    '00000000-0000-4000-a000-000000000027',
    'Productivité Extrême',
    'Gagnez 10,000 XP au total',
    '💫',
    'special',
    1500,
    600,
    '{"type": "total_xp", "value": 10000}',
    false,
    'epic'
),
(
    '00000000-0000-4000-a000-000000000028',
    'Collectionneur',
    'Débloquez 20 achievements',
    '🏆',
    'special',
    1000,
    450,
    '{"type": "achievements_unlocked", "count": 20}',
    false,
    'epic'
);

-- Catégorie 7: LÉGENDE (Legendary - 2 achievements)
-- Objectif : Rejoindre les légendes

INSERT INTO achievements (id, name, description, icon, category, xp_reward, coin_reward, condition, is_secret, rarity) VALUES
(
    '00000000-0000-4000-a000-000000000029',
    'Légende Vivante',
    'Atteignez le niveau 50',
    '👑',
    'special',
    5000,
    2000,
    '{"type": "level_reached", "value": 50}',
    false,
    'legendary'
),
(
    '00000000-0000-4000-a000-000000000030',
    'Immortel',
    'Maintenez une série de connexion de 365 jours',
    '💎',
    'streak',
    10000,
    5000,
    '{"type": "login_streak", "count": 365}',
    false,
    'legendary'
);

-- ============================================================================
-- INDEXES for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);
CREATE INDEX IF NOT EXISTS idx_achievements_unlocked_user ON achievements_unlocked(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_unlocked_achievement ON achievements_unlocked(achievement_id);

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- Total: 30 achievements
-- Débutant (Common): 5 achievements
-- Explorateur (Common/Rare): 5 achievements
-- Productif (Rare): 5 achievements
-- Social (Rare): 4 achievements
-- Expert (Epic): 5 achievements
-- Maître (Epic): 4 achievements
-- Légende (Legendary): 2 achievements

-- Rarity breakdown:
-- Common: 7 achievements
-- Rare: 11 achievements
-- Epic: 10 achievements
-- Legendary: 2 achievements

-- Category breakdown:
-- Productivity: 16 achievements
-- Social: 4 achievements
-- Streak: 3 achievements
-- Special: 7 achievements
