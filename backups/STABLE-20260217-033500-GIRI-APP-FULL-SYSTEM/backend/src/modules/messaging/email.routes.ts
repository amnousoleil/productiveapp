/**
 * Email Routes - TeamTalk Pro
 */

import express from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as emailService from './email.service';

const router = express.Router();

/**
 * POST /api/v1/messaging/:conversationId/email/summary
 * Email conversation summary (last 10 messages)
 */
router.post('/:conversationId/email/summary', requireAuth, async (req, res, next) => {
    try {
        const userId = req.user!.id;
        const { conversationId } = req.params;
        const { recipientEmail } = req.body;

        if (!recipientEmail) {
            return res.status(400).json({ error: 'Missing recipientEmail' });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipientEmail)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        await emailService.emailConversationSummary(
            conversationId,
            recipientEmail,
            userId
        );

        res.json({
            success: true,
            message: 'Résumé envoyé par email',
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/messaging/:conversationId/email/full
 * Email full conversation export
 */
router.post('/:conversationId/email/full', requireAuth, async (req, res, next) => {
    try {
        const userId = req.user!.id;
        const { conversationId } = req.params;
        const { recipientEmail } = req.body;

        if (!recipientEmail) {
            return res.status(400).json({ error: 'Missing recipientEmail' });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipientEmail)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        await emailService.emailFullConversation(
            conversationId,
            recipientEmail,
            userId
        );

        res.json({
            success: true,
            message: 'Export complet envoyé par email',
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/messaging/:conversationId/email/history
 * Get email export history
 */
router.get('/:conversationId/email/history', requireAuth, async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const history = await emailService.getExportHistory(conversationId);

        res.json(history);
    } catch (error) {
        next(error);
    }
});

export default router;
