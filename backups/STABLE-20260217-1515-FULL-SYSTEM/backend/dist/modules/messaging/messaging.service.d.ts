import type { UUID, Conversation, Message, PaginationParams } from '../../types/index.js';
import type { CreateConversationInput, UpdateConversationInput, CreateMessageInput, UpdateMessageInput, ConversationWithDetails, MessageWithSender, AddParticipantInput } from './messaging.types.js';
export declare class MessagingService {
    createConversation(workspaceId: UUID, userId: UUID, input: CreateConversationInput): Promise<Conversation>;
    getById(conversationId: UUID): Promise<Conversation>;
    getByIdWithDetails(conversationId: UUID, userId: UUID): Promise<ConversationWithDetails>;
    getUserConversations(workspaceId: UUID, userId: UUID, params: PaginationParams): Promise<{
        conversations: ConversationWithDetails[];
        total: number;
    }>;
    updateConversation(conversationId: UUID, input: UpdateConversationInput): Promise<Conversation>;
    deleteConversation(conversationId: UUID): Promise<void>;
    addParticipant(conversationId: UUID, input: AddParticipantInput): Promise<void>;
    removeParticipant(conversationId: UUID, userId: UUID): Promise<void>;
    leaveConversation(conversationId: UUID, userId: UUID): Promise<void>;
    sendMessage(conversationId: UUID, senderId: UUID, input: CreateMessageInput): Promise<Message>;
    getMessages(conversationId: UUID, params: PaginationParams & {
        before?: UUID;
    }): Promise<{
        messages: MessageWithSender[];
        total: number;
    }>;
    updateMessage(messageId: UUID, senderId: UUID, input: UpdateMessageInput): Promise<Message>;
    deleteMessage(messageId: UUID, senderId: UUID): Promise<void>;
    addReaction(messageId: UUID, userId: UUID, emoji: string): Promise<void>;
    removeReaction(messageId: UUID, userId: UUID, emoji: string): Promise<void>;
    markAsRead(conversationId: UUID, userId: UUID, messageId?: UUID): Promise<void>;
    pinMessage(messageId: UUID): Promise<void>;
    unpinMessage(messageId: UUID): Promise<void>;
    getPinnedMessages(conversationId: UUID): Promise<MessageWithSender[]>;
    isParticipant(conversationId: UUID, userId: UUID): Promise<boolean>;
    searchMessages(workspaceId: UUID, userId: UUID, query: string, params: PaginationParams): Promise<{
        messages: MessageWithSender[];
        total: number;
    }>;
}
export declare const messagingService: MessagingService;
//# sourceMappingURL=messaging.service.d.ts.map