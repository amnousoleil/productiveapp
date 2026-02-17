import type { UUID, Conversation, Message, ConversationType, MessageType, ConversationRole, MessageAttachment } from '../../types/index.js';

export interface CreateConversationInput {
  type: ConversationType;
  name?: string | null;
  description?: string | null;
  is_private?: boolean;
  participant_ids: UUID[];
}

export interface UpdateConversationInput {
  name?: string | null;
  description?: string | null;
}

export interface CreateMessageInput {
  content: string;
  message_type?: MessageType;
  reply_to_id?: UUID | null;
  attachments?: MessageAttachment[];
  mentions?: UUID[];
}

export interface UpdateMessageInput {
  content: string;
}

export interface ConversationWithDetails extends Conversation {
  participants: {
    user_id: UUID;
    role: ConversationRole;
    user: {
      id: UUID;
      name: string;
      avatar_url: string | null;
      status: string;
    };
  }[];
  last_message: {
    id: UUID;
    content: string;
    sender_id: UUID;
    sender_name: string;
    created_at: Date;
  } | null;
  unread_count: number;
}

export interface MessageWithSender extends Message {
  sender: {
    id: UUID;
    name: string;
    avatar_url: string | null;
  };
  reactions: {
    emoji: string;
    count: number;
    users: UUID[];
  }[];
  reply_to?: {
    id: UUID;
    content: string;
    sender_name: string;
  } | null;
}

export interface AddParticipantInput {
  user_id: UUID;
  role?: ConversationRole;
}
