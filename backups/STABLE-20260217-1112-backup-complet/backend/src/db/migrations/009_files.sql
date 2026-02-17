-- Migration: 009_files
-- Description: Create files and media storage tables
-- Created: 2024-01-15

-- Create enum type for entity references
CREATE TYPE entity_type AS ENUM ('note', 'task', 'message', 'canvas', 'project', 'workspace');

-- Files table
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    entity_type entity_type,
    entity_id UUID,
    checksum VARCHAR(64),
    width INTEGER,
    height INTEGER,
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File thumbnails for images/videos
CREATE TABLE file_thumbnails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    size VARCHAR(20) NOT NULL,
    url TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(file_id, size)
);

-- File processing queue
CREATE TABLE file_processing_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    process_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage quotas per workspace
CREATE TABLE storage_quotas (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    quota_bytes BIGINT NOT NULL DEFAULT 5368709120,
    used_bytes BIGINT NOT NULL DEFAULT 0,
    file_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_files_workspace_id ON files(workspace_id);
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_entity ON files(entity_type, entity_id);
CREATE INDEX idx_files_mime_type ON files(mime_type);
CREATE INDEX idx_files_created_at ON files(created_at DESC);

CREATE INDEX idx_file_thumbnails_file_id ON file_thumbnails(file_id);

CREATE INDEX idx_file_processing_queue_status ON file_processing_queue(status);
CREATE INDEX idx_file_processing_queue_scheduled_at ON file_processing_queue(scheduled_at);

-- Triggers
CREATE TRIGGER update_storage_quotas_updated_at
    BEFORE UPDATE ON storage_quotas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update storage quota on file insert
CREATE OR REPLACE FUNCTION update_storage_on_file_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO storage_quotas (workspace_id, used_bytes, file_count)
    VALUES (NEW.workspace_id, NEW.file_size, 1)
    ON CONFLICT (workspace_id)
    DO UPDATE SET
        used_bytes = storage_quotas.used_bytes + NEW.file_size,
        file_count = storage_quotas.file_count + 1,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER files_update_storage_insert
    AFTER INSERT ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_storage_on_file_insert();

-- Function to update storage quota on file delete
CREATE OR REPLACE FUNCTION update_storage_on_file_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE storage_quotas
    SET used_bytes = GREATEST(0, used_bytes - OLD.file_size),
        file_count = GREATEST(0, file_count - 1),
        updated_at = NOW()
    WHERE workspace_id = OLD.workspace_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER files_update_storage_delete
    AFTER DELETE ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_storage_on_file_delete();

-- Function to check storage quota before upload
CREATE OR REPLACE FUNCTION check_storage_quota(ws_id UUID, file_bytes BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
    quota BIGINT;
    used BIGINT;
BEGIN
    SELECT quota_bytes, used_bytes INTO quota, used
    FROM storage_quotas
    WHERE workspace_id = ws_id;

    IF quota IS NULL THEN
        -- Default quota: 5GB
        quota := 5368709120;
        used := 0;
    END IF;

    RETURN (used + file_bytes) <= quota;
END;
$$ LANGUAGE plpgsql;
