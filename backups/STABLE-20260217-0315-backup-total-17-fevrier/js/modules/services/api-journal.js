/**
 * API Journal Module v2.0
 * ProductiveApp
 *
 * ARCHITECTURE :
 * - Backend : 1 entrée par jour (UNIQUE user+workspace+date)
 * - Frontend : N entrées par jour (timeline)
 * - Solution : chaque mini-entrée stockée en JSON dans le JSONB `highlights`
 *   { id, text, category, energy, context, created_at }
 */

const ApiJournal = (function() {
    'use strict';

    function getWorkspaceId() {
        if (typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId) {
            return ApiTokens.getWorkspaceId();
        }
        return localStorage.getItem('workspace_id') || '';
    }

    function buildUrl(path) {
        path = path || '';
        const workspaceId = getWorkspaceId();
        if (!workspaceId) throw new Error('No workspace selected');
        return '/journal/workspace/' + workspaceId + path;
    }

    function todayStr() {
        return new Date().toISOString().split('T')[0];
    }

    function parseHighlights(highlights) {
        if (!Array.isArray(highlights)) return [];
        return highlights.map(function(h) {
            try { return typeof h === 'string' ? JSON.parse(h) : h; }
            catch(e) { return null; }
        }).filter(Boolean);
    }

    function miniId() {
        return 'je_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    }

    async function fetchDayEntry(date) {
        try {
            const response = await Api.get(buildUrl('/date/' + date));
            return response.data || null;
        } catch(e) {
            return null;
        }
    }

    /**
     * Obtenir les mini-entrées du jour depuis highlights
     */
    async function getTodayEntries() {
        const dayEntry = await fetchDayEntry(todayStr());
        if (!dayEntry) return [];
        return parseHighlights(dayEntry.highlights);
    }

    /**
     * Obtenir entrées sur une plage de dates (aplatit highlights)
     */
    async function getEntries(params) {
        params = params || {};
        const queryParams = new URLSearchParams();
        if (params.startDate) queryParams.set('start_date', params.startDate);
        if (params.endDate)   queryParams.set('end_date',   params.endDate);

        const query = queryParams.toString();
        const url = buildUrl('') + (query ? '?' + query : '');

        const response = await Api.get(url);
        const dayEntries = Array.isArray(response.data) ? response.data :
                           (Array.isArray(response) ? response : []);

        const miniEntries = [];
        dayEntries.forEach(function(day) {
            parseHighlights(day.highlights).forEach(function(e) {
                miniEntries.push(Object.assign({}, e, { date: day.date || e.date }));
            });
        });

        return miniEntries;
    }

    /**
     * Ajouter une mini-entrée (accumule dans highlights, pas d'écrasement)
     */
    async function upsertEntry(data) {
        var dateStr = data.date || todayStr();

        var miniEntry = {
            id:         miniId(),
            text:       (data.text || '').trim(),
            category:   data.category  || 'task',
            energy:     data.energy    || 2,
            context:    data.context   || 'general',
            created_at: new Date().toISOString()
        };

        if (!miniEntry.text) throw new Error('Texte requis');

        var existing = await fetchDayEntry(dateStr);
        var existingHighlights = parseHighlights(existing && existing.highlights);
        var existingTags = (existing && Array.isArray(existing.tags)) ? existing.tags : [];

        existingHighlights.push(miniEntry);

        if (existingTags.indexOf(miniEntry.category) === -1) {
            existingTags.push(miniEntry.category);
        }

        var contentText = existingHighlights.map(function(e) {
            return '[' + e.category + '] ' + e.text;
        }).join('\n');

        var backendPayload = {
            date:         dateStr,
            content:      contentText,
            energy_level: miniEntry.energy,
            tags:         existingTags,
            highlights:   existingHighlights
        };

        await Api.post(buildUrl(''), backendPayload);
        return miniEntry;
    }

    /**
     * Supprimer une mini-entrée par son ID
     */
    async function deleteEntry(id) {
        var dayEntry = await fetchDayEntry(todayStr());
        if (!dayEntry) return true;

        var highlights = parseHighlights(dayEntry.highlights).filter(function(e) {
            return e.id !== id;
        });

        await Api.put(buildUrl('/' + dayEntry.id), { highlights: highlights });
        return true;
    }

    /**
     * Statistiques
     */
    async function getStatistics(params) {
        params = params || {};
        var queryParams = new URLSearchParams();
        if (params.startDate) queryParams.set('start_date', params.startDate);
        if (params.endDate)   queryParams.set('end_date',   params.endDate);

        var query = queryParams.toString();
        var url = buildUrl('/statistics') + (query ? '?' + query : '');
        var response = await Api.get(url);
        return response.data;
    }

    function isAvailable() {
        return typeof Api !== 'undefined' &&
               typeof ApiTokens !== 'undefined' &&
               ApiTokens.isAuthenticated &&
               ApiTokens.isAuthenticated();
    }

    return {
        getEntries:     getEntries,
        getTodayEntries: getTodayEntries,
        upsertEntry:    upsertEntry,
        deleteEntry:    deleteEntry,
        getStatistics:  getStatistics,
        isAvailable:    isAvailable
    };
})();

if (typeof window !== 'undefined') {
    window.ApiJournal = ApiJournal;
}
