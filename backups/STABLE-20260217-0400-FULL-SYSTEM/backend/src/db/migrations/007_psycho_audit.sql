-- Migration: 007_psycho_audit
-- Description: Create psycho-audit tables (Human Design, Journal, Audit Reports)
-- Created: 2024-01-15

-- Create enum types for psycho-audit
CREATE TYPE human_design_type AS ENUM (
    'generator', 'manifesting_generator', 'projector', 'manifestor', 'reflector'
);
CREATE TYPE audit_report_type AS ENUM ('quick', 'standard', 'deep', 'comprehensive');
CREATE TYPE audit_report_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Human Design profiles table
CREATE TABLE human_design_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    type human_design_type NOT NULL,
    authority VARCHAR(100) NOT NULL,
    profile VARCHAR(50) NOT NULL,
    definition VARCHAR(100),
    centers JSONB NOT NULL DEFAULT '{}',
    channels JSONB DEFAULT '[]',
    gates JSONB DEFAULT '[]',
    incarnation_cross VARCHAR(255),
    variables JSONB DEFAULT '{}',
    birth_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal entries table
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    content TEXT,
    mood INTEGER CHECK (mood >= 1 AND mood <= 10),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
    tags JSONB DEFAULT '[]',
    weather JSONB,
    highlights JSONB DEFAULT '[]',
    challenges JSONB DEFAULT '[]',
    gratitude JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, workspace_id, date)
);

-- Audit reports table
CREATE TABLE audit_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    report_type audit_report_type NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status audit_report_status DEFAULT 'pending',
    analysis_therapeutic JSONB,
    analysis_spiritual JSONB,
    analysis_strategic JSONB,
    synthesis JSONB,
    recommendations JSONB,
    pdf_url TEXT,
    processing_time_ms INTEGER,
    llm_model_used VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mood tracking history (separate from journal for quick mood checks)
CREATE TABLE mood_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 10),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    note TEXT,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reflection prompts table
CREATE TABLE reflection_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    prompt_text TEXT NOT NULL,
    human_design_types human_design_type[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User reflections (answers to prompts)
CREATE TABLE user_reflections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES reflection_prompts(id) ON DELETE SET NULL,
    prompt_text TEXT NOT NULL,
    response TEXT NOT NULL,
    insights JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_human_design_profiles_type ON human_design_profiles(type);

CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_workspace_id ON journal_entries(workspace_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(date DESC);
CREATE INDEX idx_journal_entries_tags ON journal_entries USING GIN(tags);

CREATE INDEX idx_audit_reports_user_id ON audit_reports(user_id);
CREATE INDEX idx_audit_reports_workspace_id ON audit_reports(workspace_id);
CREATE INDEX idx_audit_reports_status ON audit_reports(status);
CREATE INDEX idx_audit_reports_created_at ON audit_reports(created_at DESC);

CREATE INDEX idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX idx_mood_entries_workspace_id ON mood_entries(workspace_id);
CREATE INDEX idx_mood_entries_created_at ON mood_entries(created_at DESC);

CREATE INDEX idx_reflection_prompts_category ON reflection_prompts(category);
CREATE INDEX idx_reflection_prompts_hd_types ON reflection_prompts USING GIN(human_design_types);

CREATE INDEX idx_user_reflections_user_id ON user_reflections(user_id);
CREATE INDEX idx_user_reflections_workspace_id ON user_reflections(workspace_id);

-- Triggers
CREATE TRIGGER update_human_design_profiles_updated_at
    BEFORE UPDATE ON human_design_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed some default reflection prompts
INSERT INTO reflection_prompts (category, prompt_text, human_design_types) VALUES
('morning', 'Quelle est ton intention principale pour aujourd''hui?', NULL),
('morning', 'Comment te sens-tu en ce début de journée?', NULL),
('evening', 'Qu''as-tu accompli aujourd''hui dont tu es fier?', NULL),
('evening', 'Qu''est-ce que tu aurais pu faire différemment?', NULL),
('generator', 'As-tu répondu à des opportunités qui t''excitent aujourd''hui?', ARRAY['generator', 'manifesting_generator']::human_design_type[]),
('projector', 'As-tu attendu une invitation avant d''agir sur un projet important?', ARRAY['projector']::human_design_type[]),
('manifestor', 'As-tu informé les personnes concernées de tes actions?', ARRAY['manifestor']::human_design_type[]),
('reflector', 'Comment l''environnement autour de toi a-t-il influencé ta journée?', ARRAY['reflector']::human_design_type[]),
('weekly', 'Quels patterns as-tu observés cette semaine?', NULL),
('gratitude', 'Cite 3 choses pour lesquelles tu es reconnaissant aujourd''hui.', NULL);
