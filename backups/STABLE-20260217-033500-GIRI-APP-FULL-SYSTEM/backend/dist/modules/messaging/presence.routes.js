"use strict";
/**
 * Presence Routes - TeamTalk Pro
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const presenceService = __importStar(require("./presence.service"));
const router = express_1.default.Router();
/**
 * GET /api/v1/presence/me
 * Get current user's presence
 */
router.get('/me', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const presence = await presenceService.getUserPresence(userId);
        if (!presence) {
            return res.status(404).json({ error: 'Presence not found' });
        }
        res.json(presence);
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/v1/presence/me
 * Update current user's presence status
 */
router.put('/me', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { status, customMessage } = req.body;
        // Validate status
        const validStatuses = ['available', 'busy', 'dnd', 'away', 'offline', 'custom'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        const presence = await presenceService.updatePresence(userId, {
            status,
            customMessage,
        });
        res.json(presence);
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/v1/presence/heartbeat
 * Update last seen timestamp (keep alive)
 */
router.post('/heartbeat', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const userId = req.user.id;
        await presenceService.updateLastSeen(userId);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/v1/presence/online
 * Get all online users
 */
router.get('/online', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const users = await presenceService.getOnlineUsers();
        res.json(users);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/v1/presence/users
 * Get presence for specific users (query param: ids=uuid1,uuid2,...)
 */
router.get('/users', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const idsParam = req.query.ids;
        if (!idsParam) {
            return res.status(400).json({ error: 'Missing ids parameter' });
        }
        const userIds = idsParam.split(',').map((id) => id.trim());
        const presences = await presenceService.getMultiplePresences(userIds);
        res.json(presences);
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/v1/presence/typing/:conversationId
 * Set typing indicator in conversation
 */
router.post('/typing/:conversationId', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;
        await presenceService.setTyping(conversationId, userId);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/v1/presence/typing/:conversationId
 * Clear typing indicator in conversation
 */
router.delete('/typing/:conversationId', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;
        await presenceService.clearTyping(conversationId, userId);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/v1/presence/typing/:conversationId
 * Get typing users in conversation
 */
router.get('/typing/:conversationId', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const userIds = await presenceService.getTypingUsers(conversationId);
        res.json({ userIds });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=presence.routes.js.map