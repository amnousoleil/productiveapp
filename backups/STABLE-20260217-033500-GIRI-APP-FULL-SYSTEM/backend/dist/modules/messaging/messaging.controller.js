"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagingController = exports.MessagingController = void 0;
const messaging_service_js_1 = require("./messaging.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
const validation_js_1 = require("../../utils/validation.js");
const zod_1 = require("zod");
const signals_service_js_1 = require("../signals/signals.service.js");
const updateConversationSchema = zod_1.z.object({
    name: zod_1.z.string().max(255).nullable().optional(),
    description: zod_1.z.string().max(1000).nullable().optional(),
});
const updateMessageSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(10000),
});
const addParticipantSchema = zod_1.z.object({
    user_id: validation_js_1.uuidSchema,
    role: zod_1.z.enum(['admin', 'member']).optional(),
});
const reactionSchema = zod_1.z.object({
    emoji: zod_1.z.string().min(1).max(10),
});
const markReadSchema = zod_1.z.object({
    message_id: validation_js_1.uuidSchema.optional(),
});
const messagesQuerySchema = validation_js_1.paginationSchema.extend({
    before: validation_js_1.uuidSchema.optional(),
});
const searchSchema = zod_1.z.object({
    q: zod_1.z.string().min(1).max(500),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
class MessagingController {
    async createConversation(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const input = validation_js_1.createConversationSchema.parse(req.body);
            const conversation = await messaging_service_js_1.messagingService.createConversation(workspaceId, userId, input);
            res.status(201).json((0, helpers_js_1.successResponse)({ conversation }));
        }
        catch (error) {
            next(error);
        }
    }
    async getConversation(req, res, next) {
        try {
            const conversationId = validation_js_1.uuidSchema.parse(req.params.conversationId);
            const userId = req.user.id;
            const isParticipant = await messaging_service_js_1.messagingService.isParticipant(conversationId, userId);
            if (!isParticipant) {
                throw helpers_js_1.AppError.forbidden('Not a participant of this conversation');
            }
            const conversation = await messaging_service_js_1.messagingService.getByIdWithDetails(conversationId, userId);
            res.json((0, helpers_js_1.successResponse)({ conversation }));
        }
        catch (error) {
            next(error);
        }
    }
    async listConversations(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const params = validation_js_1.paginationSchema.parse(req.query);
            const { conversations, total } = await messaging_service_js_1.messagingService.getUserConversations(workspaceId, userId, params);
            res.json((0, helpers_js_1.paginatedResponse)(conversations, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    async updateConversation(req, res, next) {
        try {
            const conversationId = validation_js_1.uuidSchema.parse(req.params.conversationId);
            const userId = req.user.id;
            const input = updateConversationSchema.parse(req.body);
            const isParticipant = await messaging_service_js_1.messagingService.isParticipant(conversationId, userId);
            if (!isParticipant) {
                throw helpers_js_1.AppError.forbidden('Not a participant of this conversation');
            }
            const conversation = await messaging_service_js_1.messagingService.updateConversation(conversationId, input);
            res.json((0, helpers_js_1.successResponse)({ conversation }));
        }
        catch (error) {
            next(error);
        }
    }
    async deleteConversation(req, res, next) {
        try {
            const conversationId = validation_js_1.uuidSchema.parse(req.params.conversationId);
            await messaging_service_js_1.messagingService.deleteConversation(conversationId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Conversation deleted' }));
        }
        catch (error) {
            next(error);
        }
    }
    async addParticipant(req, res, next) {
        try {
            const conversationId = validation_js_1.uuidSchema.parse(req.params.conversationId);
            const input = addParticipantSchema.parse(req.body);
            await messaging_service_js_1.messagingService.addParticipant(conversationId, input);
            res.status(201).json((0, helpers_js_1.successResponse)({ message: 'Participant added' }));
        }
        catch (error) {
            next(error);
        }
    }
    async removeParticipant(req, res, next) {
        try {
            const conversationId = validation_js_1.uuidSchema.parse(req.params.conversationId);
            const userId = validation_js_1.uuidSchema.parse(req.params.userId);
            await messaging_service_js_1.messagingService.removeParticipant(conversationId, userId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Participant removed' }));
        }
        catch (error) {
            next(error);
        }
    }
    async leaveConversation(req, res, next) {
        try {
            const conversationId = validation_js_1.uuidSchema.parse(req.params.conversationId);
            const userId = req.user.id;
            await messaging_service_js_1.messagingService.leaveConversation(conversationId, userId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Left conversation' }));
        }
        catch (error) {
            next(error);
        }
    }
    async sendMessage(req, res, next) {
        try {
            const conversationId = validation_js_1.uuidSchema.parse(req.params.conversationId);
            const userId = req.user.id;
            const input = validation_js_1.createMessageSchema.parse(req.body);
            const isParticipant = await messaging_service_js_1.messagingService.isParticipant(conversationId, userId);
            if (!isParticipant) {
                throw helpers_js_1.AppError.forbidden('Not a participant of this conversation');
            }
            const message = await messaging_service_js_1.messagingService.sendMessage(conversationId, userId, input);
            // Record behavioral signal (get workspaceId from conversation)
            const conversation = await messaging_service_js_1.messagingService.getById(conversationId);
            const workspaceId = conversation?.workspace_id;
            if (workspaceId) {
                const wordCount = input.content?.split(/\s+/).filter(Boolean).length || 0;
                (0, signals_service_js_1.recordSignalAsync)(userId, workspaceId, 'message_sent', 'messaging', message.id, {
                    conversation_id: conversationId,
                    word_count: wordCount,
                    hour: new Date().getHours()
                });
            }
            res.status(201).json((0, helpers_js_1.successResponse)({ message }));
        }
        catch (error) {
            next(error);
        }
    }
    async getMessages(req, res, next) {
        try {
            const conversationId = validation_js_1.uuidSchema.parse(req.params.conversationId);
            const userId = req.user.id;
            const params = messagesQuerySchema.parse(req.query);
            const isParticipant = await messaging_service_js_1.messagingService.isParticipant(conversationId, userId);
            if (!isParticipant) {
                throw helpers_js_1.AppError.forbidden('Not a participant of this conversation');
            }
            const { messages, total } = await messaging_service_js_1.messagingService.getMessages(conversationId, params);
            res.json((0, helpers_js_1.paginatedResponse)(messages, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    async updateMessage(req, res, next) {
        try {
            const messageId = validation_js_1.uuidSchema.parse(req.params.messageId);
            const userId = req.user.id;
            const input = updateMessageSchema.parse(req.body);
            const message = await messaging_service_js_1.messagingService.updateMessage(messageId, userId, input);
            res.json((0, helpers_js_1.successResponse)({ message }));
        }
        catch (error) {
            next(error);
        }
    }
    async deleteMessage(req, res, next) {
        try {
            const messageId = validation_js_1.uuidSchema.parse(req.params.messageId);
            const userId = req.user.id;
            await messaging_service_js_1.messagingService.deleteMessage(messageId, userId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Message deleted' }));
        }
        catch (error) {
            next(error);
        }
    }
    async addReaction(req, res, next) {
        try {
            const messageId = validation_js_1.uuidSchema.parse(req.params.messageId);
            const userId = req.user.id;
            const { emoji } = reactionSchema.parse(req.body);
            await messaging_service_js_1.messagingService.addReaction(messageId, userId, emoji);
            res.status(201).json((0, helpers_js_1.successResponse)({ message: 'Reaction added' }));
        }
        catch (error) {
            next(error);
        }
    }
    async removeReaction(req, res, next) {
        try {
            const messageId = validation_js_1.uuidSchema.parse(req.params.messageId);
            const userId = req.user.id;
            const emoji = decodeURIComponent(req.params.emoji);
            await messaging_service_js_1.messagingService.removeReaction(messageId, userId, emoji);
            res.json((0, helpers_js_1.successResponse)({ message: 'Reaction removed' }));
        }
        catch (error) {
            next(error);
        }
    }
    async markAsRead(req, res, next) {
        try {
            const conversationId = validation_js_1.uuidSchema.parse(req.params.conversationId);
            const userId = req.user.id;
            const { message_id } = markReadSchema.parse(req.body);
            await messaging_service_js_1.messagingService.markAsRead(conversationId, userId, message_id);
            res.json((0, helpers_js_1.successResponse)({ message: 'Marked as read' }));
        }
        catch (error) {
            next(error);
        }
    }
    async pinMessage(req, res, next) {
        try {
            const messageId = validation_js_1.uuidSchema.parse(req.params.messageId);
            await messaging_service_js_1.messagingService.pinMessage(messageId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Message pinned' }));
        }
        catch (error) {
            next(error);
        }
    }
    async unpinMessage(req, res, next) {
        try {
            const messageId = validation_js_1.uuidSchema.parse(req.params.messageId);
            await messaging_service_js_1.messagingService.unpinMessage(messageId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Message unpinned' }));
        }
        catch (error) {
            next(error);
        }
    }
    async getPinnedMessages(req, res, next) {
        try {
            const conversationId = validation_js_1.uuidSchema.parse(req.params.conversationId);
            const userId = req.user.id;
            const isParticipant = await messaging_service_js_1.messagingService.isParticipant(conversationId, userId);
            if (!isParticipant) {
                throw helpers_js_1.AppError.forbidden('Not a participant of this conversation');
            }
            const messages = await messaging_service_js_1.messagingService.getPinnedMessages(conversationId);
            res.json((0, helpers_js_1.successResponse)({ messages }));
        }
        catch (error) {
            next(error);
        }
    }
    async searchMessages(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const params = searchSchema.parse(req.query);
            const { messages, total } = await messaging_service_js_1.messagingService.searchMessages(workspaceId, userId, params.q, params);
            res.json((0, helpers_js_1.paginatedResponse)(messages, params, total));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MessagingController = MessagingController;
exports.messagingController = new MessagingController();
//# sourceMappingURL=messaging.controller.js.map