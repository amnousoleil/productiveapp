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
        'Authorization': `Bearer ${localStorage.getItem('productiveapp_token')}`
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
        'Authorization': `Bearer ${localStorage.getItem('productiveapp_token')}`
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
        'Authorization': `Bearer ${localStorage.getItem('productiveapp_token')}`
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
        'Authorization': `Bearer ${localStorage.getItem('productiveapp_token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Get recent activity failed: ${response.statusText}`);
    }

    return response.json();
  }
};

window.AdminAPI = AdminAPI;
