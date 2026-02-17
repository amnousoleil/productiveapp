/**
 * Presence Routes - TeamTalk Pro
 */

import express from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as presenceService from './presence.service';

const router = express.Router();

/**
 * GET /api/v1/presence/me
 * Get current user's presence
 */
router.get('/me', requireAuth, async (req, res, next) => {
    try {
        const userId = req.user!.id;
        const presence = await presenceService.getUserPresence(userId);

        if (!presence) {
            return res.status(404).json({ error: 'Presence not found' });
        }

        res.json(presence);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/v1/presence/me
 * Update current user's presence status
 */
router.put('/me', requireAuth, async (req, res, next) => {
    try {
        const userId = req.user!.id;
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
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/presence/heartbeat
 * Update last seen timestamp (keep alive)
 */
router.post('/heartbeat', requireAuth, async (req, res, next) => {
    try {
        const userId = req.user!.id;
        await presenceService.updateLastSeen(userId);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/presence/online
 * Get all online users
 */
router.get('/online', requireAuth, async (req, res, next) => {
    try {
        const users = await presenceService.getOnlineUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/presence/users
 * Get presence for specific users (query param: ids=uuid1,uuid2,...)
 */
router.get('/users', requireAuth, async (req, res, next) => {
    try {
        const idsParam = req.query.ids as string;
        if (!idsParam) {
            return res.status(400).json({ error: 'Missing ids parameter' });
        }

        const userIds = idsParam.split(',').map((id) => id.trim());
        const presences = await presenceService.getMultiplePresences(userIds);

        res.json(presences);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/presence/typing/:conversationId
 * Set typing indicator in conversation
 */
router.post('/typing/:conversationId', requireAuth, async (req, res, next) => {
    try {
        const userId = req.user!.id;
        const { conversationId } = req.params;

        await presenceService.setTyping(conversationId, userId);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/v1/presence/typing/:conversationId
 * Clear typing indicator in conversation
 */
router.delete('/typing/:conversationId', requireAuth, async (req, res, next) => {
    try {
        const userId = req.user!.id;
        const { conversationId } = req.params;

        await presenceService.clearTyping(conversationId, userId);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/presence/typing/:conversationId
 * Get typing users in conversation
 */
router.get('/typing/:conversationId', requireAuth, async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const userIds = await presenceService.getTypingUsers(conversationId);

        res.json({ userIds });
    } catch (error) {
        next(error);
    }
});

export default router;
