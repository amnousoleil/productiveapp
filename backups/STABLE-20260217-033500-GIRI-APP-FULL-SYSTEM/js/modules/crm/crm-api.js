/**
 * CRMApi - API du module CRM Pipeline
 */
const CRMApi = (function() {
    'use strict';

    function getWorkspaceId() {
        if (typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId) return ApiTokens.getWorkspaceId();
        return localStorage.getItem('workspace_id') || '';
    }
    function buildUrl(path) { return '/crm/workspace/' + getWorkspaceId() + path; }
    function bq(p) {
        if (!p) return '';
        var parts = [];
        Object.keys(p).forEach(function(k) { if (p[k] !== undefined && p[k] !== null && p[k] !== '') parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(p[k])); });
        return parts.length ? '?' + parts.join('&') : '';
    }

    // Pipelines
    async function getPipelines() { return Api.get(buildUrl('/pipelines')); }
    async function createPipeline(data) { return Api.post(buildUrl('/pipelines'), data); }
    async function updatePipeline(id, data) { return Api.put(buildUrl('/pipelines/' + id), data); }

    // Deals
    async function listDeals(filters) {
        var p = {};
        if (filters) {
            if (filters.stage) p.stage = filters.stage;
            if (filters.contactId) p.contact_id = filters.contactId;
            if (filters.memberId) p.member_id = filters.memberId;
            if (filters.search) p.search = filters.search;
            if (filters.page) p.page = filters.page;
            if (filters.limit) p.limit = filters.limit;
        }
        return Api.get(buildUrl('/deals') + bq(p));
    }
    async function getDeal(id) { return Api.get(buildUrl('/deals/' + id)); }
    async function createDeal(data) { return Api.post(buildUrl('/deals'), data); }
    async function updateDeal(id, data) { return Api.put(buildUrl('/deals/' + id), data); }
    async function deleteDeal(id) { return Api.del(buildUrl('/deals/' + id)); }
    async function moveDeal(id, stage, probability) { return Api.post(buildUrl('/deals/' + id + '/move'), { stage: stage, probability: probability }); }
    async function convertDeal(id) { return Api.post(buildUrl('/deals/' + id + '/convert')); }
    async function getDealBoard() { return Api.get(buildUrl('/deals/board')); }

    // Activities
    async function listActivities(dealId) { return Api.get(buildUrl('/deals/' + dealId + '/activities')); }
    async function addActivity(dealId, data) { return Api.post(buildUrl('/deals/' + dealId + '/activities'), data); }

    // Stats
    async function getStats() { return Api.get(buildUrl('/stats')); }

    return {
        getPipelines: getPipelines, createPipeline: createPipeline, updatePipeline: updatePipeline,
        listDeals: listDeals, getDeal: getDeal, createDeal: createDeal, updateDeal: updateDeal,
        deleteDeal: deleteDeal, moveDeal: moveDeal, convertDeal: convertDeal, getDealBoard: getDealBoard,
        listActivities: listActivities, addActivity: addActivity,
        getStats: getStats
    };
})();
if (typeof window !== 'undefined') window.CRMApi = CRMApi;
