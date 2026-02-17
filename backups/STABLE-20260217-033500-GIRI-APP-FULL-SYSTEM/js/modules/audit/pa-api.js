/**
 * PSYCHO-AUDIT API - Backend integration
 * ProductiveApp v5.0
 */

const PaApi = (function() {
    'use strict';

    function getWorkspaceId() {
        if (typeof ApiTokens !== 'undefined') {
            return ApiTokens.getWorkspaceId();
        }
        return localStorage.getItem('workspace_id');
    }

    /**
     * Load audit history from API
     */
    async function loadHistory() {
        var workspaceId = getWorkspaceId();
        if (!workspaceId) {
            console.warn('PaApi: No workspace ID');
            return loadFromLocal();
        }

        try {
            var response = await Api.get('/audit/workspace/' + workspaceId + '/psycho');
            var raw = response.data;
            var audits = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.data) ? raw.data : []);
            // Normalize API response to local format
            return audits.map(function(a) {
                var ans = a.answers;
                if (typeof ans === 'string') { try { ans = JSON.parse(ans); } catch(e) { ans = {}; } }
                return {
                    id: a.id,
                    date: a.created_at || a.date,
                    score: a.score,
                    answers: ans || {}
                };
            });
        } catch (e) {
            console.warn('PaApi: API failed, using localStorage', e);
            return loadFromLocal();
        }
    }

    /**
     * Save audit to API + award XP
     */
    async function saveAudit(audit) {
        var workspaceId = getWorkspaceId();

        // Always save to localStorage as backup
        saveToLocal(audit);

        if (!workspaceId) {
            return audit;
        }

        try {
            // Save audit
            var response = await Api.post('/audit/workspace/' + workspaceId + '/psycho', {
                score: audit.score,
                answers: audit.answers,
                textResponses: audit.textResponses || {},
                date: audit.date
            });

            // Award XP for completing audit
            await awardXP(workspaceId);

            return response.data?.data || response.data?.audit || audit;
        } catch (e) {
            console.warn('PaApi: Save failed', e);
            return audit;
        }
    }

    /**
     * Award XP after completing audit
     */
    async function awardXP(workspaceId) {
        try {
            await Api.post('/gamification/workspace/' + workspaceId + '/xp', {
                reason: 'audit_completed',
                amount: 20
            });
            console.log('🎮 PaApi: +20 XP awarded for audit');
        } catch (e) {
            console.warn('PaApi: XP award failed', e);
        }
    }

    // ========== LocalStorage fallback ==========

    function loadFromLocal() {
        try {
            var data = localStorage.getItem(PaState.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function saveToLocal(audit) {
        try {
            var audits = loadFromLocal();
            audits.unshift(audit);
            if (audits.length > 30) {
                audits = audits.slice(0, 30);
            }
            localStorage.setItem(PaState.STORAGE_KEY, JSON.stringify(audits));
        } catch (e) {
            console.warn('PaApi: localStorage save failed', e);
        }
    }

    return {
        loadHistory: loadHistory,
        saveAudit: saveAudit,
        loadFromLocal: loadFromLocal
    };
})();

if (typeof window !== 'undefined') {
    window.PaApi = PaApi;
}
