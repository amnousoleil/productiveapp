// =============================================
// MAIL API
// Client API pour le module mail
// =============================================

const MailAPI = {
  /**
   * Vérifie la configuration Resend
   */
  async checkConfig() {
    try {
      const response = await fetch(`${ApiConfig.API_URL}/mail/config/check`, {
        method: 'POST',
        headers: ApiConfig.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur de configuration');
      }

      return await response.json();
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
      const response = await fetch(`${ApiConfig.API_URL}/mail/send`, {
        method: 'POST',
        headers: ApiConfig.getHeaders(),
        body: JSON.stringify(mailData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'envoi');
      }

      return await response.json();
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
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.set('limit', params.limit);
      if (params.offset) queryParams.set('offset', params.offset);

      const response = await fetch(`${ApiConfig.API_URL}/mail/sent?${queryParams}`, {
        headers: ApiConfig.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération');
      }

      return await response.json();
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
      const response = await fetch(`${ApiConfig.API_URL}/mail/sent/${mailId}`, {
        headers: ApiConfig.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Email non trouvé');
      }

      return await response.json();
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
      const response = await fetch(`${ApiConfig.API_URL}/mail/drafts`, {
        method: 'POST',
        headers: ApiConfig.getHeaders(),
        body: JSON.stringify(draftData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      return await response.json();
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
      const response = await fetch(`${ApiConfig.API_URL}/mail/drafts`, {
        headers: ApiConfig.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération');
      }

      return await response.json();
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
      const response = await fetch(`${ApiConfig.API_URL}/mail/drafts/${draftId}`, {
        method: 'DELETE',
        headers: ApiConfig.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      return await response.json();
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
      const response = await fetch(`${ApiConfig.API_URL}/mail/templates`, {
        method: 'POST',
        headers: ApiConfig.getHeaders(),
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création');
      }

      return await response.json();
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
      const response = await fetch(`${ApiConfig.API_URL}/mail/templates`, {
        headers: ApiConfig.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération');
      }

      return await response.json();
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
      const response = await fetch(`${ApiConfig.API_URL}/mail/templates/${templateId}`, {
        headers: ApiConfig.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Template non trouvé');
      }

      return await response.json();
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
      const response = await fetch(`${ApiConfig.API_URL}/mail/templates/${templateId}`, {
        method: 'PUT',
        headers: ApiConfig.getHeaders(),
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      return await response.json();
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
      const response = await fetch(`${ApiConfig.API_URL}/mail/templates/${templateId}`, {
        method: 'DELETE',
        headers: ApiConfig.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      return await response.json();
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
      const response = await fetch(`${ApiConfig.API_URL}/mail/stats`, {
        headers: ApiConfig.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération');
      }

      return await response.json();
    } catch (error) {
      console.error('[MailAPI] getStats error:', error);
      throw error;
    }
  }
};

window.MailAPI = MailAPI;
