/**
 * API Reports AI Module
 * ProductiveApp v4.0
 *
 * Connects to the backend AI Reports service
 */

const ApiReportsAi = (function() {
    'use strict';

    /**
     * Generate a new AI report
     * @param {Object} options - Generation options
     * @param {string} options.report_type - 'standard', 'audit', or 'meta_synthesis'
     * @param {string} options.period_type - 'week', 'month', or 'year'
     * @param {string} options.title - Custom title (optional)
     * @param {string} options.custom_prompt - Custom focus areas (optional)
     * @returns {Promise<Object>} - Generated report
     */
    async function generate(options = {}) {
        const workspaceId = ApiTokens.getWorkspaceId();

        const response = await Api.post('/reports/ai/generate', {
            report_type: options.report_type || 'standard',
            period_type: options.period_type || 'week',
            title: options.title,
            custom_prompt: options.custom_prompt,
            workspace_id: workspaceId
        });

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.error?.message || 'Failed to generate report');
    }

    /**
     * Generate an audit report (behavioral analysis)
     * @param {Object} options - Audit options
     * @returns {Promise<Object>} - Audit report
     */
    async function generateAudit(options = {}) {
        return generate({
            ...options,
            report_type: 'audit'
        });
    }

    /**
     * Generate meta-synthesis (analysis of multiple reports)
     * @param {Object} options - Meta-synthesis options
     * @param {string[]} options.report_ids - Specific report IDs to analyze
     * @param {string} options.period_type - Period to analyze
     * @param {string[]} options.focus_areas - Areas to focus on
     * @returns {Promise<Object>} - Meta-synthesis report
     */
    async function generateMetaSynthesis(options = {}) {
        const workspaceId = ApiTokens.getWorkspaceId();

        const response = await Api.post('/reports/ai/meta-synthesis', {
            report_ids: options.report_ids,
            period_type: options.period_type || 'month',
            focus_areas: options.focus_areas,
            workspace_id: workspaceId
        });

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.error?.message || 'Failed to generate meta-synthesis');
    }

    /**
     * Get list of AI reports
     * @param {Object} params - Query params
     * @returns {Promise<Object>} - { reports: [], total: number }
     */
    async function list(params = {}) {
        const workspaceId = ApiTokens.getWorkspaceId();

        const queryParams = new URLSearchParams({
            workspace_id: workspaceId,
            ...(params.page && { page: params.page }),
            ...(params.limit && { limit: params.limit }),
            ...(params.report_type && { report_type: params.report_type }),
            ...(params.from && { from: params.from }),
            ...(params.to && { to: params.to })
        });

        const response = await Api.get(`/reports/ai?${queryParams}`);

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.error?.message || 'Failed to fetch reports');
    }

    /**
     * Get a single report by ID
     * @param {string} reportId - Report ID
     * @returns {Promise<Object>} - Report data
     */
    async function getById(reportId) {
        const workspaceId = ApiTokens.getWorkspaceId();

        const response = await Api.get(`/reports/ai/${reportId}?workspace_id=${workspaceId}`);

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.error?.message || 'Report not found');
    }

    /**
     * Get visualization data for charts
     * @param {string} periodType - 'week', 'month', or 'year'
     * @returns {Promise<Object>} - Chart data
     */
    async function getVisualizations(periodType = 'week') {
        const workspaceId = ApiTokens.getWorkspaceId();

        const response = await Api.get(`/reports/ai/visualizations?period_type=${periodType}&workspace_id=${workspaceId}`);

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.error?.message || 'Failed to fetch visualizations');
    }

    /**
     * Check if API is available
     */
    function isAvailable() {
        return typeof Api !== 'undefined' &&
               typeof ApiTokens !== 'undefined' &&
               ApiTokens.isAuthenticated();
    }

    return {
        generate,
        generateAudit,
        generateMetaSynthesis,
        list,
        getById,
        getVisualizations,
        isAvailable
    };
})();

if (typeof window !== 'undefined') {
    window.ApiReportsAi = ApiReportsAi;
}
