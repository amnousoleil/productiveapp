/**
 * Admin API Module v1.0
 * @description API wrapper for admin endpoints
 */

const AdminAPI = {
  /**
   * Get system health status
   * @returns {Promise<Object>}
   */
  async getHealth() {
    const response = await fetch(`${AppConfig.API_URL}/admin/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ApiTokens.getAccessToken() || localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get system statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    const response = await fetch(`${AppConfig.API_URL}/admin/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ApiTokens.getAccessToken() || localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Get stats failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get member activity overview
   * @returns {Promise<Array>}
   */
  async getMemberActivity() {
    const response = await fetch(`${AppConfig.API_URL}/admin/members/activity`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ApiTokens.getAccessToken() || localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Get member activity failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get recent activity log
   * @param {number} limit - Number of activities to retrieve
   * @returns {Promise<Array>}
   */
  async getRecentActivity(limit = 20) {
    const url = `${AppConfig.API_URL}/admin/activity/recent?limit=${limit}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ApiTokens.getAccessToken() || localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Get recent activity failed: ${response.statusText}`);
    }

    return response.json();
  },

  // ===== FRONTEND ERRORS =====

  /**
   * Get frontend errors with filters
   * @param {Object} params - Filter parameters
   * @returns {Promise<Object>}
   */
  async getFrontendErrors(params = {}) {
    const { limit = 50, offset = 0, severity, userId, resolved } = params;
    const queryParams = new URLSearchParams();

    queryParams.set('limit', limit);
    queryParams.set('offset', offset);
    if (severity) queryParams.set('severity', severity);
    if (userId) queryParams.set('userId', userId);
    if (resolved !== undefined) queryParams.set('resolved', resolved);

    const response = await fetch(`${AppConfig.API_URL}/admin/frontend-errors?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ApiTokens.getAccessToken() || localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Get frontend errors failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get frontend errors statistics
   * @returns {Promise<Object>}
   */
  async getFrontendErrorStats() {
    const response = await fetch(`${AppConfig.API_URL}/admin/frontend-errors/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ApiTokens.getAccessToken() || localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Get frontend error stats failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Mark frontend error as resolved
   * @param {string} errorId - Error ID
   * @returns {Promise<Object>}
   */
  async resolveFrontendError(errorId) {
    const response = await fetch(`${AppConfig.API_URL}/admin/frontend-errors/${errorId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ApiTokens.getAccessToken() || localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Resolve error failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Delete frontend error
   * @param {string} errorId - Error ID
   * @returns {Promise<Object>}
   */
  async deleteFrontendError(errorId) {
    const response = await fetch(`${AppConfig.API_URL}/admin/frontend-errors/${errorId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ApiTokens.getAccessToken() || localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Delete error failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Export frontend errors as CSV
   * @param {Object} params - Filter parameters
   * @returns {Promise<Blob>}
   */
  async exportFrontendErrorsCSV(params = {}) {
    const { severity, startDate, endDate } = params;
    const queryParams = new URLSearchParams();

    if (severity) queryParams.set('severity', severity);
    if (startDate) queryParams.set('startDate', startDate);
    if (endDate) queryParams.set('endDate', endDate);

    const response = await fetch(`${AppConfig.API_URL}/admin/frontend-errors/export?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ApiTokens.getAccessToken() || localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Export CSV failed: ${response.statusText}`);
    }

    return response.blob();
  },

  // ===== ANALYTICS =====

  /**
   * Get top pages visited
   * @param {number} limit - Number of pages
   * @returns {Promise<Array>}
   */
  async getAnalyticsPages(limit = 10) {
    const response = await fetch(`${AppConfig.API_URL}/admin/analytics/pages?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ApiTokens.getAccessToken() || localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Get analytics pages failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get top features used
   * @param {number} limit - Number of features
   * @returns {Promise<Array>}
   */
  async getAnalyticsFeatures(limit = 10) {
    const response = await fetch(`${AppConfig.API_URL}/admin/analytics/features?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ApiTokens.getAccessToken() || localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Get analytics features failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get user activity statistics
   * @returns {Promise<Object>}
   */
  async getUserActivity() {
    const response = await fetch(`${AppConfig.API_URL}/admin/analytics/user-activity`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ApiTokens.getAccessToken() || localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Get user activity failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get feature engagement rates
   * @returns {Promise<Object>}
   */
  async getFeatureEngagement() {
    const response = await fetch(`${AppConfig.API_URL}/admin/analytics/feature-engagement`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ApiTokens.getAccessToken() || localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Get feature engagement failed: ${response.statusText}`);
    }

    return response.json();
  },

  // ===== API METRICS =====

  /**
   * Get API metrics
   * @returns {Promise<Object>}
   */
  async getAPIMetrics() {
    const response = await fetch(`${AppConfig.API_URL}/admin/metrics/api`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ApiTokens.getAccessToken() || localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Get API metrics failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get top endpoints
   * @param {number} limit - Number of endpoints
   * @returns {Promise<Array>}
   */
  async getTopEndpoints(limit = 10) {
    const response = await fetch(`${AppConfig.API_URL}/admin/metrics/top-endpoints?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ApiTokens.getAccessToken() || localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Get top endpoints failed: ${response.statusText}`);
    }

    return response.json();
  }
};

window.AdminAPI = AdminAPI;
