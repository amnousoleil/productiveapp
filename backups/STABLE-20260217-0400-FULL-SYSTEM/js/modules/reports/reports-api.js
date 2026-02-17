/**
 * REPORTS API - ProductiveApp v4.0
 * Appels API pour le module Rapports
 */

const ReportsApi = (function() {
    'use strict';

    function getWorkspaceId() {
        if (typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId) {
            return ApiTokens.getWorkspaceId();
        }
        return localStorage.getItem('workspace_id') || '';
    }

    /**
     * Charger le resume (summary)
     */
    async function fetchSummary(periodType) {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) {
            return { success: false, error: 'Workspace non selectionne' };
        }

        try {
            const response = await ApiFetch.fetchWithAuth(
                `/reports/workspace/${workspaceId}/summary?period=${periodType}`
            );
            return response;
        } catch (error) {
            console.error('ReportsApi: Error fetching summary', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Charger la liste des rapports
     */
    async function fetchReports(periodType, limit) {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) {
            return { success: false, data: [] };
        }

        try {
            const response = await ApiFetch.fetchWithAuth(
                `/reports/workspace/${workspaceId}?period_type=${periodType}&limit=${limit || 20}`
            );
            return response;
        } catch (error) {
            console.error('ReportsApi: Error fetching reports', error);
            return { success: false, data: [] };
        }
    }

    /**
     * Generer un nouveau rapport
     */
    async function generateReport(periodType) {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) {
            return { success: false, error: 'Workspace non selectionne' };
        }

        try {
            const response = await ApiFetch.fetchWithAuth(
                `/reports/workspace/${workspaceId}/generate`,
                {
                    method: 'POST',
                    body: JSON.stringify({ period_type: periodType })
                }
            );
            return response;
        } catch (error) {
            console.error('ReportsApi: Error generating report', error);
            return { success: false, error: error.message };
        }
    }

    return {
        getWorkspaceId,
        fetchSummary,
        fetchReports,
        generateReport
    };
})();

if (typeof window !== 'undefined') {
    window.ReportsApi = ReportsApi;
}
