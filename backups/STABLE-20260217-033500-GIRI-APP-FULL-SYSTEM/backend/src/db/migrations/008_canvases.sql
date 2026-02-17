-- Migration: 008_canvases
-- Description: Create canvas tables (Excalidraw/Galaxie View)
-- Created: 2024-01-15

-- Create enum types for canvases
CREATE TYPE canvas_permission AS ENUM ('view', 'edit');

-- Canvases table
CREATE TABLE canvases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Untitled Canvas',
    thumbnail_url TEXT,
    elements JSONB DEFAULT '[]',
    app_state JSONB DEFAULT '{}',
    is_template BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Canvas collaborators table
CREATE TABLE canvas_collaborators (
    canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission canvas_permission DEFAULT 'view',
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (canvas_id, user_id)
);

-- Canvas versions for history
CREATE TABLE canvas_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    elements JSONB NOT NULL,
    app_state JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Canvas comments (for collaborative feedback)
CREATE TABLE canvas_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    position_x NUMERIC,
    position_y NUMERIC,
    element_id VARCHAR(100),
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Canvas templates library
CREATE TABLE canvas_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    thumbnail_url TEXT,
    elements JSONB NOT NULL DEFAULT '[]',
    app_state JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    use_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_canvases_workspace_id ON canvases(workspace_id);
CREATE INDEX idx_canvases_project_id ON canvases(project_id);
CREATE INDEX idx_canvases_user_id ON canvases(user_id);
CREATE INDEX idx_canvases_is_public ON canvases(is_public);
CREATE INDEX idx_canvases_is_template ON canvases(is_template);

CREATE INDEX idx_canvas_collaborators_user_id ON canvas_collaborators(user_id);
CREATE INDEX idx_canvas_collaborators_canvas_id ON canvas_collaborators(canvas_id);

CREATE INDEX idx_canvas_versions_canvas_id ON canvas_versions(canvas_id);
CREATE INDEX idx_canvas_versions_created_at ON canvas_versions(created_at DESC);

CREATE INDEX idx_canvas_comments_canvas_id ON canvas_comments(canvas_id);
CREATE INDEX idx_canvas_comments_user_id ON canvas_comments(user_id);
CREATE INDEX idx_canvas_comments_element_id ON canvas_comments(element_id);

CREATE INDEX idx_canvas_templates_workspace_id ON canvas_templates(workspace_id);
CREATE INDEX idx_canvas_templates_category ON canvas_templates(category);
CREATE INDEX idx_canvas_templates_is_public ON canvas_templates(is_public);

-- Triggers
CREATE TRIGGER update_canvases_updated_at
    BEFORE UPDATE ON canvases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_comments_updated_at
    BEFORE UPDATE ON canvas_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_templates_updated_at
    BEFORE UPDATE ON canvas_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create a canvas version on significant changes
CREATE OR REPLACE FUNCTION create_canvas_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create version if elements changed significantly (more than just position)
    IF OLD.elements::text IS DISTINCT FROM NEW.elements::text THEN
        INSERT INTO canvas_versions (canvas_id, user_id, elements, app_state)
        VALUES (NEW.id, NEW.user_id, OLD.elements, OLD.app_state);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger can be expensive for frequent updates
-- Consider using a debounced version in the application layer instead
-- CREATE TRIGGER canvases_create_version
--     BEFORE UPDATE OF elements ON canvases
--     FOR EACH ROW
--     EXECUTE FUNCTION create_canvas_version();
