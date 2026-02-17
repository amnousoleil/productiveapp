-- Migration 023: TeamTalk Pro Features
-- Adds: Presence, Reactions, Threading, Folders

BEGIN;

-- =====================================================
-- 1. User Presence Table
-- =====================================================
CREATE TABLE IF NOT EXISTS user_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'offline',
    custom_message TEXT,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON user_presence(last_seen);

COMMENT ON TABLE user_presence IS 'User online/offline presence and custom status';
COMMENT ON COLUMN user_presence.status IS 'available, busy, dnd, away, offline, custom';
COMMENT ON COLUMN user_presence.custom_message IS 'Custom status message (e.g. "En réunion client")';

-- =====================================================
-- 2. Message Reactions Table
-- =====================================================
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);

COMMENT ON TABLE message_reactions IS 'Emoji reactions on messages';

-- =====================================================
-- 3. Conversation Folders Table
-- =====================================================
CREATE TABLE IF NOT EXISTS conversation_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20),
    icon VARCHAR(50),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversation_folders_user_id ON conversation_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_folders_order ON conversation_folders(user_id, order_index);

COMMENT ON TABLE conversation_folders IS 'User-created folders to organize conversations';

-- =====================================================
-- 4. Conversation Folder Mapping Table
-- =====================================================
CREATE TABLE IF NOT EXISTS conversation_folder_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES conversation_folders(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(folder_id, conversation_id)
);

CREATE INDEX IF NOT EXISTS idx_folder_items_folder_id ON conversation_folder_items(folder_id);
CREATE INDEX IF NOT EXISTS idx_folder_items_conversation_id ON conversation_folder_items(conversation_id);

COMMENT ON TABLE conversation_folder_items IS 'Maps conversations to folders';

-- =====================================================
-- 5. Add Threading Support to Messages
-- =====================================================
ALTER TABLE messages ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_messages_parent ON messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_pinned ON messages(conversation_id, is_pinned) WHERE is_pinned = TRUE;

COMMENT ON COLUMN messages.parent_message_id IS 'Thread parent message (for replies)';
COMMENT ON COLUMN messages.is_pinned IS 'Pinned message in conversation';
COMMENT ON COLUMN messages.is_edited IS 'Message was edited by sender';

-- =====================================================
-- 6. Add Conversation Metadata
-- =====================================================
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_conversations_archived ON conversations(is_archived);
CREATE INDEX IF NOT EXISTS idx_conversations_favorite ON conversations(is_favorite);

COMMENT ON COLUMN conversations.is_archived IS 'Conversation archived by user';
COMMENT ON COLUMN conversations.is_favorite IS 'Conversation starred/favorited';

-- =====================================================
-- 7. Email Export Log Table
-- =====================================================
CREATE TABLE IF NOT EXISTS conversation_email_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    exported_by UUID NOT NULL REFERENCES users(id),
    recipient_email VARCHAR(255) NOT NULL,
    message_count INTEGER NOT NULL,
    export_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_exports_conversation ON conversation_email_exports(conversation_id);
CREATE INDEX IF NOT EXISTS idx_email_exports_user ON conversation_email_exports(exported_by);

COMMENT ON TABLE conversation_email_exports IS 'Log of conversation exports via email';
COMMENT ON COLUMN conversation_email_exports.export_type IS 'summary, full, pdf';

-- =====================================================
-- 8. Typing Indicators Table (in-memory alternative)
-- =====================================================
CREATE TABLE IF NOT EXISTS typing_indicators (
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_typing_conversation ON typing_indicators(conversation_id);

COMMENT ON TABLE typing_indicators IS 'Temporary typing indicators (cleanup old entries periodically)';

-- =====================================================
-- 9. Initialize Presence for Existing Users
-- =====================================================
INSERT INTO user_presence (user_id, status, last_seen)
SELECT id, 'offline', NOW()
FROM users
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
