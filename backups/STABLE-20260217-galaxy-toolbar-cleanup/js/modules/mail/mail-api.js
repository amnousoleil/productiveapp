/**
 * MAIL API v2.0
 * Client API pour le module mail
 * Utilise le module Api standard de ProductiveApp
 */

const MailAPI = {
  /**
   * Vérifie la configuration Resend
   */
  async checkConfig() {
    try {
      return await Api.post('/mail/config/check');
    } catch (error) {
      console.error('[MailAPI] checkConfig error:', error);
      throw error;
    }
  },

  /**
   * Envoie un email
   */
  async send(mailData) {
    try {
      return await Api.post('/mail/send', mailData);
    } catch (error) {
      console.error('[MailAPI] send error:', error);
      throw error;
    }
  },

  /**
   * Récupère les emails envoyés
   */
  async getSentMails(params = {}) {
    try {
      return await Api.get('/mail/sent', params);
    } catch (error) {
      console.error('[MailAPI] getSentMails error:', error);
      throw error;
    }
  },

  /**
   * Récupère un email par ID
   */
  async getMailById(mailId) {
    try {
      return await Api.get(`/mail/sent/${mailId}`);
    } catch (error) {
      console.error('[MailAPI] getMailById error:', error);
      throw error;
    }
  },

  /**
   * Sauvegarde un brouillon
   */
  async saveDraft(draftData) {
    try {
      return await Api.post('/mail/drafts', draftData);
    } catch (error) {
      console.error('[MailAPI] saveDraft error:', error);
      throw error;
    }
  },

  /**
   * Récupère les brouillons
   */
  async getDrafts() {
    try {
      return await Api.get('/mail/drafts');
    } catch (error) {
      console.error('[MailAPI] getDrafts error:', error);
      throw error;
    }
  },

  /**
   * Supprime un brouillon
   */
  async deleteDraft(draftId) {
    try {
      return await Api.delete(`/mail/drafts/${draftId}`);
    } catch (error) {
      console.error('[MailAPI] deleteDraft error:', error);
      throw error;
    }
  },

  /**
   * Crée un template
   */
  async createTemplate(templateData) {
    try {
      return await Api.post('/mail/templates', templateData);
    } catch (error) {
      console.error('[MailAPI] createTemplate error:', error);
      throw error;
    }
  },

  /**
   * Récupère les templates
   */
  async getTemplates() {
    try {
      return await Api.get('/mail/templates');
    } catch (error) {
      console.error('[MailAPI] getTemplates error:', error);
      throw error;
    }
  },

  /**
   * Récupère un template par ID
   */
  async getTemplateById(templateId) {
    try {
      return await Api.get(`/mail/templates/${templateId}`);
    } catch (error) {
      console.error('[MailAPI] getTemplateById error:', error);
      throw error;
    }
  },

  /**
   * Met à jour un template
   */
  async updateTemplate(templateId, templateData) {
    try {
      return await Api.put(`/mail/templates/${templateId}`, templateData);
    } catch (error) {
      console.error('[MailAPI] updateTemplate error:', error);
      throw error;
    }
  },

  /**
   * Supprime un template
   */
  async deleteTemplate(templateId) {
    try {
      return await Api.delete(`/mail/templates/${templateId}`);
    } catch (error) {
      console.error('[MailAPI] deleteTemplate error:', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques
   */
  async getStats() {
    try {
      return await Api.get('/mail/stats');
    } catch (error) {
      console.error('[MailAPI] getStats error:', error);
      throw error;
    }
  },

  // ===== INBOX (emails reçus) =====

  async getInbox(params = {}) {
    try {
      return await Api.get('/mail/inbox', params);
    } catch (error) {
      console.error('[MailAPI] getInbox error:', error);
      throw error;
    }
  },

  async getInboxEmail(id) {
    try {
      return await Api.get(`/mail/inbox/${id}`);
    } catch (error) {
      console.error('[MailAPI] getInboxEmail error:', error);
      throw error;
    }
  },

  async markAsRead(id, isRead = true) {
    try {
      return await Api.put(`/mail/inbox/${id}/read`, { is_read: isRead });
    } catch (error) {
      console.error('[MailAPI] markAsRead error:', error);
      throw error;
    }
  },

  async markAsStarred(id, isStarred = true) {
    try {
      return await Api.put(`/mail/inbox/${id}/star`, { is_starred: isStarred });
    } catch (error) {
      console.error('[MailAPI] markAsStarred error:', error);
      throw error;
    }
  },

  async deleteInboxEmail(id) {
    try {
      return await Api.delete(`/mail/inbox/${id}`);
    } catch (error) {
      console.error('[MailAPI] deleteInboxEmail error:', error);
      throw error;
    }
  },

  async getInboxStats() {
    try {
      return await Api.get('/mail/inbox/stats');
    } catch (error) {
      console.error('[MailAPI] getInboxStats error:', error);
      throw error;
    }
  }
};

window.MailAPI = MailAPI;
