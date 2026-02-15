/**
 * TimeTrackingApi - API du module Time Tracking
 * Chronometre, entrees manuelles, rapports, tarification
 */
const TimeTrackingApi = (function() {
    'use strict';

    function getWorkspaceId() {
        if (typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId) {
            return ApiTokens.getWorkspaceId();
        }
        return localStorage.getItem('workspace_id') || '';
    }

    function buildUrl(path) {
        return '/time-tracking/workspace/' + getWorkspaceId() + path;
    }

    function buildQuery(params) {
        if (!params) return '';
        var parts = [];
        Object.keys(params).forEach(function(key) {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
            }
        });
        return parts.length > 0 ? '?' + parts.join('&') : '';
    }

    // Timer
    async function startTimer(data) {
        return Api.post(buildUrl('/start'), data || {});
    }

    async function stopTimer() {
        return Api.post(buildUrl('/stop'));
    }

    async function getRunningTimer() {
        return Api.get(buildUrl('/running'));
    }

    // Entries
    async function createEntry(data) {
        return Api.post(buildUrl('/'), data);
    }

    async function updateEntry(id, data) {
        return Api.put(buildUrl('/' + id), data);
    }

    async function deleteEntry(id) {
        return Api.del(buildUrl('/' + id));
    }

    async function listEntries(filters) {
        var params = {};
        if (filters) {
            if (filters.memberId) params.member_id = filters.memberId;
            if (filters.taskId) params.task_id = filters.taskId;
            if (filters.projectId) params.project_id = filters.projectId;
            if (filters.dateFrom) params.date_from = filters.dateFrom;
            if (filters.dateTo) params.date_to = filters.dateTo;
            if (filters.isBillable !== undefined) params.is_billable = filters.isBillable;
            if (filters.page) params.page = filters.page;
            if (filters.limit) params.limit = filters.limit;
        }
        return Api.get(buildUrl('/') + buildQuery(params));
    }

    // Reports
    async function getTimeReport(filters) {
        var params = {};
        if (filters) {
            if (filters.dateFrom) params.date_from = filters.dateFrom;
            if (filters.dateTo) params.date_to = filters.dateTo;
            if (filters.groupBy) params.group_by = filters.groupBy;
            if (filters.memberId) params.member_id = filters.memberId;
            if (filters.projectId) params.project_id = filters.projectId;
        }
        return Api.get(buildUrl('/report') + buildQuery(params));
    }

    // Rates
    async function getMemberRate() {
        return Api.get(buildUrl('/rate'));
    }

    async function setMemberRate(rate, currency) {
        return Api.put(buildUrl('/rate'), { hourly_rate: rate, currency: currency || 'EUR' });
    }

    // Unbilled
    async function getUnbilled(filters) {
        var params = {};
        if (filters) {
            if (filters.projectId) params.project_id = filters.projectId;
            if (filters.dateFrom) params.date_from = filters.dateFrom;
            if (filters.dateTo) params.date_to = filters.dateTo;
        }
        return Api.get(buildUrl('/unbilled') + buildQuery(params));
    }

    async function linkToInvoice(entryIds, invoiceId) {
        return Api.post(buildUrl('/link-invoice'), { entry_ids: entryIds, invoice_id: invoiceId });
    }

    return {
        startTimer: startTimer,
        stopTimer: stopTimer,
        getRunningTimer: getRunningTimer,
        createEntry: createEntry,
        updateEntry: updateEntry,
        deleteEntry: deleteEntry,
        listEntries: listEntries,
        getTimeReport: getTimeReport,
        getMemberRate: getMemberRate,
        setMemberRate: setMemberRate,
        getUnbilled: getUnbilled,
        linkToInvoice: linkToInvoice
    };
})();

if (typeof window !== 'undefined') {
    window.TimeTrackingApi = TimeTrackingApi;
}
