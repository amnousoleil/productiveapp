"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messaging_controller_js_1 = require("./messaging.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const workspace_middleware_js_1 = require("../../middleware/workspace.middleware.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authMiddleware);
// Workspace conversations (require workspace context)
router.get('/workspace/:workspaceId/conversations', workspace_middleware_js_1.workspaceMiddleware, messaging_controller_js_1.messagingController.listConversations.bind(messaging_controller_js_1.messagingController));
router.post('/workspace/:workspaceId/conversations', workspace_middleware_js_1.workspaceMiddleware, messaging_controller_js_1.messagingController.createConversation.bind(messaging_controller_js_1.messagingController));
router.get('/workspace/:workspaceId/search', workspace_middleware_js_1.workspaceMiddleware, messaging_controller_js_1.messagingController.searchMessages.bind(messaging_controller_js_1.messagingController));
// Conversation-specific routes
router.get('/conversations/:conversationId', messaging_controller_js_1.messagingController.getConversation.bind(messaging_controller_js_1.messagingController));
router.put('/conversations/:conversationId', messaging_controller_js_1.messagingController.updateConversation.bind(messaging_controller_js_1.messagingController));
router.delete('/conversations/:conversationId', messaging_controller_js_1.messagingController.deleteConversation.bind(messaging_controller_js_1.messagingController));
router.post('/conversations/:conversationId/leave', messaging_controller_js_1.messagingController.leaveConversation.bind(messaging_controller_js_1.messagingController));
router.post('/conversations/:conversationId/read', messaging_controller_js_1.messagingController.markAsRead.bind(messaging_controller_js_1.messagingController));
// Participants
router.post('/conversations/:conversationId/participants', messaging_controller_js_1.messagingController.addParticipant.bind(messaging_controller_js_1.messagingController));
router.delete('/conversations/:conversationId/participants/:userId', messaging_controller_js_1.messagingController.removeParticipant.bind(messaging_controller_js_1.messagingController));
// Messages
router.get('/conversations/:conversationId/messages', messaging_controller_js_1.messagingController.getMessages.bind(messaging_controller_js_1.messagingController));
router.post('/conversations/:conversationId/messages', messaging_controller_js_1.messagingController.sendMessage.bind(messaging_controller_js_1.messagingController));
router.get('/conversations/:conversationId/pinned', messaging_controller_js_1.messagingController.getPinnedMessages.bind(messaging_controller_js_1.messagingController));
// Message-specific routes
router.put('/messages/:messageId', messaging_controller_js_1.messagingController.updateMessage.bind(messaging_controller_js_1.messagingController));
router.delete('/messages/:messageId', messaging_controller_js_1.messagingController.deleteMessage.bind(messaging_controller_js_1.messagingController));
router.post('/messages/:messageId/pin', messaging_controller_js_1.messagingController.pinMessage.bind(messaging_controller_js_1.messagingController));
router.delete('/messages/:messageId/pin', messaging_controller_js_1.messagingController.unpinMessage.bind(messaging_controller_js_1.messagingController));
// Reactions
router.post('/messages/:messageId/reactions', messaging_controller_js_1.messagingController.addReaction.bind(messaging_controller_js_1.messagingController));
router.delete('/messages/:messageId/reactions/:emoji', messaging_controller_js_1.messagingController.removeReaction.bind(messaging_controller_js_1.messagingController));
exports.default = router;
//# sourceMappingURL=messaging.routes.js.map