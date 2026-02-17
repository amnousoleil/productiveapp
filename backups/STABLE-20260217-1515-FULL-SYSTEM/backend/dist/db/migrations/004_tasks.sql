-- Migration: 004_tasks
-- Description: Create tasks and related tables
-- Created: 2024-01-15

-- Create enum types for tasks
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done', 'blocked');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'todo',
    priority task_priority DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    start_date TIMESTAMP WITH TIME ZONE,
    estimated_minutes INTEGER,
    actual_minutes INTEGER,
    position INTEGER DEFAULT 0,
    tags JSONB DEFAULT '[]',
    checklist JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Task comments table
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task attachments table
CREATE TABLE task_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task watchers (users who follow a task)
CREATE TABLE task_watchers (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (task_id, user_id)
);

-- Task dependencies
CREATE TABLE task_dependencies (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (task_id, depends_on_id),
    CHECK (task_id != depends_on_id)
);

-- Indexes
CREATE INDEX idx_tasks_workspace_id ON tasks(workspace_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_parent_id ON tasks(parent_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);

CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_user_id ON task_comments(user_id);

CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);

CREATE INDEX idx_task_watchers_user_id ON task_watchers(user_id);

-- Triggers
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at
    BEFORE UPDATE ON task_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to set completed_at when status changes to done
CREATE OR REPLACE FUNCTION set_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'done' AND OLD.status != 'done' THEN
        NEW.completed_at = NOW();
    ELSIF NEW.status != 'done' AND OLD.status = 'done' THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_set_completed_at
    BEFORE UPDATE OF status ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_task_completed_at();
