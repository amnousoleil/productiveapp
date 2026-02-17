"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiGenerateReminders = exports.aiAnalyzeAndGenerate = exports.unsubscribe = exports.subscribe = exports.testNotification = exports.getHistory = exports.updatePreferences = exports.getPreferences = void 0;
const notifSvc = __importStar(require("./notifications.service.js"));
const notifications_ai_service_js_1 = require("./notifications-ai.service.js");
const getPreferences = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Non authentifié' });
            return;
        }
        const prefs = await notifSvc.getUserPreferences(userId);
        res.json(prefs);
    }
    catch (e) {
        console.error('Get preferences error:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.getPreferences = getPreferences;
const updatePreferences = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Non authentifié' });
            return;
        }
        const prefs = await notifSvc.updateUserPreferences(userId, req.body);
        res.json(prefs);
    }
    catch (e) {
        console.error('Update preferences error:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.updatePreferences = updatePreferences;
const getHistory = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Non authentifié' });
            return;
        }
        const limit = parseInt(req.query.limit) || 50;
        const history = await notifSvc.getNotificationHistory(userId, limit);
        res.json(history);
    }
    catch (e) {
        console.error('Get history error:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.getHistory = getHistory;
const testNotification = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Non authentifié' });
            return;
        }
        await notifSvc.sendTestNotification(userId);
        res.json({ success: true, message: 'Notification de test envoyée' });
    }
    catch (e) {
        console.error('Test notification error:', e);
        res.status(500).json({ error: e.message || 'Erreur' });
    }
};
exports.testNotification = testNotification;
const subscribe = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Non authentifié' });
            return;
        }
        const subscription = req.body.subscription;
        if (!subscription) {
            res.status(400).json({ error: 'subscription requis' });
            return;
        }
        await notifSvc.updateUserPreferences(userId, { push_subscription: subscription, push_enabled: true });
        res.json({ success: true });
    }
    catch (e) {
        console.error('Subscribe error:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.subscribe = subscribe;
const unsubscribe = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Non authentifié' });
            return;
        }
        await notifSvc.updateUserPreferences(userId, { push_subscription: null, push_enabled: false });
        res.json({ success: true });
    }
    catch (e) {
        console.error('Unsubscribe error:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.unsubscribe = unsubscribe;
// ========== AI CONTROLLERS ==========
/**
 * Analyser le contexte utilisateur et générer des rappels intelligents
 */
const aiAnalyzeAndGenerate = async (req, res) => {
    try {
        const userId = req.user?.id;
        const memberId = req.user?.memberId || userId; // Fallback to userId if no memberId
        if (!userId) {
            res.status(401).json({ error: 'Non authentifié' });
            return;
        }
        console.log(`🤖 AI Analysis request for user ${userId}`);
        // Analyser et générer les rappels
        const reminders = await notifications_ai_service_js_1.notificationsAIService.analyzeAndGenerateReminders(userId, memberId);
        res.json({
            success: true,
            count: reminders.length,
            reminders: reminders
        });
    }
    catch (e) {
        console.error('❌ AI analysis error:', e);
        res.status(500).json({ error: 'Erreur lors de l\'analyse IA' });
    }
};
exports.aiAnalyzeAndGenerate = aiAnalyzeAndGenerate;
/**
 * Générer des rappels et les créer en DB
 */
const aiGenerateReminders = async (req, res) => {
    try {
        const userId = req.user?.id;
        const memberId = req.user?.memberId || userId;
        if (!userId) {
            res.status(401).json({ error: 'Non authentifié' });
            return;
        }
        // Analyser
        const reminders = await notifications_ai_service_js_1.notificationsAIService.analyzeAndGenerateReminders(userId, memberId);
        // Créer les notifications en DB
        for (const reminder of reminders) {
            await notifications_ai_service_js_1.notificationsAIService.createNotificationFromReminder(userId, reminder);
        }
        res.json({
            success: true,
            generated: reminders.length,
            message: `${reminders.length} rappels intelligents générés`
        });
    }
    catch (e) {
        console.error('❌ AI generate reminders error:', e);
        res.status(500).json({ error: 'Erreur lors de la génération des rappels' });
    }
};
exports.aiGenerateReminders = aiGenerateReminders;
//# sourceMappingURL=notifications.controller.js.map