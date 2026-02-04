/**
 * API Accounting Module
 * ProductiveApp v4.0 - Module Comptabilite
 */

const AccountingApi = (function() {
    'use strict';

    const WORKSPACE_ID = 'fd92221a-aaa2-42c9-9d06-f158b5adccc3';

    function buildUrl(path) {
        return `/accounting/workspace/${WORKSPACE_ID}${path}`;
    }

    /**
     * Get dashboard stats (totals, balance, invoice count)
     */
    async function getDashboard(year) {
        const query = year ? `?year=${year}` : '';
        const response = await Api.get(buildUrl('/analytics/dashboard') + query);
        return response || {};
    }

    /**
     * Get monthly analytics
     */
    async function getMonthlyAnalytics(month, year) {
        const params = new URLSearchParams();
        if (month) params.set('month', month);
        if (year) params.set('year', year);
        const query = params.toString();
        const response = await Api.get(buildUrl('/analytics/monthly') + (query ? `?${query}` : ''));
        return response || {};
    }

    /**
     * Get TVA summary
     */
    async function getTVASummary(year, quarter) {
        const params = new URLSearchParams();
        if (year) params.set('year', year);
        if (quarter) params.set('quarter', quarter);
        const query = params.toString();
        const response = await Api.get(buildUrl('/analytics/tva') + (query ? `?${query}` : ''));
        return response || {};
    }

    /**
     * Get all categories
     */
    async function getCategories() {
        const response = await Api.get(buildUrl('/categories'));
        return Array.isArray(response) ? response : [];
    }

    /**
     * Create category
     */
    async function createCategory(data) {
        const response = await Api.post(buildUrl('/categories'), data);
        return response;
    }

    /**
     * Get invoices with filters
     */
    async function getInvoices(filters = {}) {
        const params = new URLSearchParams();
        if (filters.type) params.set('type', filters.type);
        if (filters.status) params.set('status', filters.status);
        if (filters.category_id) params.set('category_id', filters.category_id);
        if (filters.date_from) params.set('date_from', filters.date_from);
        if (filters.date_to) params.set('date_to', filters.date_to);
        if (filters.search) params.set('search', filters.search);
        if (filters.page) params.set('page', filters.page);
        if (filters.limit) params.set('limit', filters.limit);
        const query = params.toString();
        const response = await Api.get(buildUrl('/invoices') + (query ? `?${query}` : ''));
        return response || { data: [], total: 0 };
    }

    /**
     * Get single invoice
     */
    async function getInvoice(id) {
        const response = await Api.get(buildUrl(`/invoices/${id}`));
        return response;
    }

    /**
     * Create invoice
     */
    async function createInvoice(data) {
        const response = await Api.post(buildUrl('/invoices'), data);
        return response;
    }

    /**
     * Update invoice
     */
    async function updateInvoice(id, data) {
        const response = await Api.put(buildUrl(`/invoices/${id}`), data);
        return response;
    }

    /**
     * Delete invoice
     */
    async function deleteInvoice(id) {
        const response = await Api.del(buildUrl(`/invoices/${id}`));
        return response;
    }

    /**
     * Validate invoice
     */
    async function validateInvoice(id) {
        const response = await Api.post(buildUrl(`/invoices/${id}/validate`));
        return response;
    }

    return {
        getDashboard,
        getMonthlyAnalytics,
        getTVASummary,
        getCategories,
        createCategory,
        getInvoices,
        getInvoice,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        validateInvoice
    };
})();

if (typeof window !== 'undefined') {
    window.AccountingApi = AccountingApi;
}
