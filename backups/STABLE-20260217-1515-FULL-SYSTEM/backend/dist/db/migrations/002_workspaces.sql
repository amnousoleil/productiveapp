-- Migration: 002_workspaces
-- Description: Create workspaces, teams, and membership tables
-- Created: 2024-01-15

-- Create enum types for workspaces
CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'member', 'guest');
CREATE TYPE team_role AS ENUM ('lead', 'member');

-- Workspaces table
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspace members table (many-to-many relationship)
CREATE TABLE workspace_members (
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role workspace_role NOT NULL DEFAULT 'member',
    permissions JSONB,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (workspace_id, user_id)
);

-- Workspace invitations table
CREATE TABLE workspace_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role workspace_role NOT NULL DEFAULT 'member',
    token VARCHAR(255) UNIQUE NOT NULL,
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE team_members (
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role team_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);

-- Indexes
CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_invitations_email ON workspace_invitations(email);
CREATE INDEX idx_workspace_invitations_token ON workspace_invitations(token);
CREATE INDEX idx_workspace_invitations_workspace_id ON workspace_invitations(workspace_id);
CREATE INDEX idx_teams_workspace_id ON teams(workspace_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- Triggers for updated_at
CREATE TRIGGER update_workspaces_updated_at
    BEFORE UPDATE ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically add owner as workspace member
CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO workspace_members (workspace_id, user_id, role, joined_at)
    VALUES (NEW.id, NEW.owner_id, 'owner', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workspace_add_owner
    AFTER INSERT ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION add_owner_as_member();
