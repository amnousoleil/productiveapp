import { Request, Response } from 'express';
import * as notifSvc from './notifications.service.js';
import { notificationsAIService } from './notifications-ai.service.js';
type Req = Request<any, any, any, any> & { user?: { id: string; memberId?: string } };
export const getPreferences = async (req: Req, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ error: 'Non authentifié' }); return; }
    const prefs = await notifSvc.getUserPreferences(userId);
    res.json(prefs);
  } catch (e: any) { console.error('Get preferences error:', e); res.status(500).json({ error: 'Erreur' }); }
};
export const updatePreferences = async (req: Req, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ error: 'Non authentifié' }); return; }
    const prefs = await notifSvc.updateUserPreferences(userId, req.body);
    res.json(prefs);
  } catch (e: any) { console.error('Update preferences error:', e); res.status(500).json({ error: 'Erreur' }); }
};
export const getHistory = async (req: Req, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ error: 'Non authentifié' }); return; }
    const limit = parseInt(req.query.limit as string) || 50;
    const history = await notifSvc.getNotificationHistory(userId, limit);
    res.json(history);
  } catch (e: any) { console.error('Get history error:', e); res.status(500).json({ error: 'Erreur' }); }
};
export const testNotification = async (req: Req, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ error: 'Non authentifié' }); return; }
    await notifSvc.sendTestNotification(userId);
    res.json({ success: true, message: 'Notification de test envoyée' });
  } catch (e: any) { console.error('Test notification error:', e); res.status(500).json({ error: e.message || 'Erreur' }); }
};
export const subscribe = async (req: Req, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ error: 'Non authentifié' }); return; }
    const subscription = req.body.subscription;
    if (!subscription) { res.status(400).json({ error: 'subscription requis' }); return; }
    await notifSvc.updateUserPreferences(userId, { push_subscription: subscription, push_enabled: true });
    res.json({ success: true });
  } catch (e: any) { console.error('Subscribe error:', e); res.status(500).json({ error: 'Erreur' }); }
};
export const unsubscribe = async (req: Req, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ error: 'Non authentifié' }); return; }
    await notifSvc.updateUserPreferences(userId, { push_subscription: null, push_enabled: false });
    res.json({ success: true });
  } catch (e: any) { console.error('Unsubscribe error:', e); res.status(500).json({ error: 'Erreur' }); }
};

// ========== AI CONTROLLERS ==========

/**
 * Analyser le contexte utilisateur et générer des rappels intelligents
 */
export const aiAnalyzeAndGenerate = async (req: Req, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const memberId = req.user?.memberId || userId; // Fallback to userId if no memberId

    if (!userId) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    console.log(`🤖 AI Analysis request for user ${userId}`);

    // Analyser et générer les rappels
    const reminders = await notificationsAIService.analyzeAndGenerateReminders(userId, memberId!);

    res.json({
      success: true,
      count: reminders.length,
      reminders: reminders
    });

  } catch (e: any) {
    console.error('❌ AI analysis error:', e);
    res.status(500).json({ error: 'Erreur lors de l\'analyse IA' });
  }
};

/**
 * Générer des rappels et les créer en DB
 */
export const aiGenerateReminders = async (req: Req, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const memberId = req.user?.memberId || userId;

    if (!userId) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    // Analyser
    const reminders = await notificationsAIService.analyzeAndGenerateReminders(userId, memberId!);

    // Créer les notifications en DB
    for (const reminder of reminders) {
      await notificationsAIService.createNotificationFromReminder(userId, reminder);
    }

    res.json({
      success: true,
      generated: reminders.length,
      message: `${reminders.length} rappels intelligents générés`
    });

  } catch (e: any) {
    console.error('❌ AI generate reminders error:', e);
    res.status(500).json({ error: 'Erreur lors de la génération des rappels' });
  }
};
