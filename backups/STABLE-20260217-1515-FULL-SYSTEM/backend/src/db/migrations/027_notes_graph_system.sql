-- Migration 027: Notes Graph System
-- Adds AI classification, auto-linking, knowledge paths, and layout caching

BEGIN;

-- AI classifications for notes
CREATE TABLE IF NOT EXISTS note_classifications (
    note_id UUID PRIMARY KEY REFERENCES notes(id) ON DELETE CASCADE,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    keywords JSONB DEFAULT '[]',
    confidence DECIMAL(3,2) CHECK (confidence BETWEEN 0 AND 1),
    ai_summary TEXT,
    classified_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE note_classifications IS 'AI-generated classifications for notes';
COMMENT ON COLUMN note_classifications.category IS 'Primary category: technical, creative, planning, research, personal, reference, meeting, idea';
COMMENT ON COLUMN note_classifications.keywords IS 'AI-extracted keywords (array of strings)';
COMMENT ON COLUMN note_classifications.confidence IS 'AI confidence score (0.00-1.00)';

-- Auto-generated links (AI-discovered relationships)
CREATE TABLE IF NOT EXISTS note_auto_links (
    source_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    target_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    link_type VARCHAR(50) DEFAULT 'semantic',
    strength DECIMAL(3,2) CHECK (strength BETWEEN 0 AND 1),
    ai_reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (source_note_id, target_note_id),
    CHECK (source_note_id != target_note_id)
);

COMMENT ON TABLE note_auto_links IS 'AI-generated relationships between notes';
COMMENT ON COLUMN note_auto_links.link_type IS 'Type: semantic, reference, concept, prerequisite, expands';
COMMENT ON COLUMN note_auto_links.strength IS 'Relationship strength (0.00-1.00)';
COMMENT ON COLUMN note_auto_links.ai_reasoning IS 'Why AI created this link';

-- Knowledge paths (AI-generated or manual)
CREATE TABLE IF NOT EXISTS knowledge_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    note_ids UUID[] NOT NULL,
    path_type VARCHAR(50),
    ai_generated BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (array_length(note_ids, 1) >= 2)
);

COMMENT ON TABLE knowledge_paths IS 'Ordered sequences of notes forming learning/research paths';
COMMENT ON COLUMN knowledge_paths.note_ids IS 'Ordered array of note IDs';
COMMENT ON COLUMN knowledge_paths.path_type IS 'Type: learning, project, research, analysis';

-- Graph layout cache (pre-computed positions)
CREATE TABLE IF NOT EXISTS note_graph_layout (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    layout_data JSONB NOT NULL,
    force_layout_iterations INTEGER DEFAULT 100,
    computed_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE note_graph_layout IS 'Cached 3D graph layouts for performance';
COMMENT ON COLUMN note_graph_layout.layout_data IS 'JSON: { nodes: [{id, position: {x,y,z}}], edges: [...] }';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_note_classifications_category
    ON note_classifications(category);

CREATE INDEX IF NOT EXISTS idx_note_classifications_updated
    ON note_classifications(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_note_auto_links_source
    ON note_auto_links(source_note_id);

CREATE INDEX IF NOT EXISTS idx_note_auto_links_target
    ON note_auto_links(target_note_id);

CREATE INDEX IF NOT EXISTS idx_note_auto_links_strength
    ON note_auto_links(strength DESC);

CREATE INDEX IF NOT EXISTS idx_note_auto_links_created
    ON note_auto_links(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_paths_workspace
    ON knowledge_paths(workspace_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_paths_created_by
    ON knowledge_paths(created_by);

CREATE INDEX IF NOT EXISTS idx_knowledge_paths_type
    ON knowledge_paths(path_type);

CREATE INDEX IF NOT EXISTS idx_note_graph_layout_computed
    ON note_graph_layout(computed_at DESC);

-- GIN index for keyword searches
CREATE INDEX IF NOT EXISTS idx_note_classifications_keywords_gin
    ON note_classifications USING gin(keywords);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_note_classifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for note_classifications
DROP TRIGGER IF EXISTS trigger_update_note_classifications_updated_at
    ON note_classifications;

CREATE TRIGGER trigger_update_note_classifications_updated_at
    BEFORE UPDATE ON note_classifications
    FOR EACH ROW
    EXECUTE FUNCTION update_note_classifications_updated_at();

-- Function to update knowledge_paths updated_at
CREATE OR REPLACE FUNCTION update_knowledge_paths_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for knowledge_paths
DROP TRIGGER IF EXISTS trigger_update_knowledge_paths_updated_at
    ON knowledge_paths;

CREATE TRIGGER trigger_update_knowledge_paths_updated_at
    BEFORE UPDATE ON knowledge_paths
    FOR EACH ROW
    EXECUTE FUNCTION update_knowledge_paths_updated_at();

COMMIT;
