// =============================================
// MAIL CONTROLLER
// Handlers pour les requêtes mail
// =============================================

import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { MailService } from './mail.service.js';
import { SendMailSchema, SaveDraftSchema, CreateTemplateSchema } from './mail.types.js';

export const MailController = {
  /**
   * POST /api/v1/mail/config/check
   * Vérifie la configuration Resend
   */
  async checkConfig(_req: AuthenticatedRequest, res: Response) {
    try {
      const result = await MailService.checkConfig();

      if (!result.ok) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      return res.json({
        success: true,
        message: 'Configuration Resend OK',
        from: process.env.EMAIL_FROM
      });
    } catch (error: any) {
      console.error('[MailController] checkConfig error:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la vérification'
      });
    }
  },

  /**
   * POST /api/v1/mail/send
   * Envoie un email
   */
  async send(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace?.id || null;

      // Validation
      const validation = SendMailSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: validation.error.errors
        });
      }

      const result = await MailService.send(userId, workspaceId, validation.data);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      return res.json({
        success: true,
        id: result.id
      });
    } catch (error: any) {
      console.error('[MailController] send error:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'envoi'
      });
    }
  },

  /**
   * GET /api/v1/mail/sent
   * Liste des emails envoyés
   */
  async getSentMails(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace?.id || null;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const mails = await MailService.getSentMails(userId, workspaceId, limit, offset);

      return res.json({
        success: true,
        mails,
        limit,
        offset
      });
    } catch (error: any) {
      console.error('[MailController] getSentMails error:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération'
      });
    }
  },

  /**
   * GET /api/v1/mail/sent/:id
   * Détails d'un email
   */
  async getMailById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const mailId = req.params.id;

      const mail = await MailService.getMailById(mailId, userId);

      if (!mail) {
        return res.status(404).json({
          success: false,
          error: 'Email non trouvé'
        });
      }

      return res.json({
        success: true,
        mail
      });
    } catch (error: any) {
      console.error('[MailController] getMailById error:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération'
      });
    }
  },

  /**
   * POST /api/v1/mail/drafts
   * Sauvegarde un brouillon
   */
  async saveDraft(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace?.id || null;
      const draftId = req.body.id;

      // Validation
      const validation = SaveDraftSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: validation.error.errors
        });
      }

      const draft = await MailService.saveDraft(userId, workspaceId, validation.data, draftId);

      return res.json({
        success: true,
        draft
      });
    } catch (error: any) {
      console.error('[MailController] saveDraft error:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la sauvegarde'
      });
    }
  },

  /**
   * GET /api/v1/mail/drafts
   * Liste des brouillons
   */
  async getDrafts(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace?.id || null;

      const drafts = await MailService.getDrafts(userId, workspaceId);

      return res.json({
        success: true,
        drafts
      });
    } catch (error: any) {
      console.error('[MailController] getDrafts error:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération'
      });
    }
  },

  /**
   * DELETE /api/v1/mail/drafts/:id
   * Supprime un brouillon
   */
  async deleteDraft(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const draftId = req.params.id;

      const deleted = await MailService.deleteDraft(draftId, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Brouillon non trouvé'
        });
      }

      return res.json({
        success: true
      });
    } catch (error: any) {
      console.error('[MailController] deleteDraft error:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression'
      });
    }
  },

  /**
   * POST /api/v1/mail/templates
   * Crée un template
   */
  async createTemplate(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;

      // Validation
      const validation = CreateTemplateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: validation.error.errors
        });
      }

      const template = await MailService.createTemplate(userId, validation.data);

      return res.json({
        success: true,
        template
      });
    } catch (error: any) {
      console.error('[MailController] createTemplate error:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la création'
      });
    }
  },

  /**
   * GET /api/v1/mail/templates
   * Liste des templates
   */
  async getTemplates(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const templates = await MailService.getTemplates(userId);

      return res.json({
        success: true,
        templates
      });
    } catch (error: any) {
      console.error('[MailController] getTemplates error:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération'
      });
    }
  },

  /**
   * GET /api/v1/mail/templates/:id
   * Détails d'un template
   */
  async getTemplateById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const templateId = req.params.id;

      const template = await MailService.getTemplateById(templateId, userId);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template non trouvé'
        });
      }

      return res.json({
        success: true,
        template
      });
    } catch (error: any) {
      console.error('[MailController] getTemplateById error:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération'
      });
    }
  },

  /**
   * PUT /api/v1/mail/templates/:id
   * Met à jour un template
   */
  async updateTemplate(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const templateId = req.params.id;

      const template = await MailService.updateTemplate(templateId, userId, req.body);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template non trouvé'
        });
      }

      return res.json({
        success: true,
        template
      });
    } catch (error: any) {
      console.error('[MailController] updateTemplate error:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour'
      });
    }
  },

  /**
   * DELETE /api/v1/mail/templates/:id
   * Supprime un template
   */
  async deleteTemplate(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const templateId = req.params.id;

      const deleted = await MailService.deleteTemplate(templateId, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Template non trouvé'
        });
      }

      return res.json({
        success: true
      });
    } catch (error: any) {
      console.error('[MailController] deleteTemplate error:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression'
      });
    }
  },

  /**
   * GET /api/v1/mail/stats
   * Statistiques d'emailing
   */
  async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const workspaceId = req.workspace?.id || null;

      const stats = await MailService.getStats(userId, workspaceId);

      return res.json({
        success: true,
        stats
      });
    } catch (error: any) {
      console.error('[MailController] getStats error:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération'
      });
    }
  }
};

export default MailController;
