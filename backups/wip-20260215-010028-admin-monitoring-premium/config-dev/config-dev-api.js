/**
 * CONFIG DEV API
 * Wrapper API pour configuration développeur
 * @version 1.0
 */

const ConfigDevAPI = {
  /**
   * Récupère la configuration globale (PUBLIC)
   * @returns {Promise<Object>} Configuration complète
   */
  async getConfig() {
    try {
      const token = ApiTokens.getAccessToken() || localStorage.getItem('accessToken');
      const response = await fetch('/api/v1/config/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('[ConfigDevAPI] getConfig error:', error);
      throw error;
    }
  },

  /**
   * Met à jour la configuration (SUPER-ADMIN uniquement)
   * @param {Object} data - Champs à mettre à jour (partiel autorisé)
   * @returns {Promise<Object>} Config mise à jour
   */
  async updateConfig(data) {
    try {
      const token = ApiTokens.getAccessToken() || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch('/api/v1/config/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erreur de mise à jour');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('[ConfigDevAPI] updateConfig error:', error);
      throw error;
    }
  },

  /**
   * Upload un nouveau logo (SUPER-ADMIN uniquement)
   * @param {File} file - Fichier image (PNG/JPG/SVG, max 2MB)
   * @returns {Promise<Object>} Config avec nouveau logo
   */
  async uploadLogo(file) {
    try {
      const token = ApiTokens.getAccessToken() || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/v1/config/upload-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur d\'upload');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('[ConfigDevAPI] uploadLogo error:', error);
      throw error;
    }
  },

  /**
   * Réinitialise la config aux valeurs par défaut (SUPER-ADMIN uniquement)
   * @returns {Promise<Object>} Config réinitialisée
   */
  async resetConfig() {
    try {
      const token = ApiTokens.getAccessToken() || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch('/api/v1/config/app/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erreur de réinitialisation');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('[ConfigDevAPI] resetConfig error:', error);
      throw error;
    }
  },

  /**
   * Exporte la config en JSON (téléchargement)
   * @param {Object} config - Config à exporter
   * @param {string} filename - Nom du fichier
   */
  exportJSON(config, filename = 'app-config.json') {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

// Export global
window.ConfigDevAPI = ConfigDevAPI;
