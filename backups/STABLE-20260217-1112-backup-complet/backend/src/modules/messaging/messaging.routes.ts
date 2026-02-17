import { Router } from 'express';
import { messagingController } from './messaging.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { workspaceMiddleware } from '../../middleware/workspace.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Workspace conversations (require workspace context)
router.get('/workspace/:workspaceId/conversations', workspaceMiddleware, messagingController.listConversations.bind(messagingController));
router.post('/workspace/:workspaceId/conversations', workspaceMiddleware, messagingController.createConversation.bind(messagingController));
router.get('/workspace/:workspaceId/search', workspaceMiddleware, messagingController.searchMessages.bind(messagingController));

// Conversation-specific routes
router.get('/conversations/:conversationId', messagingController.getConversation.bind(messagingController));
router.put('/conversations/:conversationId', messagingController.updateConversation.bind(messagingController));
router.delete('/conversations/:conversationId', messagingController.deleteConversation.bind(messagingController));
router.post('/conversations/:conversationId/leave', messagingController.leaveConversation.bind(messagingController));
router.post('/conversations/:conversationId/read', messagingController.markAsRead.bind(messagingController));

// Participants
router.post('/conversations/:conversationId/participants', messagingController.addParticipant.bind(messagingController));
router.delete('/conversations/:conversationId/participants/:userId', messagingController.removeParticipant.bind(messagingController));

// Messages
router.get('/conversations/:conversationId/messages', messagingController.getMessages.bind(messagingController));
router.post('/conversations/:conversationId/messages', messagingController.sendMessage.bind(messagingController));
router.get('/conversations/:conversationId/pinned', messagingController.getPinnedMessages.bind(messagingController));

// Message-specific routes
router.put('/messages/:messageId', messagingController.updateMessage.bind(messagingController));
router.delete('/messages/:messageId', messagingController.deleteMessage.bind(messagingController));
router.post('/messages/:messageId/pin', messagingController.pinMessage.bind(messagingController));
router.delete('/messages/:messageId/pin', messagingController.unpinMessage.bind(messagingController));

// Reactions
router.post('/messages/:messageId/reactions', messagingController.addReaction.bind(messagingController));
router.delete('/messages/:messageId/reactions/:emoji', messagingController.removeReaction.bind(messagingController));

export default router;
