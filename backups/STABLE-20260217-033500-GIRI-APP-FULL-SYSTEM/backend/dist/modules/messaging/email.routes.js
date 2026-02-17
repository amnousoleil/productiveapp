"use strict";
/**
 * Email Routes - TeamTalk Pro
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
const emailService = __importStar(require("./email.service"));
const router = express_1.default.Router();
/**
 * POST /api/v1/messaging/:conversationId/email/summary
 * Email conversation summary (last 10 messages)
 */
router.post('/:conversationId/email/summary', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const userId = req.user.id;
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
        await emailService.emailConversationSummary(conversationId, recipientEmail, userId);
        res.json({
            success: true,
            message: 'Résumé envoyé par email',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/v1/messaging/:conversationId/email/full
 * Email full conversation export
 */
router.post('/:conversationId/email/full', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const userId = req.user.id;
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
        await emailService.emailFullConversation(conversationId, recipientEmail, userId);
        res.json({
            success: true,
            message: 'Export complet envoyé par email',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/v1/messaging/:conversationId/email/history
 * Get email export history
 */
router.get('/:conversationId/email/history', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const history = await emailService.getExportHistory(conversationId);
        res.json(history);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=email.routes.js.map