
-- =============================================
-- PRODUCTIVEAPP - LIFE INSIGHTS SYSTEM
-- Migration 028 - Système de tracking intelligent
-- =============================================

-- Table principale : Activity Log (tous les événements)
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_id UUID,

    -- Type d'action
    action_type VARCHAR(100) NOT NULL, -- task_created, note_updated, login, logout, pomodoro_completed, etc.
    entity_type VARCHAR(50), -- task, note, project, pomodoro, etc.
    entity_id VARCHAR(100), -- ID de l'entité (peut être UUID ou integer)

    -- Détails de l'action
    action_label TEXT, -- Label lisible humain de l'action
    metadata JSONB DEFAULT '{}', -- Détails additionnels (titre tâche, tags, etc.)

    -- Contexte
    session_id UUID, -- Pour regrouper les actions d'une session
    device_info JSONB DEFAULT '{}', -- User agent, screen size, etc.
    ip_address INET,

    -- Métriques temps
    duration_seconds INTEGER, -- Durée de l'action si applicable (ex: temps passé sur une tâche)
    created_at TIMESTAMP DEFAULT NOW(),

    -- Index pour performances
    CONSTRAINT activity_log_action_type_check CHECK (action_type IN (
        'login', 'logout', 'session_start', 'session_end',
        'task_created', 'task_updated', 'task_completed', 'task_deleted',
        'note_created', 'note_updated', 'note_deleted',
        'project_created', 'project_updated', 'project_archived',
        'pomodoro_started', 'pomodoro_completed', 'pomodoro_cancelled',
        'message_sent', 'file_uploaded',
        'gamification_xp_earned', 'gamification_level_up',
        'audit_started', 'audit_completed',
        'ai_chat_message', 'ai_suggestion_accepted',
        'theme_changed', 'settings_updated',
        'calendar_event_created', 'calendar_event_updated',
        'invoice_created', 'payment_received',
        'custom' -- Pour actions custom futures
    ))
);

-- Index pour requêtes rapides
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_member_id ON activity_log(member_id);
CREATE INDEX idx_activity_log_action_type ON activity_log(action_type);
CREATE INDEX idx_activity_log_entity_type ON activity_log(entity_type);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_session_id ON activity_log(session_id);
CREATE INDEX idx_activity_log_user_date ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_metadata ON activity_log USING GIN(metadata);

-- Table : Insights comportementaux générés par IA
CREATE TABLE IF NOT EXISTS behavioral_insights (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_id UUID,

    -- Type d'insight
    insight_type VARCHAR(100) NOT NULL,
    insight_category VARCHAR(50) NOT NULL, -- productivity, emotional, social, health, cognitive

    -- Contenu de l'insight
    title TEXT NOT NULL, -- "Votre pic de productivité est à 10h"
    description TEXT NOT NULL, -- Explication détaillée
    recommendation TEXT, -- Conseil actionnable

    -- Données
    insight_data JSONB DEFAULT '{}', -- Données structurées (graphiques, stats)
    confidence_score FLOAT DEFAULT 0.0, -- 0-1 confiance de l'IA
    evidence_count INTEGER DEFAULT 0, -- Nombre d'événements analysés

    -- Métadonnées
    generated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP, -- Certains insights expirent (ex: "semaine chargée")
    is_active BOOLEAN DEFAULT true,
    is_read BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 0, -- 0=low, 1=medium, 2=high, 3=critical

    CONSTRAINT behavioral_insights_category_check CHECK (insight_category IN (
        'productivity', 'emotional', 'social', 'health', 'cognitive', 'motivation', 'stress'
    ))
);

CREATE INDEX idx_behavioral_insights_user_id ON behavioral_insights(user_id);
CREATE INDEX idx_behavioral_insights_member_id ON behavioral_insights(member_id);
CREATE INDEX idx_behavioral_insights_type ON behavioral_insights(insight_type);
CREATE INDEX idx_behavioral_insights_category ON behavioral_insights(insight_category);
CREATE INDEX idx_behavioral_insights_active ON behavioral_insights(is_active) WHERE is_active = true;

-- Table : Patterns utilisateur détectés
CREATE TABLE IF NOT EXISTS user_patterns (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_id UUID,

    -- Type de pattern
    pattern_type VARCHAR(100) NOT NULL,
    pattern_name TEXT NOT NULL,

    -- Données du pattern
    pattern_data JSONB NOT NULL DEFAULT '{}',
    strength FLOAT DEFAULT 0.0, -- 0-1 force du pattern
    frequency VARCHAR(50), -- daily, weekly, monthly

    -- Métadonnées
    first_detected_at TIMESTAMP DEFAULT NOW(),
    last_seen_at TIMESTAMP DEFAULT NOW(),
    occurrence_count INTEGER DEFAULT 1,
    is_positive BOOLEAN, -- true = bon pattern, false = mauvais pattern
    is_active BOOLEAN DEFAULT true,

    CONSTRAINT user_patterns_type_check CHECK (pattern_type IN (
        'peak_hours', 'low_hours', 'task_completion_rhythm',
        'procrastination_trigger', 'productivity_spike', 'burnout_risk',
        'energy_cycle', 'focus_duration', 'break_pattern',
        'social_interaction', 'stress_indicator', 'motivation_driver',
        'custom'
    ))
);

CREATE INDEX idx_user_patterns_user_id ON user_patterns(user_id);
CREATE INDEX idx_user_patterns_member_id ON user_patterns(member_id);
CREATE INDEX idx_user_patterns_type ON user_patterns(pattern_type);
CREATE INDEX idx_user_patterns_active ON user_patterns(is_active) WHERE is_active = true;

-- Table : Snapshots quotidiens (résumé journalier)
CREATE TABLE IF NOT EXISTS daily_snapshots (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_id UUID,
    snapshot_date DATE NOT NULL,

    -- Métriques du jour
    total_actions INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    notes_created INTEGER DEFAULT 0,
    pomodoros_completed INTEGER DEFAULT 0,
    total_active_time_minutes INTEGER DEFAULT 0,

    -- États
    dominant_emotion VARCHAR(50), -- Détecté via patterns
    energy_level INTEGER, -- 1-5
    productivity_score FLOAT, -- 0-100
    stress_score FLOAT, -- 0-100

    -- Top activités
    top_action_types JSONB DEFAULT '[]', -- ['task_completed', 'note_created']
    top_categories JSONB DEFAULT '[]', -- Catégories les plus utilisées

    -- Résumé IA
    ai_summary TEXT, -- "Journée productive avec focus sur projets créatifs"
    highlights JSONB DEFAULT '[]', -- Points forts du jour
    lowlights JSONB DEFAULT '[]', -- Points faibles du jour

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, snapshot_date)
);

CREATE INDEX idx_daily_snapshots_user_id ON daily_snapshots(user_id);
CREATE INDEX idx_daily_snapshots_date ON daily_snapshots(snapshot_date DESC);

-- Table : Profils psychologiques (généré par IA)
CREATE TABLE IF NOT EXISTS psychological_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_id UUID,

    -- Traits de personnalité (Big Five + custom)
    openness_score FLOAT, -- 0-100
    conscientiousness_score FLOAT,
    extraversion_score FLOAT,
    agreeableness_score FLOAT,
    neuroticism_score FLOAT,

    -- Styles de travail
    work_style VARCHAR(50), -- 'deep_focus', 'multitasker', 'sprinter', 'marathoner'
    communication_style VARCHAR(50), -- 'direct', 'collaborative', 'reflective'
    decision_style VARCHAR(50), -- 'analytical', 'intuitive', 'balanced'

    -- Patterns cognitifs
    peak_performance_hours JSONB DEFAULT '[]', -- [9, 10, 11, 14, 15]
    preferred_task_types JSONB DEFAULT '[]', -- ['creative', 'analytical']
    energy_pattern VARCHAR(50), -- 'morning_person', 'night_owl', 'variable'

    -- Motivation & Stress
    primary_motivators JSONB DEFAULT '[]', -- ['achievement', 'autonomy', 'mastery']
    stress_triggers JSONB DEFAULT '[]', -- ['deadlines', 'multitasking']
    coping_strategies JSONB DEFAULT '[]', -- ['breaks', 'exercise', 'music']

    -- Profil narratif IA
    profile_summary TEXT, -- Description complète générée par IA
    strengths JSONB DEFAULT '[]',
    growth_areas JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',

    -- Métadonnées
    confidence_score FLOAT DEFAULT 0.0,
    data_points_analyzed INTEGER DEFAULT 0,
    generated_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT psychological_profiles_work_style_check CHECK (work_style IN (
        'deep_focus', 'multitasker', 'sprinter', 'marathoner', 'balanced', 'adaptive'
    ))
);

CREATE INDEX idx_psychological_profiles_user_id ON psychological_profiles(user_id);

-- Vue : Statistiques temps réel par utilisateur
CREATE OR REPLACE VIEW user_activity_stats AS
SELECT
    user_id,
    member_id,
    COUNT(*) as total_actions,
    COUNT(DISTINCT DATE(created_at)) as active_days,
    COUNT(DISTINCT session_id) as total_sessions,
    COUNT(*) FILTER (WHERE action_type LIKE 'task_%') as task_actions,
    COUNT(*) FILTER (WHERE action_type LIKE 'note_%') as note_actions,
    COUNT(*) FILTER (WHERE action_type = 'pomodoro_completed') as pomodoros_completed,
    MIN(created_at) as first_activity,
    MAX(created_at) as last_activity
FROM activity_log
GROUP BY user_id, member_id;

-- Vue : Timeline journalière
CREATE OR REPLACE VIEW daily_activity_timeline AS
SELECT
    user_id,
    member_id,
    DATE(created_at) as activity_date,
    EXTRACT(HOUR FROM created_at) as activity_hour,
    action_type,
    COUNT(*) as action_count
FROM activity_log
GROUP BY user_id, member_id, DATE(created_at), EXTRACT(HOUR FROM created_at), action_type
ORDER BY activity_date DESC, activity_hour ASC;

-- Fonction : Enregistrer une activité
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_member_id UUID,
    p_action_type VARCHAR,
    p_entity_type VARCHAR DEFAULT NULL,
    p_entity_id VARCHAR DEFAULT NULL,
    p_action_label TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_session_id UUID DEFAULT NULL,
    p_duration_seconds INTEGER DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_log_id INTEGER;
BEGIN
    INSERT INTO activity_log (
        user_id, member_id, action_type, entity_type, entity_id,
        action_label, metadata, session_id, duration_seconds
    ) VALUES (
        p_user_id, p_member_id, p_action_type, p_entity_type, p_entity_id,
        p_action_label, p_metadata, p_session_id, p_duration_seconds
    ) RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Commentaires
COMMENT ON TABLE activity_log IS 'Log automatique de toutes les actions utilisateur';
COMMENT ON TABLE behavioral_insights IS 'Insights comportementaux générés par IA';
COMMENT ON TABLE user_patterns IS 'Patterns détectés dans le comportement utilisateur';
COMMENT ON TABLE daily_snapshots IS 'Snapshots quotidiens agrégés';
COMMENT ON TABLE psychological_profiles IS 'Profils psychologiques générés par IA';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON activity_log TO productive_user;
GRANT SELECT, INSERT, UPDATE ON behavioral_insights TO productive_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_patterns TO productive_user;
GRANT SELECT, INSERT, UPDATE ON daily_snapshots TO productive_user;
GRANT SELECT, INSERT, UPDATE ON psychological_profiles TO productive_user;
GRANT USAGE, SELECT ON SEQUENCE activity_log_id_seq TO productive_user;
GRANT USAGE, SELECT ON SEQUENCE behavioral_insights_id_seq TO productive_user;
GRANT USAGE, SELECT ON SEQUENCE user_patterns_id_seq TO productive_user;
GRANT USAGE, SELECT ON SEQUENCE daily_snapshots_id_seq TO productive_user;
GRANT USAGE, SELECT ON SEQUENCE psychological_profiles_id_seq TO productive_user;
