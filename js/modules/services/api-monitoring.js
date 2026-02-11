/**
 * API Monitoring Service
 * Appels vers /api/v1/monitoring
 */

const ApiMonitoring = (function() {
    'use strict';

    const BASE_URL = '/api/v1/monitoring';

    /**
     * Get health check
     */
    async function getHealth() {
        const response = await fetch(`${BASE_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get recent errors (admin)
     */
    async function getErrors(limit = 100, offset = 0) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${BASE_URL}/errors?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get error stats (admin)
     */
    async function getErrorStats(hours = 24) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${BASE_URL}/errors/stats?hours=${hours}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get active alerts (admin)
     */
    async function getAlerts() {
        const token = localStorage.getItem('token');

        const response = await fetch(`${BASE_URL}/alerts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Cleanup old logs (admin)
     */
    async function cleanup() {
        const token = localStorage.getItem('token');

        const response = await fetch(`${BASE_URL}/cleanup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
    }

    return {
        getHealth,
        getErrors,
        getErrorStats,
        getAlerts,
        cleanup,
    };
})();

if (typeof window !== 'undefined') {
    window.ApiMonitoring = ApiMonitoring;
}
