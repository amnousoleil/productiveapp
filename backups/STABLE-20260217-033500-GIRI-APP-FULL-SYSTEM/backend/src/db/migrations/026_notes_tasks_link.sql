-- Migration: 026_notes_tasks_link
-- Description: Link tasks to notes + graph state persistence
-- Created: 2026-02-12

-- Add note_id foreign key to tasks table
-- Allows linking tasks extracted from notes
ALTER TABLE tasks
ADD COLUMN note_id UUID REFERENCES notes(id) ON DELETE SET NULL;

-- Index for fast note → tasks queries
CREATE INDEX idx_tasks_note_id ON tasks(note_id);

-- Graph states table for persisting custom layouts
-- Stores node positions, camera position, filters per user/workspace
CREATE TABLE graph_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- JSONB state structure:
    -- {
    --   "positions": { "nodeId": {"x": 10, "y": 5, "z": -3}, ... },
    --   "camera": {"x": 0, "y": 15, "z": 50},
    --   "filters": {"showNotes": true, "showTasks": true, "showProjects": true}
    -- }
    state JSONB NOT NULL DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- One state per user per workspace
    UNIQUE(workspace_id, user_id)
);

-- Indexes for graph_states
CREATE INDEX idx_graph_states_workspace ON graph_states(workspace_id);
CREATE INDEX idx_graph_states_user ON graph_states(user_id);

-- Auto-update updated_at trigger
CREATE TRIGGER update_graph_states_updated_at
    BEFORE UPDATE ON graph_states
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
